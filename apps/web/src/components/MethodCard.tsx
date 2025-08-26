import { BrewMethod } from '../lib/api';
import { useSettings } from '../state/useSettings';
import { formatTemperature } from '../lib/units';

interface MethodCardProps {
  method: BrewMethod;
  onSelect: (method: BrewMethod) => void;
  isSelected?: boolean;
}

// Map method keys to their icon filenames in the public folder
const methodIcons: Record<string, string> = {
  v60: '/v60-craft-coffee-icon.png',
  chemex: '/v60-coffee-icon.png', // Using V60 icon for Chemex as they're both pour-over methods
  aeropress: '/coffee-press-icon.png',
  french_press: '/french-pres-icon.png',
  moka: '/moka-pot-icon.png',
};

export function MethodCard({ method, onSelect, isSelected = false }: MethodCardProps) {
  const { settings } = useSettings();

  const showRecommendations = settings?.recommend ?? true;
  const presets = showRecommendations ? method.presets : null;

  return (
    <button
      onClick={() => onSelect(method)}
      className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 flex-shrink-0">
            <img 
              src={methodIcons[method.key] || '/coffee-cup-icon.png'} 
              alt={`${method.name} icon`}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {method.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ratio 1:{method.defaultRatio}
            </p>
          </div>
        </div>
        
        {isSelected && (
          <div className="text-primary-600 dark:text-primary-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {method.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {method.notes}
        </p>
      )}

      {presets && (
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-4">
            {presets.grind && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">Grind:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {presets.grind}
                </span>
              </div>
            )}
            
            {presets.tempC && settings && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">Temp:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTemperature(presets.tempC, settings)}
                </span>
              </div>
            )}
            
            {presets.filter && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">Filter:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {presets.filter}
                </span>
              </div>
            )}
          </div>

          {presets.tips && presets.tips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Tips:</p>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {presets.tips.slice(0, 2).map((tip: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-500 mr-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {method.bloom ? 'Includes bloom' : 'No bloom'} • {method.pours} pour{method.pours !== 1 ? 's' : ''}
          </span>
          <span className="text-primary-600 dark:text-primary-400 font-medium">
            Select →
          </span>
        </div>
      </div>
    </button>
  );
}