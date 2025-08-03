import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'primary-gradient': 'linear-gradient(135deg, #4ADE80 0%, #3B82F6 100%)',
        'accent-glow': 'linear-gradient(135deg, #9333EA 0%, #3B82F6 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: '#0B0F19',
        card: '#111827',
        'primary-gradient-from': '#4ADE80',
        'primary-gradient-to': '#3B82F6',
        'accent-glow-from': '#9333EA',
        'accent-glow-to': '#3B82F6',
        text: '#F9FAFB',
        'text-muted': '#94A3B8',
        ...require('tailwindcss/colors'),
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'glow': {
          '0%, 100%': { 'box-shadow': '0 0 16px 4px #4ADE80, 0 0 32px 8px #3B82F6' },
          '50%': { 'box-shadow': '0 0 32px 8px #9333EA, 0 0 48px 16px #3B82F6' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
