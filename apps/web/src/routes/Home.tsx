import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function Home() {
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
              Logbook
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your brewing sessions, take notes, and improve your technique over time.
            </p>
          </Link>
        </div>

        {/* Recent session placeholder */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Coffee Brewster
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to brew amazing coffee? Start by selecting a brewing method or use our reverse 
            brew calculator to get the perfect recipe for your desired amount.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/brew" className="btn btn-primary">
              Start Brewing
            </Link>
            <Link to="/reverse" className="btn btn-secondary">
              Calculate Recipe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}