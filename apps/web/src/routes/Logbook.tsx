export function Logbook() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Brewing Logbook
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your brewing sessions and improve your technique over time.
        </p>
      </div>

      <div className="card p-8">
        <div className="text-center">
          <div className="text-primary-600 dark:text-primary-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your personal brewing logbook will help you track sessions and improve over time.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Features in development:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Browse and search past brewing sessions</li>
              <li>Detailed session view with timeline and notes</li>
              <li>Rating system for tracking improvements</li>
              <li>Filter by brewing method, date, or rating</li>
              <li>Export brewing data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}