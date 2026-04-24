import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ProfessionalService, CreateProfessionalServiceData } from '../types/professionalService';

export async function createProfessionalService(data: CreateProfessionalServiceData): Promise<string> {
  try {
    const professionalServiceData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'professionalServices'), professionalServiceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating professional service:', error);
    throw error;
  }
}

export async function getProfessionalServices(professionalId: string): Promise<ProfessionalService[]> {
  try {
    const q = query(
      collection(db, 'professionalServices'),
      where('professionalId', '==', professionalId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProfessionalService));
  } catch (error) {
    console.error('Error getting professional services:', error);
    throw error;
  }
}

export async function updateProfessionalService(id: string, data: Partial<ProfessionalService>): Promise<void> {
  try {
    const docRef = doc(db, 'professionalServices', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating professional service:', error);
    throw error;
  }
}

export async function getServiceProfessionals(serviceId: string): Promise<ProfessionalService[]> {
  try {
    const q = query(
      collection(db, 'professionalServices'),
      where('serviceId', '==', serviceId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProfessionalService));
  } catch (error) {
    console.error('Error getting service professionals:', error);
    throw error;
  }
}