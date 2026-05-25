/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        star: {
          dark: '#0a0e1a',
          navy: '#121a2e',
          purple: '#6b4ce6',
          gold: '#f0c040',
          cyan: '#4ecdc4',
          pink: '#e879a9',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'star-gradient': 'linear-gradient(135deg, #121a2e 0%, #1a1040 50%, #0a0e1a 100%)',
      },
    },
  },
  plugins: [],
};
