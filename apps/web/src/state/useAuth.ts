import { create } from 'zustand';
import { api, User, UserSettings } from '../lib/api';
import { useSettings } from './useSettings';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check auth on init
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.login({ email, password });
      
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.register({ email, password, displayName });
      
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await api.logout();
    } catch (error) {
      // Even if logout request fails, clear local state
      console.error('Logout request failed:', error);
    } finally {
      // Clear auth state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Reset settings to defaults
      const settingsState = useSettings.getState();
      settingsState.resetToDefaults();
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.me();
      
      if (response.success && response.user) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for failed auth check
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));