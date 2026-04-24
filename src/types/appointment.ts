import { Timestamp } from 'firebase/firestore';

export interface Appointment {
  id: string;
  userId: string;
  locationId: string;
  serviceId: string;
  professionalId: string;
  date: Timestamp;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateAppointmentData = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;