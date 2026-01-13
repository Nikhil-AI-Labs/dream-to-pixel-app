import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingFallback from './LoadingFallback';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSetup?: boolean;
}

const ProtectedRoute = ({ children, requireSetup = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If setup is required and not completed, redirect to setup
  if (requireSetup && profile && !profile.setup_completed) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
