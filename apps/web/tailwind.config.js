/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Use system preference for dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: '#f7f3f0',
          100: '#ede4dc',
          200: '#dbc8b8',
          300: '#c4a68f',
          400: '#b08968',
          500: '#a0754e',
          600: '#936442',
          700: '#7a5338',
          800: '#654532',
          900: '#533a2c',
        },
      },
    },
  },
  plugins: [],
};