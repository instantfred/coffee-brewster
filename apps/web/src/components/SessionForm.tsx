import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrewMethod } from '../lib/api';
import { useSettings } from '../state/useSettings';
import { formatVolume, formatWeight } from '../lib/units';

const sessionSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  grindSetting: z.string().optional(),
  waterTempC: z.number().min(70).max(100).optional(),
  beanVariety: z.string().optional(),
  roaster: z.string().optional(),
  roastDate: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface ActualPour {
  scheduledAtSec: number;
  actualAtSec: number;
  volumeMl: number;
  label: string;
  completed: boolean;
}

interface SessionFormProps {
  method: BrewMethod;
  durationSec: number;
  coffeeGrams: number;
  waterMl: number;
  yieldMl: number;
  actualPours: ActualPour[];
  onSave: (sessionData: SessionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SessionForm({
  method,
  durationSec,
  coffeeGrams,
  waterMl,
  yieldMl,
  actualPours,
  onSave,
  onCancel,
  isLoading = false,
}: SessionFormProps) {
  const { settings } = useSettings();
  const [rating, setRating] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      waterTempC: method.presets?.tempC,
      grindSetting: method.presets?.grind,
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    await onSave({
      ...data,
      rating: rating || undefined,
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`w-8 h-8 ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500'
            } transition-colors`}
          >
            <svg
              className="w-full h-full"
              fill={star <= rating ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          {rating ? `${rating}/5` : 'Rate your brew'}
        </span>
      </div>
    );
  };

  if (!settings) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Save Your Brew Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Record details about your brewing session for future reference
          </p>
        </div>

        {/* Brew Summary */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Session Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Method:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {method.name}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatTime(durationSec)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Coffee:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatWeight(coffeeGrams, settings)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Water:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatVolume(waterMl, settings)}
              </div>
            </div>
          </div>
        </div>

        {/* Pour Timeline */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Pour Timeline</h3>
          <div className="space-y-2">
            {actualPours.map((pour, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  {pour.label}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatVolume(pour.volumeMl, settings)}
                  </span>
                  <span className="font-mono text-gray-600 dark:text-gray-300">
                    {formatTime(pour.actualAtSec)}
                    {pour.actualAtSec !== pour.scheduledAtSec && (
                      <span className="text-orange-500 ml-1">
                        ({pour.actualAtSec > pour.scheduledAtSec ? '+' : ''}
                        {pour.actualAtSec - pour.scheduledAtSec}s)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rate This Brew
            </label>
            <StarRating />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasting Notes
            </label>
            <textarea
              {...register('notes')}
              id="notes"
              rows={3}
              placeholder="How did it taste? Any observations about the brewing process?"
              className="input w-full"
            />
          </div>

          {/* Brewing Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grindSetting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grind Setting
              </label>
              <input
                {...register('grindSetting')}
                type="text"
                id="grindSetting"
                placeholder="e.g., 18 (Baratza Encore)"
                className="input w-full"
              />
            </div>
            
            <div>
              <label htmlFor="waterTempC" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Water Temperature
              </label>
              <div className="flex items-center space-x-2">
                <input
                  {...register('waterTempC', { valueAsNumber: true })}
                  type="number"
                  id="waterTempC"
                  min="70"
                  max="100"
                  step="0.5"
                  className="input flex-1"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{settings.tempUnit === 'F' ? '°F' : '°C'}</span>
              </div>
              {errors.waterTempC && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.waterTempC.message}
                </p>
              )}
            </div>
          </div>

          {/* Bean Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Bean Information (Optional)
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="beanVariety" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variety/Origin
                </label>
                <input
                  {...register('beanVariety')}
                  type="text"
                  id="beanVariety"
                  placeholder="e.g., Ethiopian Yirgacheffe"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="roaster" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roaster
                </label>
                <input
                  {...register('roaster')}
                  type="text"
                  id="roaster"
                  placeholder="e.g., Blue Bottle Coffee"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label htmlFor="roastDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roast Date
                </label>
                <input
                  {...register('roastDate')}
                  type="date"
                  id="roastDate"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting || isLoading}
            >
              Skip & Discard
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}