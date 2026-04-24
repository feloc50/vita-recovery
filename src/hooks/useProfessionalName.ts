import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/profile';

interface UseProfessionalNameReturn {
  fullName: string;
  loading: boolean;
  error: string | null;
}

export function useProfessionalName(userId: string): UseProfessionalNameReturn {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        setError(null);
        const profile = await getUserProfile(userId);
        if (profile) {
          setFullName(`${profile.firstName} ${profile.lastName}`.trim());
        } else {
          setError('Profile not found');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  return { fullName, loading, error };
}