import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format, parseISO } from 'date-fns';
import { Appointment, CreateAppointmentData } from '../types/appointment';

export async function createAppointment(data: Omit<CreateAppointmentData, 'date' | 'createdAt' | 'updatedAt'> & { date: string }): Promise<string> {
  try {
    const appointmentData = {
      ...data,
      date: Timestamp.fromDate(parseISO(data.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function fetchUserAppointments(userId: string, includeCancelled = false): Promise<Appointment[]> {
  try {
    const appointmentsRef = collection(db, 'appointments');
    const constraints = [where('userId', '==', userId)];
    
    if (!includeCancelled) {
      constraints.push(where('status', '==', 'confirmed'));
    }
    
    const q = query(appointmentsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Appointment));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

// Helper function to check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const adminDocRef = doc(db, 'adminUsers', userId);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists() && adminDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function cancelAppointment(appointmentId: string, userId: string): Promise<void> {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);

    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointmentSnap.data();
    const isAdmin = await isUserAdmin(userId);

    console.log(isAdmin);
    if (appointmentData.userId !== userId && isAdmin) {
      console.log("aca rompio",appointmentData.userId,userId); 
      throw new Error('Unauthorized access');
    }

    if (appointmentData.status === 'cancelled') {
      throw new Error('Appointment is already cancelled');
    }

    await updateDoc(appointmentRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}