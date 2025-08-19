import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MethodCard } from '../components/MethodCard';
import { PourSchedule } from '../components/PourSchedule';
import { useSettings } from '../state/useSettings';
import { api, BrewMethod } from '../lib/api';
import { formatWeight, formatVolume, formatTemperature } from '../lib/units';

const reverseBrewSchema = z.object({
  cups: z.number().min(0.5, 'Must brew at least 0.5 cups').max(12, 'Maximum 12 cups'),
  methodKey: z.string().min(1, 'Please select a brewing method'),
  customRatio: z.boolean(),
  ratio: z.number().min(8, 'Ratio must be at least 1:8').max(20, 'Ratio must be at most 1:20').optional(),
  targetYieldMl: z.number().min(50, 'Minimum 50ml').max(3000, 'Maximum 3000ml').optional(),
  useCustomYield: z.boolean(),
});

type ReverseBrewFormData = z.infer<typeof reverseBrewSchema>;

interface BrewPlan {
  coffeeGrams: number;
  waterTotalMl: number;
  yieldTargetMl: number;
  bloomMl?: number;
  pours: Array<{
    atSec: number;
    volumeMl: number;
    label: string;
  }>;
  tempC?: number;
  grind?: string;
  filter?: string;
}

type ReverseStep = 'input' | 'results';

