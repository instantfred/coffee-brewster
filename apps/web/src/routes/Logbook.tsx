import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '../state/useSettings';
import { api, BrewSession, BrewMethod } from '../lib/api';
import { formatWeight, formatVolume, formatTemperature } from '../lib/units';
import { useDebounce } from '../hooks/useDebounce';

interface LogbookFilters {
  search: string;
  methodId: string;
  rating: string;
  dateFrom: string;
  dateTo: string;
}

export function Logbook() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSettings();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [sessions, setSessions] = useState<BrewSession[]>([]);
  const [methods, setMethods] = useState<BrewMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogbookFilters>({
    search: searchParams.get('search') || '',
    methodId: searchParams.get('method') || '',
    rating: searchParams.get('rating') || '',
    dateFrom: searchParams.get('from') || '',
    dateTo: searchParams.get('to') || '',
  });
  
  // Debounce search value to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Load methods on mount
  useEffect(() => {
    const loadMethods = async () => {
      try {
        const methodsResponse = await api.getMethods();
        if (methodsResponse.success && methodsResponse.methods) {
          setMethods(methodsResponse.methods);
        }
      } catch (error) {
        console.error('Failed to load methods:', error);
      }
    };
    
    loadMethods();
  }, []);

  // Load sessions when debounced search changes
  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const sessionsResponse = await api.getSessions({
          q: debouncedSearch || undefined,
          page: 1,
          limit: 50,
        });

        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        } else {
          throw new Error(sessionsResponse.error || 'Failed to load sessions');
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setError('Failed to load your brewing sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [debouncedSearch]);

  // Update URL params when filters change (except search which is debounced)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.methodId) params.set('method', filters.methodId);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.dateFrom) params.set('from', filters.dateFrom);
    if (filters.dateTo) params.set('to', filters.dateTo);
    
    setSearchParams(params, { replace: true }); // Use replace to avoid adding to history on each keystroke
  }, [debouncedSearch, filters.methodId, filters.rating, filters.dateFrom, filters.dateTo, setSearchParams]);

  const handleFilterChange = (key: keyof LogbookFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Keep focus on search input after state update
    if (key === 'search' && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      methodId: '',
      rating: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMethodName = (methodId: string): string => {
    const method = methods.find(m => m.id === methodId);
    return method?.name || 'Unknown Method';
  };

  const renderStarRating = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400 text-sm">Not rated</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      </div>
    );
  };

  const filteredSessions = sessions.filter(session => {
    if (filters.methodId && session.methodId !== filters.methodId) return false;
    if (filters.rating && session.rating?.toString() !== filters.rating) return false;
    if (filters.dateFrom && new Date(session.startedAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(session.startedAt) > new Date(filters.dateTo)) return false;
    return true;
  });

  const hasActiveFilters = filters.methodId || filters.rating || filters.dateFrom || filters.dateTo;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Logbook
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Brewing Logbook
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your brewing sessions and improve your technique over time.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Sessions
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                id="search"
                placeholder="Search by notes, variety, origin, roaster..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10 w-full"
                autoComplete="off"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="methodFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method
              </label>
              <select
                id="methodFilter"
                value={filters.methodId}
                onChange={(e) => handleFilterChange('methodId', e.target.value)}
                className="input w-full"
              >
                <option value="">All Methods</option>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ratingFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <select
                id="ratingFilter"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="input w-full"
              >
                <option value="">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4+)</option>
                <option value="3">⭐⭐⭐ (3+)</option>
                <option value="2">⭐⭐ (2+)</option>
                <option value="1">⭐ (1+)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-300">
          {filteredSessions.length === 0 ? (
            'No sessions found'
          ) : (
            `Showing ${filteredSessions.length} of ${sessions.length} sessions`
          )}
        </p>
        
        {sessions.length > 0 && (
          <button
            onClick={() => navigate('/brew')}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Session
          </button>
        )}
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="card p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {sessions.length === 0 ? 'No Brewing Sessions Yet' : 'No Sessions Match Your Filters'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {sessions.length === 0 
                ? 'Start brewing to track your sessions and improve your technique.'
                : 'Try adjusting your search terms or filters to find more sessions.'
              }
            </p>
            <button
              onClick={() => navigate('/brew')}
              className="btn btn-primary"
            >
              Start Your First Brew
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/logbook/${session.id}`)}
              className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {getMethodName(session.methodId)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(session.startedAt)}
                  </p>
                </div>
                {renderStarRating(session.rating)}
              </div>

              {/* Brew Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Coffee:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {settings ? formatWeight(session.coffeeGrams, settings) : `${session.coffeeGrams}g`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Yield:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {settings ? formatVolume(session.yieldMl, settings) : `${session.yieldMl}ml`}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Time:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatTime(session.durationSec)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Temp:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session.waterTempC 
                      ? (settings ? formatTemperature(session.waterTempC, settings) : `${session.waterTempC}°C`)
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Notes Preview */}
              {session.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {session.notes}
                  </p>
                </div>
              )}

              {/* Bean Info */}
              {session.bean && (session.bean as any).variety && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {(session.bean as any).variety}
                    {(session.bean as any).roaster && ` • ${(session.bean as any).roaster}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}