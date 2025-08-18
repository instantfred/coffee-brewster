import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../state/useAuth';
import { Logo } from '../../components/Logo';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    
    try {
      await registerUser(data.email, data.password, data.displayName);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const displayError = error || submitError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {displayError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                <div className="text-sm text-red-800 dark:text-red-200">
                  {displayError}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display name
              </label>
              <input
                {...register('displayName')}
                type="text"
                autoComplete="name"
                className="input"
                placeholder="Enter your display name"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                ← Back to home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}