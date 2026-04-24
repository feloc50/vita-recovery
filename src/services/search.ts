import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserProfile } from './profile';
import { getActiveProfessionals } from './professionals';

// Add new function to search users
export async function searchUsers(searchQuery: string) {
  try {
    const q = query(
      collection(db, 'userProfiles'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      })
      .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      }));

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function searchClients(searchQuery: string) {
  try {
    const q = query(
      collection(db, 'userProfiles'),
      where('types', 'array-contains', 'client'),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(client => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      })
      .map(client => ({
        id: client.id,
        name: `${client.firstName} ${client.lastName}`
      }));

    return clients;
  } catch (error) {
    console.error('Error searching clients:', error);
    return [];
  }
}

export async function searchProfessionals(searchQuery: string) {
  try {
    // Get all active professionals
    const professionals = await getActiveProfessionals();
    
    // Get user profiles for all professionals
    const professionalProfiles = await Promise.all(
      professionals.map(async (professional) => {
        const userProfile = await getUserProfile(professional.userId);
        return {
          professional,
          userProfile
        };
      })
    );

    // Filter and format results
    const results = professionalProfiles
      .filter(({ userProfile }) => {
        if (!userProfile) return false;
        const fullName = `${userProfile.firstName} ${userProfile.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      })
      .map(({ professional, userProfile }) => ({
        id: professional.id,
        name: `${userProfile?.firstName} ${userProfile?.lastName}`
      }))
      .slice(0, 5); // Limit to 5 results

    return results;
  } catch (error) {
    console.error('Error searching professionals:', error);
    return [];
  }
}