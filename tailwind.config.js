/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'rgb(var(--ink-950) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          850: 'rgb(var(--ink-850) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          750: 'rgb(var(--ink-750) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          650: 'rgb(var(--ink-650) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
        },
        brass: {
          50: '#fbf4e4',
          100: '#f6e7c6',
          200: '#edd298',
          300: '#e4bd6b',
          400: '#e8b454',
          500: '#d49f3f',
          600: '#b07f30',
          700: '#855f26',
          800: '#5a4019',
        },
        phosphor: {
          300: '#9ee6a0',
          400: '#7dd87d',
          500: '#56b85f',
          600: '#3a9647',
        },
        cream: {
          50: 'rgb(var(--cream-50) / <alpha-value>)',
          100: 'rgb(var(--cream-100) / <alpha-value>)',
          200: 'rgb(var(--cream-200) / <alpha-value>)',
          400: 'rgb(var(--cream-400) / <alpha-value>)',
          500: 'rgb(var(--cream-500) / <alpha-value>)',
          600: 'rgb(var(--cream-600) / <alpha-value>)',
        },
        rust: '#cf6a4f',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Noto Serif SC"', 'serif'],
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        brass: '0 0 0 1px rgba(232,180,84,0.25), 0 8px 30px -8px rgba(232,180,84,0.18)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
        glow: '0 0 24px -4px rgba(232,180,84,0.35)',
      },
      backgroundImage: {
        'blueprint': "linear-gradient(rgba(232,180,84,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(232,180,84,0.045) 1px, transparent 1px)",
        'radial-brass': 'radial-gradient(circle at 50% 0%, rgba(232,180,84,0.10), transparent 60%)',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        rise: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        scan: 'scan 6s linear infinite',
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        rise: 'rise 0.5s cubic-bezier(0.2,0.7,0.2,1) both',
      },
    },
  },
  plugins: [],
}
