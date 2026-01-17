import axios from 'axios';
import * as cheerio from 'cheerio';
import { Course } from '@/types';

const WIDGET_URL = 'https://www.gorendezvous.com/BookingWidget/?companyId=108450&classesOnly=1&culture=fr-CA';

export async function fetchCourses(): Promise<Course[]> {
  try {
    // GoRendezVous utilise une API JSON pour charger les cours
    // On va essayer de récupérer les données via leur API interne
    const apiUrl = 'https://www.gorendezvous.com/api/booking/classes';

    const response = await axios.get(apiUrl, {
      params: {
        companyId: 108450,
        culture: 'fr-CA',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GymTracker/1.0)',
      },
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any, index: number) => ({
        id: item.id?.toString() || `course-${index}`,
        name: item.className || item.name || 'Cours',
        instructor: item.professionalName || item.instructor || 'N/A',
        date: item.date || item.startDate?.split('T')[0] || '',
        startTime: formatTime(item.startTime || item.startDate),
        endTime: formatTime(item.endTime || item.endDate),
        spotsAvailable: item.spotsAvailable ?? item.availableSpots ?? 0,
        location: item.location || item.locationName || '',
      }));
    }

    return [];
  } catch (error) {
    console.error('Erreur API GoRendezVous:', error);
    // Fallback: essayer de scraper le HTML du widget
    return await scrapeFallback();
  }
}

async function scrapeFallback(): Promise<Course[]> {
  try {
    const response = await axios.get(WIDGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GymTracker/1.0)',
      },
    });

    const $ = cheerio.load(response.data);
    const courses: Course[] = [];

    // Tenter d'extraire les données du script inline
    $('script').each((_, script) => {
      const content = $(script).html() || '';
      if (content.includes('classes') || content.includes('events')) {
        try {
          // Chercher des patterns JSON dans le script
          const jsonMatch = content.match(/(?:classes|events)\s*[=:]\s*(\[[\s\S]*?\]);?/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            data.forEach((item: any, index: number) => {
              courses.push({
                id: item.id?.toString() || `course-${index}`,
                name: item.name || item.className || 'Cours',
                instructor: item.professional || item.instructor || 'N/A',
                date: item.date || '',
                startTime: item.startTime || '',
                endTime: item.endTime || '',
                spotsAvailable: item.spots || 0,
              });
            });
          }
        } catch {
          // Ignorer les erreurs de parsing
        }
      }
    });

    return courses;
  } catch (error) {
    console.error('Erreur scraping fallback:', error);
    return [];
  }
}

function formatTime(dateTimeOrTime: string): string {
  if (!dateTimeOrTime) return '';

  // Si c'est déjà un format HH:mm
  if (/^\d{2}:\d{2}$/.test(dateTimeOrTime)) {
    return dateTimeOrTime;
  }

  // Si c'est un ISO datetime
  try {
    const date = new Date(dateTimeOrTime);
    return date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateTimeOrTime;
  }
}

export async function getNewCourses(
  currentCourses: Course[],
  previousCourseIds: string[]
): Promise<Course[]> {
  return currentCourses.filter(course => !previousCourseIds.includes(course.id));
}
