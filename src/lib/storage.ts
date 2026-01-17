import { UserConfig } from '@/types';

const STORAGE_KEY = 'gym-tracker-config';

export function getConfig(): UserConfig | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: UserConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getDefaultConfig(): UserConfig {
  return {
    email: '',
    availability: [],
    notifyOnNewCourse: true,
  };
}
