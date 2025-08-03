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
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'ibm-plex-mono': ['IBM Plex Mono', 'monospace'],
        'heading': ['Space Grotesk', 'sans-serif'],
      },
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
      boxShadow: {
        'glow': '0 0 16px 4px rgba(74, 222, 128, 0.3), 0 0 32px 8px rgba(59, 130, 246, 0.2)',
        'glow-card': '0 0 20px 8px rgba(74, 222, 128, 0.15), 0 0 40px 16px rgba(59, 130, 246, 0.1)',
        'glow-lg': '0 0 32px 12px rgba(74, 222, 128, 0.25), 0 0 64px 24px rgba(59, 130, 246, 0.15)',
      },
      colors: {
        background: '#0B0F19',
        'primary-gradient-from': '#4ADE80',
        'primary-gradient-to': '#3B82F6',
        'accent-glow-from': '#9333EA',
        'accent-glow-to': '#3B82F6',
        text: '#F9FAFB',
        'text-muted': '#94A3B8',
        // Custom colors without deprecated ones
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
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
        'gradient-move': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
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
        'gradient-move': 'gradient-move 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
