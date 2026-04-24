import { Timestamp } from 'firebase/firestore';
import { AvailabilityBlock, WeekDay } from '../types/availability';
import { isWithinInterval } from 'date-fns';
import { getAllBusinessHours, isTimeWithinRange } from './timeUtils';

export function getAvailableTimesForBlock(block: AvailabilityBlock): string[] {
  const businessHours = getAllBusinessHours();
  return businessHours.filter(time => 
    isTimeWithinRange(time, block.startTime, block.endTime)
  );
}

export function isBlockApplicableForDate(block: AvailabilityBlock, date: Date, dayOfWeek: WeekDay): boolean {
  const blockStart = block.startDate instanceof Timestamp ? 
    block.startDate.toDate() : 
    new Date(block.startDate);
  
  const blockEnd = block.endDate instanceof Timestamp ? 
    block.endDate.toDate() : 
    new Date(block.endDate);

  switch (block.type) {
    case 'date':
      return isWithinInterval(date, { start: blockStart, end: blockEnd });
    case 'weekday':
      return block.weekDays?.includes(dayOfWeek) ?? false;
    case 'week':
      return isWithinInterval(date, { start: blockStart, end: blockEnd });
    default:
      return false;
  }
}