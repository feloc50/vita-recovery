import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Service, CreateServiceData } from '../types/service';

export async function createService(data: CreateServiceData): Promise<string> {
  try {
    const serviceData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'services'), serviceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function getServiceById(id: string | undefined): Promise<Service | null> {
  try {
    if (!id) {
      console.warn('No service ID provided to getServiceById');
      return null;
    }

    const docRef = doc(db, 'services', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Service;
  } catch (error) {
    console.error('Error getting service:', error);
    return null;
  }
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  try {
    const docRef = doc(db, 'services', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  try {
    const q = query(collection(db, 'services'), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Service));
  } catch (error) {
    console.error('Error getting active services:', error);
    throw error;
  }
}