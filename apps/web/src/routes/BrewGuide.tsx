export function BrewGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Start a Brew
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Choose your brewing method and follow our step-by-step guide.
        </p>
      </div>

      <div className="card p-8">
        <div className="text-center">
          <div className="text-primary-600 dark:text-primary-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The brewing guide with method selection and step-by-step timer will be available soon.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Features in development:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Method selection (V60, Chemex, AeroPress, French Press, Moka)</li>
              <li>Interactive brewing timer with step prompts</li>
              <li>Customizable recipes and ratios</li>
              <li>Session logging and notes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}