export function ReverseBrew() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reverse Brew Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us how many cups you want, and we'll calculate the perfect recipe.
        </p>
      </div>

      <div className="card p-8">
        <div className="text-center">
          <div className="text-primary-600 dark:text-primary-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The reverse brew calculator will help you determine the perfect coffee dose and brewing parameters.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Features in development:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Input desired number of cups</li>
              <li>Select brewing method</li>
              <li>Get calculated coffee dose, water amount, and timing</li>
              <li>Customizable brew ratios</li>
              <li>Integration with brewing timer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}