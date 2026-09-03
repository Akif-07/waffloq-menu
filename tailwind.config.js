/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        waffloq: {
          50: '#edf9f8',
          100: '#d5f2ef',
          200: '#b0e5e0',
          300: '#7ed1cb',
          400: '#47b5ae',
          500: '#23958e', // Primary Waffloq Teal
          600: '#1b7a75',
          700: '#17625e',
          800: '#144e4b',
          900: '#0f3c3a', // Deep Luxury Teal
          950: '#082524',
        },
        berry: {
          light: '#f87171',
          DEFAULT: '#d84a56', // Logo raspberry color
          dark: '#be123c',
        },
        waffle: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b', // Waffle golden crust
          dark: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        brand: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'teal-glow': '0 10px 30px -10px rgba(35, 149, 142, 0.35)',
        'card-soft': '0 4px 20px -2px rgba(15, 60, 58, 0.06), 0 2px 6px -1px rgba(15, 60, 58, 0.04)',
      }
    },
  },
  plugins: [],
}
