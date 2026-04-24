import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/profile';
import { getProfessionalByUserId } from '../services/professionals';

export type UserRole = 'admin' | 'professional' | 'client';

interface UseUserRoleReturn {
  roles: UserRole[];
  isAdmin: boolean;
  isProfessional: boolean;
  isClient: boolean;
  loading: boolean;
  error: string | null;
}

const ADMIN_CACHE_KEY = 'vita_is_admin';
const ROLES_CACHE_KEY = 'vita_user_roles';

export function useUserRole(): UseUserRoleReturn {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>(() => {
    try {
      const cached = localStorage.getItem(ROLES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_CACHE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    async function loadUserRoles() {
      if (!currentUser) {
        setLoading(false);
        // Clear cache when user logs out
        localStorage.removeItem(ADMIN_CACHE_KEY);
        localStorage.removeItem(ROLES_CACHE_KEY);
        return;
      }

      try {
        setError(null);

        // Load user profile to check types
        const profile = await getUserProfile(currentUser.uid);
        const userRoles: UserRole[] = [];

        if (profile?.types?.includes('client')) {
          userRoles.push('client');
        }
        
        if (profile?.types?.includes('professional')) {
          userRoles.push('professional');
          // If user is a professional, check if they're an admin
          const professionalProfile = await getProfessionalByUserId(currentUser.uid);
          const isUserAdmin = !!professionalProfile?.isAdmin;
          
          if (isUserAdmin) {
            userRoles.push('admin');
          }

          // Update admin status in state and cache
          setIsAdmin(isUserAdmin);
          localStorage.setItem(ADMIN_CACHE_KEY, isUserAdmin.toString());
        }

        setRoles(userRoles);
        localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(userRoles));
      } catch (error) {
        console.error('Error loading user roles:', error);
        setError('Failed to load user roles');
        
        // Clear cache on error
        localStorage.removeItem(ADMIN_CACHE_KEY);
        localStorage.removeItem(ROLES_CACHE_KEY);
      } finally {
        setLoading(false);
      }
    }

    loadUserRoles();
  }, [currentUser]);

  return {
    roles,
    isAdmin,
    isProfessional: roles.includes('professional'),
    isClient: roles.includes('client'),
    loading,
    error
  };
}