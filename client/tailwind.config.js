/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gallery: {
          dark: '#121212',
          darkSurface: '#1a1a1a',
          darkCard: '#242424',
          darkBorder: '#2e2e2e',
          light: '#faf8f5',
          lightSurface: '#f0ede8',
          lightCard: '#ffffff',
          lightBorder: '#e5e0d8',
          accent: '#c9a84c',
          accentHover: '#d4b85c',
          accentMuted: 'rgba(201, 168, 76, 0.15)',
          text: '#faf8f5',
          textMuted: '#a0a0a0',
          textDark: '#1a1a1a',
          textDarkMuted: '#6b6b6b',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
