interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Coffee Brewster Logo"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="currentColor"
          className="text-primary-600 dark:text-primary-400"
        />
        <path
          d="M35 70c5-12 25-12 30 0M30 50c0-11 9-20 20-20s20 9 20 20"
          fill="white"
          className="dark:fill-gray-900"
        />
        <circle cx="43" cy="50" r="5" fill="currentColor" className="text-primary-600 dark:text-primary-400" />
        <circle cx="57" cy="50" r="5" fill="currentColor" className="text-primary-600 dark:text-primary-400" />
      </svg>
    </div>
  );
}