import { Appointment } from './appointment';
import { Professional } from './professional';

export interface CalendarSlot {
  time: string;
  appointments: AppointmentWithColor[];
}

export interface AppointmentWithColor {
  appointment: Appointment;
  professional: Professional;
  color: string;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: string;
}