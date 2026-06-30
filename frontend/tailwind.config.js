/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0D1117',
        panel: '#161B22',
        panel2: '#1C2128',
        border: '#30363D',
        ink: '#E6EDF3',
        muted: '#8B949E',
        accent: '#3FB950',
        accent2: '#A371F7',
        danger: '#F85149',
        amber: '#D29922'
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'sans-serif']
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: 1 },
          '50.01%, 100%': { opacity: 0 }
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        fadeUp: 'fadeUp 0.35s ease-out both'
      }
    }
  },
  plugins: []
}
