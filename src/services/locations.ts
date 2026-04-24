import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Location, CreateLocationData } from '../types/location';

// Create operations
export async function createLocation(data: CreateLocationData): Promise<string> {
  try {
    const locationData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'locations'), locationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
}

// Read operations
export async function getLocationById(id: string): Promise<Location | null> {
  try {
    const docRef = doc(db, 'locations', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Location;
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

export async function getActiveLocations(): Promise<Location[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'locations'), 
      where('isActive', '==', true))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Location));
  } catch (error) {
    console.error('Error getting active locations:', error);
    throw error;
  }
}

// Update operations
export async function updateLocation(id: string, data: Partial<Location>): Promise<void> {
  try {
    const docRef = doc(db, 'locations', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
}