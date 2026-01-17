import { NextRequest, NextResponse } from 'next/server';
import { UserConfig } from '@/types';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  try {
    const configs = await kv.get<UserConfig[]>('user-configs') || [];
    const userConfig = configs.find(c => c.email === email);

    return NextResponse.json({ config: userConfig || null });
  } catch {
    return NextResponse.json({ config: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: UserConfig = await request.json();

    if (!config.email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    let configs: UserConfig[] = [];
    try {
      configs = await kv.get<UserConfig[]>('user-configs') || [];
    } catch {
      // KV pas configuré
    }

    // Mettre à jour ou ajouter la config
    const existingIndex = configs.findIndex(c => c.email === config.email);
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }

    try {
      await kv.set('user-configs', configs);
    } catch (error) {
      console.error('Erreur sauvegarde KV:', error);
      return NextResponse.json(
        { error: 'Vercel KV non configuré. La config est sauvegardée localement uniquement.' },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur config:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  try {
    const configs = await kv.get<UserConfig[]>('user-configs') || [];
    const filtered = configs.filter(c => c.email !== email);
    await kv.set('user-configs', filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
