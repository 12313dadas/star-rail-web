/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        star: {
          void: '#050810',
          dark: '#0a0e1a',
          navy: '#0f1628',
          panel: '#141c32',
          purple: '#7c5cff',
          'purple-dim': '#4a3a9e',
          gold: '#e8b84a',
          'gold-bright': '#ffd875',
          cyan: '#5eead4',
          'cyan-dim': '#2dd4bf',
          pink: '#f472b6',
          trail: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        display: ['Orbitron', '"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'star-glow': '0 0 40px rgba(124, 92, 255, 0.35)',
        'gold-glow': '0 0 30px rgba(232, 184, 74, 0.4)',
        'panel': '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'star-drift': 'star-drift 80s linear infinite',
        'train-pass': 'train-pass 3.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'intro-fade': 'intro-fade 4s ease-in-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 92, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 184, 74, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'star-drift': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'train-pass': {
          '0%': { transform: 'translateX(-120%) scale(0.85)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateX(120vw) scale(1.05)', opacity: '0' },
        },
        'intro-fade': {
          '0%, 70%': { opacity: '1' },
          '100%': { opacity: '0', pointerEvents: 'none' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'star-mesh': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 92, 255, 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(94, 234, 212, 0.08), transparent), radial-gradient(ellipse 50% 30% at 0% 80%, rgba(232, 184, 74, 0.06), transparent)',
        'gold-line': 'linear-gradient(90deg, transparent, #e8b84a, #ffd875, #e8b84a, transparent)',
        'btn-star': 'linear-gradient(135deg, #7c5cff 0%, #5b4ab8 50%, #e8b84a 100%)',
      },
    },
  },
  plugins: [],
};
