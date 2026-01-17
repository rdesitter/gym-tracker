export interface TimeSlot {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface DayAvailability {
  day: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  slots: TimeSlot[];
}

export interface UserConfig {
  email: string;
  availability: DayAvailability[];
  notifyOnNewCourse: boolean;
  lastChecked?: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  date: string;
  startTime: string;
  endTime: string;
  spotsAvailable: number;
  location?: string;
}

export interface CheckResult {
  newCourses: Course[];
  matchingCourses: Course[];
  timestamp: string;
}

export const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
] as const;
