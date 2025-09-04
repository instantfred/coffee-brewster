import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../state/useSettings';
import { api, BrewSession, BrewMethod } from '../lib/api';
import { formatWeight, formatVolume, formatTemperature } from '../lib/units';

export function SessionDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  
  const [session, setSession] = useState<BrewSession | null>(null);
  const [method, setMethod] = useState<BrewMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await api.getSession(id);
        if (response.success && response.session) {
          setSession(response.session);
          
          // Use method details included in session response
          if (response.session.method) {
            setMethod(response.session.method);
          }
        } else {
          throw new Error(response.error || 'Session not found');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        setError('Failed to load session details');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [id]);

  const handleDelete = async () => {
    if (!session || !confirm('Are you sure you want to delete this brewing session? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.deleteSession(session.id);
      if (response.success) {
        navigate('/logbook');
      } else {
        throw new Error(response.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError('Failed to delete session. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderStarRating = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
        <span className="ml-2 text-lg font-medium text-gray-700 dark:text-gray-300">
          {rating}/5
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Session Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'The brewing session you\'re looking for doesn\'t exist or has been deleted.'}
            </p>
            <button
              onClick={() => navigate('/logbook')}
              className="btn btn-primary"
            >
              Back to Logbook
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pours = session.pours ? (Array.isArray(session.pours) ? session.pours : JSON.parse(session.pours as string)) : [];
  const bean = session.bean ? (typeof session.bean === 'object' ? session.bean : JSON.parse(session.bean as string)) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/logbook')}
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Logbook
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </div>
            )}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {method?.name || 'Brewing Session'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {formatDate(session.startedAt)}
        </p>
      </div>

      {/* Session Overview */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Session Overview
          </h2>
          {renderStarRating(session.rating)}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-1">
              {settings ? formatWeight(session.coffeeGrams, settings) : `${session.coffeeGrams}g`}
            </div>
            <div className="text-sm text-primary-700 dark:text-primary-300">Coffee</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {settings ? formatVolume(session.waterMl, settings) : `${session.waterMl}ml`}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Water</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {settings ? formatVolume(session.yieldMl, settings) : `${session.yieldMl}ml`}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Yield</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
              {formatTime(session.durationSec)}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Duration</div>
          </div>
        </div>
      </div>

      {/* Brewing Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Brewing Parameters */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Brewing Parameters
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Method:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {method?.name || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Water Temperature:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {session.waterTempC 
                  ? (settings ? formatTemperature(session.waterTempC, settings) : `${session.waterTempC}°C`)
                  : 'Not recorded'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Grind Setting:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {session.grindSetting || 'Not recorded'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ratio:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                1:{session.brewRatio ? session.brewRatio.toFixed(1) : (session.waterMl / session.coffeeGrams).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Bean Information */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Coffee Bean Details
          </h3>
          {bean ? (
            <div className="space-y-3">
              {bean.variety && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Variety/Origin:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bean.variety}
                  </span>
                </div>
              )}
              {bean.roaster && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Roaster:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bean.roaster}
                  </span>
                </div>
              )}
              {bean.roastDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Roast Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(bean.roastDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No bean information recorded
            </p>
          )}
        </div>
      </div>

      {/* Pour Timeline */}
      {pours.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Pour Timeline
          </h3>
          
          <div className="space-y-4">
            {pours.map((pour: any, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-sm font-mono text-primary-600 dark:text-primary-400">
                    {formatTime(pour.atSec || pour.timestamp || 0)}
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
                    {pour.volumeMl !== undefined && pour.volumeMl !== null && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {settings ? formatVolume(pour.volumeMl, settings) : `${pour.volumeMl}ml`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Visualization */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute left-0 top-3 w-full h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div className="relative flex justify-between">
                {pours.map((pour: any, index: number) => (
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
                        {formatTime(pour.atSec || pour.timestamp || 0)}
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
      )}

      {/* Tasting Notes */}
      {session.notes && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Tasting Notes
          </h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}