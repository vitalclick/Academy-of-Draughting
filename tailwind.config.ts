import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          1000: '#050F25',
          900: '#071B3B',
          800: '#0B2547',
          700: '#11315C',
          600: '#1A4080',
          500: '#2A559E',
        },
        blue: {
          700: '#1E4FCC',
          600: '#2860EA',
          500: '#2D6FF7',
          400: '#5A8CFF',
          300: '#93B3FF',
          200: '#C7D7FF',
          100: '#E6EDFF',
        },
        cyan: {
          500: '#3DD9D6',
          400: '#6FE6E2',
          200: '#BFF3F1',
        },
        paper: {
          DEFAULT: '#F4F6FA',
          2: '#E8EDF5',
          3: '#DCE3EF',
        },
        ink: {
          DEFAULT: '#050F25',
          2: '#2A3855',
          3: '#4A5876',
          4: '#8693AC',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '1320px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
