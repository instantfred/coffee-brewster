import { Link } from 'react-router-dom';
import { useAuth } from '../state/useAuth';
import { Logo } from '../components/Logo';

export function Home() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {user?.displayName || user?.email}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ready to brew some amazing coffee? Start with a guided brewing session or use our reverse brew calculator.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              to="/brew"
              className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Start a Brew
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Guided brewing with step-by-step timers for V60, Chemex, AeroPress, and more.
              </p>
            </Link>

            <Link
              to="/reverse"
              className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Reverse Brew
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us how many cups you want, and we'll calculate the perfect recipe.
              </p>
            </Link>

            <Link
              to="/logbook"
              className="card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Your Logbook
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your brewing sessions, take notes, and improve your technique over time.
              </p>
            </Link>
          </div>

          {/* Quick actions */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/brew" className="btn btn-primary">
                Start Brewing
              </Link>
              <Link to="/reverse" className="btn btn-secondary">
                Calculate Recipe
              </Link>
              <Link to="/logbook" className="btn btn-secondary">
                View Logbook
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-authenticated home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Coffee Brewster
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your guide to perfect coffee brewing. Step-by-step timers, reverse brew calculations, 
            and a personal logbook to track your brewing journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6">
            <div className="text-primary-600 dark:text-primary-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Guided Brewing
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Step-by-step timers with contextual prompts for V60, Chemex, AeroPress, French Press, and Moka Pot.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-primary-600 dark:text-primary-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Reverse Calculator
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tell us how many cups you want, and we'll calculate the precise coffee dose, water amount, and timing.
            </p>
          </div>

          <div className="card p-6">
            <div className="text-primary-600 dark:text-primary-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Personal Logbook
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track every brewing session with notes, ratings, and detailed parameters to improve over time.
            </p>
          </div>
        </div>

        {/* CTA for non-authenticated users */}
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Brewing?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create an account to access personalized brewing guides, save your sessions, 
            and track your coffee journey.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn btn-primary">
              Sign Up Free
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}