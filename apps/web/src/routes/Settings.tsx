import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { useSettings } from '../state/useSettings';
import { formatCupSize } from '../lib/units';
import { api } from '../lib/api';

const settingsSchema = z.object({
  units: z.enum(['METRIC', 'IMPERIAL']),
  tempUnit: z.enum(['C', 'F']),
  waterUnitPreference: z.enum(['ml', 'g']),
  recommend: z.boolean(),
  defaultMethodId: z.string().nullable(),
  cupSizeMl: z
    .number()
    .min(100, 'Cup size must be at least 100ml')
    .max(1000, 'Cup size must be less than 1000ml'),
  soundEnabled: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function Settings() {
  const { user, logout } = useAuth();
  const { settings, updateSettings, isLoading, error } = useSettings();
  const navigate = useNavigate();
  const [methods, setMethods] = useState<any[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || undefined,
  });

  const watchedUnits = watch('units');
  const watchedCupSize = watch('cupSizeMl');

  // Load brewing methods for default method selection
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const response = await api.getMethods();
        if (response.success && response.methods) {
          setMethods(response.methods);
        }
      } catch (error) {
        console.error('Failed to load methods:', error);
      } finally {
        setIsLoadingMethods(false);
      }
    };

    loadMethods();
  }, []);

  // Reset form when settings change
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaveMessage(null);
    
    try {
      await updateSettings(data);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your brewing preferences and account settings.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Brewing Preferences */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Brewing Preferences
              </h2>

              <div className="space-y-4">
                {/* Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Units
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('units')}
                        type="radio"
                        value="METRIC"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watchedUnits === 'METRIC' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watchedUnits === 'METRIC' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Metric</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Grams, ml, °C</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('units')}
                        type="radio"
                        value="IMPERIAL"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watchedUnits === 'IMPERIAL' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watchedUnits === 'IMPERIAL' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Imperial</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Ounces, fl oz</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Temperature Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature Unit
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('tempUnit')}
                        type="radio"
                        value="C"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watch('tempUnit') === 'C' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watch('tempUnit') === 'C' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Celsius (°C)</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('tempUnit')}
                        type="radio"
                        value="F"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watch('tempUnit') === 'F' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watch('tempUnit') === 'F' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Fahrenheit (°F)</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Water Unit Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Water Measurement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('waterUnitPreference')}
                        type="radio"
                        value="ml"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watch('waterUnitPreference') === 'ml' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watch('waterUnitPreference') === 'ml' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Milliliters (ml)</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Volume-based</div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600">
                      <input
                        {...register('waterUnitPreference')}
                        type="radio"
                        value="g"
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          watch('waterUnitPreference') === 'g' 
                            ? 'border-primary-600 bg-primary-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {watch('waterUnitPreference') === 'g' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Grams (g)</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Weight-based (1ml ≈ 1g)</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                  <div className="flex-1">
                    <label htmlFor="recommend" className="font-medium text-gray-900 dark:text-white">
                      Show brewing recommendations
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Display grind size, water temperature, and other brewing tips
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('recommend')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Sound Effects
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Play audio cues during brewing timers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      {...register('soundEnabled')}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Cup Size */}
                <div>
                  <label htmlFor="cupSizeMl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Cup Size
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('cupSizeMl', { valueAsNumber: true })}
                      type="number"
                      min="100"
                      max="1000"
                      step="10"
                      className="input w-32"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ml ({watchedCupSize && settings ? formatCupSize(watchedCupSize, { ...settings, units: watchedUnits }) : ''})
                    </span>
                  </div>
                  {errors.cupSizeMl && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.cupSizeMl.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This defines what "1 cup" means in the reverse brew calculator
                  </p>
                </div>

                {/* Default Method */}
                <div>
                  <label htmlFor="defaultMethodId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Brewing Method
                  </label>
                  <select
                    {...register('defaultMethodId')}
                    className="input"
                    disabled={isLoadingMethods}
                  >
                    <option value="">No default method</option>
                    {methods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Pre-select this method when starting a new brew
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              {saveMessage && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  {saveMessage}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.displayName || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full btn btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}