import { NextRequest, NextResponse } from 'next/server';
import { fetchCourses, getNewCourses } from '@/lib/scraper';
import { filterMatchingCourses, formatCourseForEmail } from '@/lib/courses';
import { UserConfig, Course } from '@/types';
import nodemailer from 'nodemailer';
import { kv } from '@vercel/kv';

// Pour Vercel Cron
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Vérifier le secret pour le cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Récupérer les cours actuels
    const courses = await fetchCourses();

    if (courses.length === 0) {
      return NextResponse.json({
        message: 'Aucun cours trouvé',
        timestamp: new Date().toISOString()
      });
    }

    // Récupérer les IDs des cours précédents depuis KV
    let previousCourseIds: string[] = [];
    try {
      previousCourseIds = await kv.get<string[]>('previous-course-ids') || [];
    } catch {
      // KV pas configuré, continuer sans historique
    }

    // Identifier les nouveaux cours
    const newCourses = await getNewCourses(courses, previousCourseIds);

    // Sauvegarder les IDs actuels
    try {
      await kv.set('previous-course-ids', courses.map(c => c.id));
    } catch {
      // KV pas configuré
    }

    // Récupérer les configurations utilisateurs
    let userConfigs: UserConfig[] = [];
    try {
      userConfigs = await kv.get<UserConfig[]>('user-configs') || [];
    } catch {
      // KV pas configuré
    }

    // Envoyer des notifications pour chaque utilisateur
    const notifications: { email: string; coursesCount: number }[] = [];

    for (const config of userConfigs) {
      if (!config.email || !config.notifyOnNewCourse) continue;

      // Filtrer les nouveaux cours qui correspondent aux disponibilités
      const matchingCourses = filterMatchingCourses(newCourses, config);

      if (matchingCourses.length > 0) {
        await sendNotification(config.email, matchingCourses);
        notifications.push({
          email: config.email,
          coursesCount: matchingCourses.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalCourses: courses.length,
      newCourses: newCourses.length,
      notificationsSent: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur check-courses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des cours' },
      { status: 500 }
    );
  }
}

async function sendNotification(email: string, courses: Course[]) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('Configuration SMTP manquante');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const courseList = courses.map(formatCourseForEmail).join('\n');

  await transporter.sendMail({
    from: `"Gym Tracker" <${SMTP_USER}>`,
    to: email,
    subject: `🏋️ ${courses.length} nouveau(x) cours disponible(s) - Gym du Plateau`,
    text: `Bonjour,

De nouveaux cours correspondent à vos disponibilités :

${courseList}

Réservez vite sur : https://gymduplateau.com/fr/horaire/

---
Gym Tracker`,
    html: `
      <h2>Nouveaux cours disponibles !</h2>
      <p>De nouveaux cours correspondent à vos disponibilités :</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        ${courses.map(c => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
            <strong>${c.name}</strong><br>
            📅 ${c.date}<br>
            🕐 ${c.startTime} - ${c.endTime}<br>
            👤 ${c.instructor}<br>
            🎫 ${c.spotsAvailable} place(s) disponible(s)
          </div>
        `).join('')}
      </div>
      <p><a href="https://gymduplateau.com/fr/horaire/" style="background: #0088cc; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Réserver maintenant</a></p>
    `,
  });
}
