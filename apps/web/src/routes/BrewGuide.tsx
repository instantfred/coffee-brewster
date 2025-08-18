import { useState, useEffect } from 'react';
import { MethodCard } from '../components/MethodCard';
import { BrewConfig } from '../components/BrewConfig';
import { PourSchedule } from '../components/PourSchedule';
import { useSettings } from '../state/useSettings';
import { api, BrewMethod } from '../lib/api';

type BrewStep = 'method' | 'configure' | 'schedule' | 'timer';

interface BrewConfigData {
  ratio: number;
  cups: number;
  customYield: boolean;
  yieldMl?: number;
  coffeeGrams: number;
  waterMl: number;
  schedule: any[];
}

export function BrewGuide() {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState<BrewStep>('method');
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<BrewMethod | null>(null);
  const [brewConfig, setBrewConfig] = useState<BrewConfigData | null>(null);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              setCurrentStep('configure');
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
  }, [settings?.defaultMethodId]);

  const handleMethodSelect = (method: BrewMethod) => {
    setSelectedMethod(method);
    setCurrentStep('configure');
  };

  const handleConfigChange = (config: BrewConfigData) => {
    setBrewConfig(config);
  };

  const handleStartBrew = () => {
    setCurrentStep('timer');
    // TODO: Implement timer component in Task 13
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    setBrewConfig(null);
    setCurrentStep('method');
  };

  const handleBackToConfigure = () => {
    setCurrentStep('configure');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1: Method */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'method' 
              ? 'bg-primary-600 text-white' 
              : selectedMethod 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {selectedMethod ? '✓' : '1'}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Method
          </span>
        </div>

        {/* Arrow */}
        <div className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 2: Configure */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'configure' 
              ? 'bg-primary-600 text-white' 
              : brewConfig 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {brewConfig ? '✓' : '2'}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Configure
          </span>
        </div>

        {/* Arrow */}
        <div className="text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 3: Brew */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 'schedule' || currentStep === 'timer'
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Brew
          </span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoadingMethods) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Methods
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 'method':
        return (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methods.map((method) => (
                <MethodCard
                  key={method.id}
                  method={method}
                  onSelect={handleMethodSelect}
                  isSelected={selectedMethod?.id === method.id}
                />
              ))}
            </div>
          </div>
        );

      case 'configure':
        return selectedMethod ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToMethods}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedMethod.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configure your brew parameters
                    </p>
                  </div>
                </div>
                {brewConfig && (
                  <button
                    onClick={() => setCurrentStep('schedule')}
                    className="btn btn-primary"
                  >
                    Preview Schedule
                  </button>
                )}
              </div>
            </div>

            <BrewConfig
              method={selectedMethod}
              onConfigChange={handleConfigChange}
            />
          </div>
        ) : null;

      case 'schedule':
        return selectedMethod && brewConfig ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToConfigure}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Ready to Brew
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Review your brewing schedule
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStartBrew}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6" />
                  </svg>
                  <span>Start Timer</span>
                </button>
              </div>
            </div>

            <PourSchedule
              pours={brewConfig.schedule}
              tempC={selectedMethod.presets?.tempC}
              grind={selectedMethod.presets?.grind}
              filter={selectedMethod.presets?.filter}
              totalWaterMl={brewConfig.waterMl}
              coffeeGrams={brewConfig.coffeeGrams}
            />
          </div>
        ) : null;

      case 'timer':
        return (
          <div className="card p-8">
            <div className="text-center">
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Timer Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The interactive brewing timer will be implemented in Task 13.
              </p>
              <button
                onClick={() => setCurrentStep('schedule')}
                className="btn btn-secondary"
              >
                Back to Schedule
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Start a Brew
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Choose your brewing method and follow our step-by-step guide.
        </p>
      </div>

      {renderStepIndicator()}
      {renderContent()}
    </div>
  );
}