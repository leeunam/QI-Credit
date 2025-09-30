import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        mobile: '390px',
        'desktop-sm': '1280px',
        'desktop-md': '1512px',
        'desktop-lg': '1728px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h2: ['40px', { lineHeight: '48px', fontWeight: '700' }],
        h3: ['32px', { lineHeight: '40px', fontWeight: '600' }],
        h4: ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'body-1': ['20px', { lineHeight: '28px' }],
        'body-2': ['18px', { lineHeight: '26px' }],
        'body-3': ['16px', { lineHeight: '24px' }],
        'body-4': ['14px', { lineHeight: '20px' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--text-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--text-light))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--color-tertiary))",
          foreground: "hsl(var(--text-light))",
        },
        success: {
          DEFAULT: "hsl(var(--color-success))",
          foreground: "hsl(var(--text-light))",
        },
        error: {
          DEFAULT: "hsl(var(--color-error))",
          foreground: "hsl(var(--text-light))",
        },
        info: {
          DEFAULT: "hsl(var(--color-info))",
          foreground: "hsl(var(--text-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning))",
          foreground: "hsl(var(--text-dark))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-error))",
          foreground: "hsl(var(--text-light))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-hero': 'var(--gradient-hero)',
      },
      boxShadow: {
        'elegant': 'var(--shadow-elegant)',
        'card': 'var(--shadow-card)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
