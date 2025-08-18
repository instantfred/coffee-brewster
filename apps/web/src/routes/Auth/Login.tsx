export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your brewing logbook and personalized settings
          </p>
        </div>
        
        <div className="card p-8">
          <div className="text-center">
            <div className="text-primary-600 dark:text-primary-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              User authentication and account management features are in development.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Features in development:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email and password authentication</li>
                <li>User registration and profile management</li>
                <li>Secure session handling</li>
                <li>Password reset functionality</li>
                <li>Personal data synchronization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}