export function ReverseBrew() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState<ReverseStep>('input');
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<BrewMethod | null>(null);
  const [brewPlan, setBrewPlan] = useState<BrewPlan | null>(null);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReverseBrewFormData>({
    resolver: zodResolver(reverseBrewSchema),
    defaultValues: {
      cups: 2,
      customRatio: false,
      ratio: 15,
      useCustomYield: false,
      targetYieldMl: 480,
    },
  });

  const watchedValues = watch();
  const { cups, customRatio, ratio, useCustomYield, targetYieldMl, methodKey } = watchedValues;

  // Load brewing methods
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const response = await api.getMethods();
        if (response.success && response.methods) {
          setMethods(response.methods);
          
          // Auto-select default method if set
          if (settings?.defaultMethodId) {
            const defaultMethod = response.methods.find(m => m.id === settings.defaultMethodId);
            if (defaultMethod) {
              setSelectedMethod(defaultMethod);
              setValue('methodKey', defaultMethod.key);
            }
          }
        } else {
          setError('Failed to load brewing methods');
        }
      } catch (error) {
        console.error('Failed to load methods:', error);
        setError('Failed to load brewing methods');
      } finally {
        setIsLoadingMethods(false);
      }
    };

    loadMethods();
  }, [settings?.defaultMethodId, setValue]);

  // Update selected method when form changes
  useEffect(() => {
    if (methodKey) {
      const method = methods.find(m => m.key === methodKey);
      setSelectedMethod(method || null);
      
      // Set default ratio for method if not using custom
      if (!customRatio && method) {
        setValue('ratio', method.defaultRatio);
      }
    }
  }, [methodKey, methods, customRatio, setValue]);

  const handleMethodSelect = (method: BrewMethod) => {
    setSelectedMethod(method);
    setValue('methodKey', method.key);
    if (!customRatio) {
      setValue('ratio', method.defaultRatio);
    }
  };

  const onSubmit = async (data: ReverseBrewFormData) => {
    setIsCalculating(true);
    setError(null);

    try {
      const payload = {
        methodKey: data.methodKey,
        cups: data.cups,
        ratio: data.customRatio ? data.ratio : undefined,
        targetYieldMl: data.useCustomYield ? data.targetYieldMl : undefined,
      };

      const response = await api.calculateReverseBrew(payload);
      
      if (response.success && response.recipe) {
        setBrewPlan(response.recipe);
        setCurrentStep('results');
      } else {
        throw new Error(response.error || 'Failed to calculate brew recipe');
      }
    } catch (error) {
      console.error('Failed to calculate recipe:', error);
      setError('Failed to calculate recipe. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUseSettings = () => {
    if (!selectedMethod || !brewPlan) return;

    // Navigate to brew guide with prefilled data
    // We'll pass the data via URL state
    navigate('/brew', {
      state: {
        prefilledMethod: selectedMethod,
        prefilledConfig: {
          ratio: ratio || selectedMethod.defaultRatio,
          cups: cups,
          customYield: useCustomYield,
          yieldMl: brewPlan.yieldTargetMl,
          coffeeGrams: brewPlan.coffeeGrams,
          waterMl: brewPlan.waterTotalMl,
          schedule: brewPlan.pours,
        },
      },
    });
  };

  const handleStartOver = () => {
    setCurrentStep('input');
    setBrewPlan(null);
    setError(null);
  };

  const renderInputStep = () => (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Method Selection */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Brewing Method
          </h2>
          
          {isLoadingMethods ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {methods.map((method) => (
                <div key={method.id} className="relative">
                  <input
                    {...register('methodKey')}
                    type="radio"
                    value={method.key}
                    id={`method-${method.key}`}
                    className="sr-only"
                  />
                  <label htmlFor={`method-${method.key}`} className="block cursor-pointer">
                    <MethodCard
                      method={method}
                      onSelect={handleMethodSelect}
                      isSelected={selectedMethod?.key === method.key}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {errors.methodKey && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.methodKey.message}
            </p>
          )}
        </div>

        {/* Brew Parameters */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How Much Coffee?
          </h2>

          <div className="space-y-6">
            {/* Cups Input */}
            <div>
              <label htmlFor="cups" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Cups
              </label>
              <div className="flex items-center space-x-4">
                <input
                  {...register('cups', { valueAsNumber: true })}
                  type="number"
                  id="cups"
                  min="0.5"
                  max="12"
                  step="0.5"
                  className="input w-32"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  cups ({settings ? `${settings.cupSizeMl}ml each` : '240ml each'})
                </span>
              </div>
              {errors.cups && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cups.message}
                </p>
              )}
            </div>

            {/* Custom Yield Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
              <div>
                <label htmlFor="useCustomYield" className="font-medium text-gray-900 dark:text-white">
                  Specify exact yield amount
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Override the cup-based calculation with a precise volume
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  {...register('useCustomYield')}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Custom Yield Input */}
            {useCustomYield && (
              <div>
                <label htmlFor="targetYieldMl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Yield
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    {...register('targetYieldMl', { valueAsNumber: true })}
                    type="number"
                    id="targetYieldMl"
                    min="50"
                    max="3000"
                    step="10"
                    className="input w-32"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">ml</span>
                </div>
                {errors.targetYieldMl && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.targetYieldMl.message}
                  </p>
                )}
              </div>
            )}

            {/* Custom Ratio Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
              <div>
                <label htmlFor="customRatio" className="font-medium text-gray-900 dark:text-white">
                  Use custom coffee-to-water ratio
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Override the method's default ratio (currently 1:{selectedMethod?.defaultRatio || 15})
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  {...register('customRatio')}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Custom Ratio Input */}
            {customRatio && (
              <div>
                <label htmlFor="ratio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coffee-to-Water Ratio
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-xs">
                    <input
                      {...register('ratio', { valueAsNumber: true })}
                      type="range"
                      id="ratio"
                      min="8"
                      max="20"
                      step="0.5"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
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
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isCalculating || !selectedMethod}
            className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Calculating...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
                </svg>
                Calculate Recipe
              </div>
            )}
          </button>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </form>
    </div>
  );

  const renderResultsStep = () => (
    <div className="max-w-4xl mx-auto">
      {brewPlan && selectedMethod && settings && (
        <>
          {/* Recipe Summary */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Perfect {selectedMethod.name} Recipe
              </h2>
              <button
                onClick={handleStartOver}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-1">
                  {formatWeight(brewPlan.coffeeGrams, settings)}
                </div>
                <div className="text-sm text-primary-700 dark:text-primary-300">Coffee</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  {formatVolume(brewPlan.waterTotalMl, settings)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Water</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
                  {formatVolume(brewPlan.yieldTargetMl, settings)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Expected Yield</div>
              </div>
              
              {brewPlan.tempC && (
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                    {formatTemperature(brewPlan.tempC, settings)}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Water Temp</div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleUseSettings}
                className="btn btn-primary text-lg px-8 py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6" />
                </svg>
                Use These Settings
              </button>
            </div>
          </div>

          {/* Detailed Schedule */}
          <PourSchedule
            pours={brewPlan.pours}
            tempC={brewPlan.tempC}
            grind={brewPlan.grind}
            filter={brewPlan.filter}
            totalWaterMl={brewPlan.waterTotalMl}
            coffeeGrams={brewPlan.coffeeGrams}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reverse Brew Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us how many cups you want, and we'll calculate the perfect recipe.
        </p>
      </div>

      {currentStep === 'input' && renderInputStep()}
      {currentStep === 'results' && renderResultsStep()}
    </div>
  );
}