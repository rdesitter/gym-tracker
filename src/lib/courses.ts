import { Course, UserConfig, DayAvailability } from '@/types';

export function isCourseDuringAvailability(
  course: Course,
  availability: DayAvailability[]
): boolean {
  const courseDate = new Date(course.date);
  const dayOfWeek = courseDate.getDay();

  const dayConfig = availability.find(a => a.day === dayOfWeek);
  if (!dayConfig || dayConfig.slots.length === 0) return false;

  const courseStart = timeToMinutes(course.startTime);
  const courseEnd = timeToMinutes(course.endTime);

  return dayConfig.slots.some(slot => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    return courseStart >= slotStart && courseEnd <= slotEnd;
  });
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function filterMatchingCourses(
  courses: Course[],
  config: UserConfig
): Course[] {
  return courses.filter(course =>
    isCourseDuringAvailability(course, config.availability)
  );
}

export function formatCourseForEmail(course: Course): string {
  return `
📅 ${course.name}
   Date: ${course.date}
   Heure: ${course.startTime} - ${course.endTime}
   Instructeur: ${course.instructor}
   Places disponibles: ${course.spotsAvailable}
`;
}
