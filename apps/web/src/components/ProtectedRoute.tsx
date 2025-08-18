import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check auth status on mount if not already checked
    if (isLoading) {
      checkAuth();
    }
  }, [isLoading, checkAuth]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If auth is not required but user is authenticated, you might want to redirect
  // For example, redirect authenticated users away from login/register pages
  if (!requireAuth && isAuthenticated && 
      (location.pathname === '/login' || location.pathname === '/register')) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}