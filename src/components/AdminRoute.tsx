import { Navigate, Outlet } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';
import { LoadingState } from './LoadingState';

export function AdminRoute() {
  const { isAdmin, isProfessional, loading, error } = useUserRole();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <Navigate to="/" />;
  }

  return (isAdmin || isProfessional) ? <Outlet /> : <Navigate to="/" />;
}