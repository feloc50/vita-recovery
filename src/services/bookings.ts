import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

export interface Booking {
  id?: string;
  userId: string;
  locationId: number;
  serviceId: number;
  professionalId: number;
  date: Date;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}

export async function createBooking(
  user: User,
  locationId: number,
  serviceId: number,
  professionalId: number,
  date: Date,
  time: string
): Promise<string> {
  const booking: Omit<Booking, 'id'> = {
    userId: user.uid,
    locationId,
    serviceId,
    professionalId,
    date,
    time,
    status: 'confirmed',
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return docRef.id;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt.toDate()
  } as Booking));
}