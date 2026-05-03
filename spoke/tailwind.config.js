/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:               '#080D1A',
        surface:          '#0F1629',
        'surface-raised': '#162040',
        bdr:              '#1E2D4A',
        primary:          '#6366F1',
        'primary-h':      '#4F46E5',
        voice:            '#FF6B6B',
        tp:               '#F1F5F9',
        ts:               '#94A3B8',
        tm:               '#4A5568',
        ok:               '#10B981',
        warn:             '#F59E0B',
        err:              '#EF4444',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'mic-pulse': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'    },
          '50%':      { transform: 'scale(1.10)', opacity: '0.80' },
        },
        'ring-pulse': {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.05)', opacity: '0.7' },
        },
        'wavebar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)'   },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'mic-pulse-idle':      'mic-pulse 2.2s ease-in-out infinite',
        'mic-pulse-recording': 'mic-pulse 0.7s ease-in-out infinite',
        'ring-idle':           'ring-pulse 2.2s ease-in-out infinite',
        'ring-recording':      'ring-pulse 0.7s ease-in-out infinite',
        'wavebar':             'wavebar 1.0s ease-in-out infinite',
        'blink':               'blink 1s step-end infinite',
        'pulse-dot':           'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
