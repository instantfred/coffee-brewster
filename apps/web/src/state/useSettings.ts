import { create } from 'zustand';
import { api, UserSettings } from '../lib/api';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
  resetToDefaults: () => void;
}

const defaultSettings: UserSettings = {
  units: 'METRIC',
  tempUnit: 'C',
  waterUnitPreference: 'ml',
  recommend: true,
  defaultMethodId: null,
  cupSizeMl: 240,
  soundEnabled: true,
};

export const useSettings = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.getSettings();
      
      if (response.success && response.settings) {
        set({
          settings: response.settings,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Failed to load settings');
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load settings',
      });
      
      // Keep default settings if loading fails
      if (!get().settings) {
        set({ settings: defaultSettings });
      }
    }
  },

  updateSettings: async (updates: Partial<UserSettings>) => {
    const currentSettings = get().settings;
    if (!currentSettings) return;

    // Optimistic update
    const newSettings = { ...currentSettings, ...updates };
    set({ settings: newSettings, error: null });
    
    try {
      const response = await api.updateSettings(updates);
      
      if (response.success && response.settings) {
        set({
          settings: response.settings,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      // Revert optimistic update on error
      set({
        settings: currentSettings,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetToDefaults: () => {
    set({ 
      settings: defaultSettings,
      isLoading: false,
      error: null
    });
  },
}));
