import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b9dbff',
          300: '#88c3ff',
          400: '#55a6ff',
          500: '#2d8aff',
          600: '#186fe3',
          700: '#1358b3',
          800: '#114a92',
          900: '#113f78',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#6b7280',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [forms],
}