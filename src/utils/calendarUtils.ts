import { format, startOfWeek, addDays } from 'date-fns';
import { WeekDay } from '../types/calendar';

// Generate business hours from 7 AM to 8 PM
export function getBusinessHours(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });
}

// Generate array of weekdays for the calendar header
export function getWeekDays(currentDate: Date): WeekDay[] {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  
  return Array.from({ length: 5 }, (_, i) => { // Only weekdays
    const date = addDays(start, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    };
  });
}

// Generate unique colors for professionals
export function generateProfessionalColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  
  return colors[index % colors.length];
}