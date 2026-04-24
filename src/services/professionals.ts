import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Professional, CreateProfessionalData } from '../types/professional';

// Create operations
export async function createProfessional(data: CreateProfessionalData): Promise<string> {
  try {
    // Use a transaction to ensure both operations succeed or fail together
    const professionalId = await runTransaction(db, async (transaction) => {
      // First, update the user's profile to add the professional type
      const userProfileRef = doc(db, 'userProfiles', data.userId);
      const userProfileDoc = await transaction.get(userProfileRef);

      if (!userProfileDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userProfile = userProfileDoc.data();
      const types = new Set(userProfile.types || ['client']);
      types.add('professional');

      transaction.update(userProfileRef, {
        types: Array.from(types),
        updatedAt: Timestamp.now()
      });

      // Then create the professional record
      const professionalData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const professionalRef = doc(collection(db, 'professionals'));
      transaction.set(professionalRef, professionalData);

      return professionalRef.id;
    });

    return professionalId;
  } catch (error) {
    console.error('Error creating professional:', error);
    throw error;
  }
}

// Read operations
export async function getProfessionalByUserId(userId: string): Promise<Professional | null> {
  try {
    const q = query(collection(db, 'professionals'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Professional;
  } catch (error) {
    console.error('Error getting professional:', error);
    throw error;
  }
}

export async function getProfessionalById(id: string): Promise<Professional | null> {
  try {
    const docRef = doc(db, 'professionals', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Professional;
  } catch (error) {
    console.error('Error getting professional:', error);
    throw error;
  }
}

// Update operations
export async function updateProfessional(id: string, data: Partial<Professional>): Promise<void> {
  try {
    const docRef = doc(db, 'professionals', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating professional:', error);
    throw error;
  }
}

// List operations
export async function getActiveProfessionals(): Promise<Professional[]> {
  try {
    const q = query(
      collection(db, 'professionals'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Professional));
  } catch (error) {
    console.error('Error getting professionals:', error);
    throw error;
  }
}