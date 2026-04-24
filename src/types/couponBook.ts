import { Timestamp } from 'firebase/firestore';

export interface CouponBook {
  id: string;
  clientId: string;
  serviceId: string;
  totalSessions: number;
  remainingSessions: number;
  price: number;
  status: 'active' | 'completed' | 'expired';
  expirationDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateCouponBookData = Omit<CouponBook, 'id' | 'createdAt' | 'updatedAt'>;