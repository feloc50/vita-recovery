import { collection, query, where, getDocs, addDoc, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AvailabilityBlock, CreateAvailabilityBlockData } from '../types/availability';
import { isSameDay, parseISO } from 'date-fns';
import { getAllBusinessHours, getCurrentWeekDay, isWeekendDay } from '../utils/timeUtils';
import { getAvailableTimesForBlock, isBlockApplicableForDate } from '../utils/availabilityUtils';

export async function createAvailabilityBlock(data: CreateAvailabilityBlockData): Promise<string> {
  try {
    // Parse the dates using parseISO to ensure correct date handling
    const startDate = parseISO(data.startDate);
    const endDate = parseISO(data.endDate);

    const blockData = {
      ...data,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'professionalAvailability'), blockData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating availability block:', error);
    throw error;
  }
}

export async function updateAvailabilityBlock(id: string, data: Partial<AvailabilityBlock>): Promise<void> {
  try {
    const docRef = doc(db, 'professionalAvailability', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating availability block:', error);
    throw error;
  }
}

export async function deleteAvailabilityBlock(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'professionalAvailability', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting availability block:', error);
    throw error;
  }
}

export async function getProfessionalAvailabilityBlocks(professionalId: string): Promise<AvailabilityBlock[]> {
  try {
    const q = query(
      collection(db, 'professionalAvailability'),
      where('professionalId', '==', professionalId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AvailabilityBlock));
  } catch (error) {
    console.error('Error getting availability blocks:', error);
    throw error;
  }
}

export async function getBookedTimeSlots(professionalId: string, date: Date): Promise<string[]> {
  try {
    // If it's a weekend, all slots are unavailable by default
    if (isWeekendDay(date)) {
      return getAllBusinessHours();
    }

    // Get all availability blocks for the professional
    const availabilityBlocks = await getProfessionalAvailabilityBlocks(professionalId);
    const dayOfWeek = getCurrentWeekDay(date);
    
    // Find applicable availability blocks for this date
    const applicableBlocks = availabilityBlocks.filter(block => 
      isBlockApplicableForDate(block, date, dayOfWeek)
    );

    // If no availability blocks found, all times are unavailable
    if (applicableBlocks.length === 0) {
      return getAllBusinessHours();
    }

    // Get all available times from applicable blocks
    const availableTimes = new Set<string>();
    applicableBlocks.forEach(block => {
      getAvailableTimesForBlock(block).forEach(time => availableTimes.add(time));
    });

    // Get booked appointments
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('professionalId', '==', professionalId),
      where('status', '==', 'confirmed')
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    // Remove booked times from available times
    appointmentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.date && isSameDay(data.date.toDate(), date)) {
        availableTimes.delete(data.time);
      }
    });

    // Return all times that are NOT available
    const allBusinessHours = getAllBusinessHours();
    return allBusinessHours.filter(time => !availableTimes.has(time));
  } catch (error) {
    console.error('Error getting booked time slots:', error);
    throw error;
  }
}