export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Start tracking your brewing journey with a personal logbook
          </p>
        </div>
        
        <div className="card p-8">
          <div className="text-center">
            <div className="text-primary-600 dark:text-primary-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Registration Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Account creation and user registration features are in development.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Features in development:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create account with email and password</li>
                <li>Email verification process</li>
                <li>Profile setup and customization</li>
                <li>Initial brewing preferences setup</li>
                <li>Welcome tour and onboarding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}