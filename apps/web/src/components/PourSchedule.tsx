import { useSettings } from '../state/useSettings';
import { formatVolume, formatTemperature, formatWeight } from '../lib/units';

interface PourStep {
  atSec: number;
  volumeMl: number;
  label: string;
}

interface PourScheduleProps {
  pours: PourStep[];
  tempC?: number;
  grind?: string;
  filter?: string;
  totalWaterMl: number;
  coffeeGrams: number;
}

export function PourSchedule({ 
  pours, 
  tempC, 
  grind, 
  filter, 
  totalWaterMl, 
  coffeeGrams 
}: PourScheduleProps) {
  const { settings } = useSettings();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalTime = (): string => {
    if (pours.length === 0) return '0:00';
    const lastPour = pours[pours.length - 1];
    const estimatedFinish = lastPour.atSec + 60; // Add 60 seconds for final drip
    return formatTime(estimatedFinish);
  };

  if (!settings) return null;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Brewing Schedule Preview
      </h3>

      {/* Recipe Summary */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Coffee:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {formatWeight(coffeeGrams, settings)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Water:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {formatVolume(totalWaterMl, settings)}
            </span>
          </div>
          {tempC && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Temp:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {formatTemperature(tempC, settings)}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              ~{getTotalTime()}
            </span>
          </div>
        </div>
      </div>

      {/* Brewing Recommendations */}
      {(grind || filter) && settings.recommend && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
            Recommendations
          </h4>
          <div className="space-y-1 text-sm">
            {grind && (
              <div>
                <span className="text-primary-700 dark:text-primary-300">Grind size:</span>
                <span className="ml-2 text-primary-900 dark:text-primary-100">{grind}</span>
              </div>
            )}
            {filter && (
              <div>
                <span className="text-primary-700 dark:text-primary-300">Filter:</span>
                <span className="ml-2 text-primary-900 dark:text-primary-100">{filter}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pour Timeline */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Pour Timeline
        </h4>
        
        <div className="space-y-3">
          {pours.map((pour, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-sm font-mono text-primary-600 dark:text-primary-400">
                  {formatTime(pour.atSec)}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 
                    ? 'bg-green-500' 
                    : index === pours.length - 1 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pour.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatVolume(pour.volumeMl, settings)}
                  </span>
                </div>
                
                {index === 0 && pour.label.toLowerCase().includes('bloom') && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Wet the coffee and let it bloom for 30-45 seconds
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute left-0 top-3 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
          <div className="relative flex justify-between">
            {pours.map((pour, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 ${
                  index === 0 
                    ? 'bg-green-500' 
                    : index === pours.length - 1 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}></div>
                <div className="mt-2 text-xs text-center">
                  <div className="font-mono text-gray-600 dark:text-gray-400">
                    {formatTime(pour.atSec)}
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 max-w-16 truncate">
                    {pour.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}