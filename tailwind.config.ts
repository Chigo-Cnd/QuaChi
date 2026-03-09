import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        accent: {
          DEFAULT: '#2563EB',
          dark:    '#1D4ED8',
          light:   '#EFF6FF',
          glow:    '#60A5FA',
        },
        lab: {
          bg:      '#0F1923',
          surface: '#162032',
          border:  '#1E3A5F',
          glow:    '#0EA5E9',
        },
      },
      fontFamily: {
        sans:  ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bubble-rise': 'bubbleRise 2s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'glow':        'glow 2s ease-in-out infinite',
      },
      keyframes: {
        bubbleRise: {
          '0%':   { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-80px) scale(0)', opacity: '0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px #2563EB55' },
          '50%':      { boxShadow: '0 0 24px #2563EBAA' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
