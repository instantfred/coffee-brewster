import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrewMethod } from '../lib/api';
import { useSettings } from '../state/useSettings';
import { formatWeight, formatVolume, displayWeight, displayVolume, parseWeight, parseVolume } from '../lib/units';

const brewConfigSchema = z.object({
  ratio: z.number().min(8).max(20),
  cups: z.number().min(0.5).max(12),
  customYield: z.boolean(),
  yieldMl: z.number().min(50).max(3000).optional(),
  coffeeGrams: z.number().min(5).max(200),
  waterMl: z.number().min(50).max(3000),
});

type BrewConfigData = z.infer<typeof brewConfigSchema>;

interface BrewConfigProps {
  method: BrewMethod;
  onConfigChange: (config: BrewConfigData & { schedule: any[] }) => void;
}

export function BrewConfig({ method, onConfigChange }: BrewConfigProps) {
  const { settings } = useSettings();
  const [schedule, setSchedule] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrewConfigData>({
    resolver: zodResolver(brewConfigSchema),
    defaultValues: {
      ratio: method.defaultRatio,
      cups: 2,
      customYield: false,
      yieldMl: settings?.cupSizeMl ? settings.cupSizeMl * 2 : 480,
      coffeeGrams: 32,
      waterMl: 480,
    },
  });

  const watchedValues = watch();
  const { ratio, cups, customYield, yieldMl, coffeeGrams, waterMl } = watchedValues;

  // Calculate brewing parameters without setValue to avoid infinite loops
  useEffect(() => {
    if (!settings) return;

    const targetYield = customYield ? (yieldMl || 0) : (cups * settings.cupSizeMl);
    const calculatedCoffee = +(targetYield / ratio).toFixed(1);
    
    // Water absorption coefficients (same as backend)
    const absorptionCoef: Record<string, number> = {
      v60: 2.0,
      chemex: 2.0,
      aeropress: 1.5,
      french_press: 2.2,
      moka: 0.8,
    };
    
    const absorption = calculatedCoffee * (absorptionCoef[method.key] || 2.0);
    const totalWater = targetYield + absorption;

    // Update form values for coffee and water amounts
    setValue('coffeeGrams', calculatedCoffee);
    setValue('waterMl', totalWater);

    // Generate pour schedule (simplified version of backend logic)
    const newSchedule = [];
    
    if (method.bloom) {
      const bloomVol = Math.min(Math.max(2 * calculatedCoffee, 30), 60);
      newSchedule.push({
        atSec: 0,
        volumeMl: Math.round(bloomVol),
        label: 'Bloom',
      });
    }

    const remaining = totalWater - (newSchedule[0]?.volumeMl || 0);

    if (method.key === 'v60') {
      newSchedule.push({
        atSec: 45,
        volumeMl: Math.round(remaining * 0.55),
        label: 'First pour',
      });
      newSchedule.push({
        atSec: 105,
        volumeMl: Math.round(remaining * 0.45),
        label: 'Second pour',
      });
    } else if (method.key === 'chemex') {
      newSchedule.push({
        atSec: 45,
        volumeMl: Math.round(remaining * 0.4),
        label: 'First pour',
      });
      newSchedule.push({
        atSec: 105,
        volumeMl: Math.round(remaining * 0.3),
        label: 'Second pour',
      });
      newSchedule.push({
        atSec: 165,
        volumeMl: Math.round(remaining * 0.3),
        label: 'Third pour',
      });
    } else if (method.key === 'aeropress') {
      newSchedule.push({
        atSec: 45,
        volumeMl: remaining,
        label: 'Fill & steep',
      });
    } else if (method.key === 'french_press') {
      newSchedule.push({
        atSec: 0,
        volumeMl: totalWater,
        label: 'Fill',
      });
    } else if (method.key === 'moka') {
      newSchedule.push({
        atSec: 0,
        volumeMl: totalWater,
        label: 'Assemble & heat',
      });
    }

    setSchedule(newSchedule);
    onConfigChange({ 
      ratio, 
      cups, 
      customYield, 
      yieldMl,
      coffeeGrams: calculatedCoffee,
      waterMl: totalWater,
      schedule: newSchedule 
    });
  }, [ratio, cups, customYield, yieldMl, method.key, method.bloom, settings]);

  if (!settings) return null;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Configure Your Brew
      </h3>

      <form className="space-y-6">
        {/* Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Coffee-to-Water Ratio
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                {...register('ratio', { valueAsNumber: true })}
                type="range"
                min="8"
                max="20"
                step="0.5"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              />
            </div>
            <div className="w-20 text-center">
              <span className="text-lg font-mono text-primary-600 dark:text-primary-400">
                1:{ratio}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Strong (1:8)</span>
            <span>Balanced (1:15)</span>
            <span>Light (1:20)</span>
          </div>
          {errors.ratio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.ratio.message}
            </p>
          )}
        </div>

        {/* Yield Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brew Amount
            </label>
            <label className="flex items-center">
              <input
                {...register('customYield')}
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Custom amount</span>
            </label>
          </div>

          {!customYield ? (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Number of Cups
              </label>
              <input
                {...register('cups', { valueAsNumber: true })}
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                className="input w-32"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Cup size: {formatVolume(settings.cupSizeMl, settings)}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Target Yield
              </label>
              <div className="flex items-center space-x-2">
                <input
                  {...register('yieldMl', { valueAsNumber: true })}
                  type="number"
                  min="50"
                  max="3000"
                  step="10"
                  className="input w-32"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">ml</span>
              </div>
            </div>
          )}
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Coffee Needed
            </label>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatWeight(coffeeGrams, settings)}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total Water
            </label>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatVolume(waterMl, settings)}
            </div>
          </div>
        </div>

        {/* Quick Ratio Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Ratios
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { ratio: 12, label: 'Strong', desc: '1:12' },
              { ratio: 15, label: 'Balanced', desc: '1:15' },
              { ratio: 17, label: 'Light', desc: '1:17' },
            ].map((preset) => (
              <button
                key={preset.ratio}
                type="button"
                onClick={() => setValue('ratio', preset.ratio)}
                className={`p-3 text-center rounded-lg border transition-colors ${
                  ratio === preset.ratio
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'border-gray-200 hover:border-primary-300 dark:border-gray-600 dark:hover:border-primary-600'
                }`}
              >
                <div className="font-medium text-sm">{preset.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}