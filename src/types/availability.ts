export type RecurrenceType = 'date' | 'weekday' | 'week';

// Using numbers 1-5 for Monday-Friday (following JavaScript's Date.getDay() convention)
export type WeekDay = 1 | 2 | 3 | 4 | 5;

export interface AvailabilityBlock {
  id: string;
  professionalId: string;
  type: RecurrenceType;
  startDate: Timestamp;
  endDate: Timestamp;
  startTime: string;
  endTime: string;
  weekDays?: WeekDay[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateAvailabilityBlockData = Omit<AvailabilityBlock, 'id' | 'createdAt' | 'updatedAt'>;