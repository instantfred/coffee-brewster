import { useEffect } from 'react';
import { useAuth } from '../state/useAuth';
import { useSettings } from '../state/useSettings';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth, isAuthenticated } = useAuth();
  const { loadSettings } = useSettings();

  useEffect(() => {
    // Check authentication status on app startup
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Load user settings if authenticated
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

  return <>{children}</>;
}