import { WeekDay } from '../types/availability';
import { isWeekend, getDay } from 'date-fns';

export function getAllBusinessHours(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });
}

export function isTimeWithinRange(time: string, startTime: string, endTime: string): boolean {
  const [timeHour, timePeriod] = time.split(' ');
  const [startHour, startPeriod] = startTime.split(' ');
  const [endHour, endPeriod] = endTime.split(' ');

  const timeValue = convertTo24Hour(timeHour, timePeriod);
  const startValue = convertTo24Hour(startHour, startPeriod);
  const endValue = convertTo24Hour(endHour, endPeriod);

  return timeValue >= startValue && timeValue <= endValue;
}

export function convertTo24Hour(hour: string, period: string): number {
  let hourNum = parseInt(hour);
  if (period === 'PM' && hourNum !== 12) hourNum += 12;
  if (period === 'AM' && hourNum === 12) hourNum = 0;
  return hourNum;
}

export function getCurrentWeekDay(date: Date): WeekDay {
  return getDay(date) as WeekDay;
}

export function isWeekendDay(date: Date): boolean {
  return isWeekend(date);
}