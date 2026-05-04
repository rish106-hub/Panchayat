/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#F8FAFC',
        surface: '#FFFFFF',
        'surface-2': '#F1F5F9',
        border:  '#E2E8F0',
        'border-strong': '#CBD5E1',
        'text-primary':   '#0F172A',
        'text-secondary': '#475569',
        'text-muted':     '#94A3B8',
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        success: { DEFAULT: '#059669', light: '#D1FAE5', text: '#065F46' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', text: '#92400E' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2', text: '#991B1B' },
        info:    { DEFAULT: '#0284C7', light: '#E0F2FE', text: '#0C4A6E' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':'0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        modal:   '0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'mic-pulse': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.08)', opacity: '0.8' },
        },
        wavebar: {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%':      { transform: 'scaleY(1)'    },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition:  '400px 0' },
        },
      },
      animation: {
        'slide-up':  'slide-up 0.18s ease-out',
        'fade-in':   'fade-in 0.15s ease-out',
        'mic-pulse': 'mic-pulse 1s ease-in-out infinite',
        wavebar:     'wavebar 1s ease-in-out infinite',
        shimmer:     'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
}
