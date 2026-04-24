import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/profile';

export function useProfile(userId: string | undefined) {
  const [firstName, setFirstName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setFirstName(profile.firstName || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  return { firstName, loading, error };
}