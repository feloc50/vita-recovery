/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007890',
          50: '#f0f9fb',
          100: '#d9eff4',
          200: '#b8e2eb',
          300: '#88cedd',
          400: '#4fb3ca',
          500: '#007890',
          600: '#006b85',
          700: '#005670',
          800: '#00475d',
          900: '#003c4f',
          950: '#002838',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'toast-slide-in': 'toast-slide-in 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'progress': 'progress 4s linear forwards',
      },
      keyframes: {
        'toast-slide-in': {
          '0%': { transform: 'translateY(-100%) translateX(-50%)', opacity: 0 },
          '100%': { transform: 'translateY(0) translateX(-50%)', opacity: 1 },
        },
        'progress': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
};