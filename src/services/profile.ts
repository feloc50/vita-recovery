import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type UserType = 'client' | 'professional';

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  birthdate: string;
  phone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  updatedAt: string;
  types: UserType[];
}

export async function createUserProfile(userId: string, email: string): Promise<void> {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);

    // Only create if profile doesn't exist
    if (!docSnap.exists()) {
      const defaultProfile: UserProfile = {
        email,
        firstName: '',
        lastName: '',
        gender: 'male',
        birthdate: '',
        phone: '',
        emailNotifications: true,
        smsNotifications: false,
        updatedAt: new Date().toISOString(),
        types: ['client']
      };

      await setDoc(docRef, defaultProfile);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Handle existing profiles without types
      if (!data.types) {
        const updatedProfile = {
          ...data,
          types: ['client']
        };
        await updateDoc(docRef, updatedProfile);
        return updatedProfile as UserProfile;
      }
      return data as UserProfile;
    }

    // If no profile exists, create a default one
    const defaultProfile: UserProfile = {
      email: '',
      firstName: '',
      lastName: '',
      gender: 'male',
      birthdate: '',
      phone: '',
      emailNotifications: true,
      smsNotifications: false,
      updatedAt: new Date().toISOString(),
      types: ['client']
    };

    await setDoc(docRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function saveUserProfile(userId: string, profile: Omit<UserProfile, 'updatedAt'>): Promise<void> {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, updatedProfile);
    } else {
      await setDoc(docRef, updatedProfile);
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}