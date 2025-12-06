/** @type {import('tailwindcss').Config} */

/**
 * Tailwind CSS Configuration - Material Design 3 Edition
 * Version: 2.1.0
 * Updated: 2025-12-03
 *
 * Based on Material Design 3 (Material You) specification
 * https://m3.material.io/
 *
 * Integrated with Crayon UI SDK (Thesys)
 * https://crayonai.org/
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Crayon UI components
    "./node_modules/@crayonai/react-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ============================================
         MATERIAL DESIGN 3 COLOR SYSTEM
         ============================================ */
      colors: {
        // Primary
        primary: {
          DEFAULT: '#6750A4',
          light: '#EADDFF',
          dark: '#21005D',
          container: '#EADDFF',
          'on-container': '#21005D',
          50: '#F3E5F5',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#AB47BC',
          500: '#6750A4',
          600: '#5E35B1',
          700: '#512DA8',
          800: '#4527A0',
          900: '#311B92',
        },

        // Secondary
        secondary: {
          DEFAULT: '#625B71',
          light: '#E8DEF8',
          dark: '#1D192B',
          container: '#E8DEF8',
          'on-container': '#1D192B',
        },

        // Tertiary
        tertiary: {
          DEFAULT: '#7D5260',
          light: '#FFD8E4',
          dark: '#31111D',
          container: '#FFD8E4',
          'on-container': '#31111D',
        },

        // Error
        error: {
          DEFAULT: '#B3261E',
          light: '#F9DEDC',
          dark: '#410E0B',
          container: '#F9DEDC',
          'on-container': '#410E0B',
        },

        // Surface (M3 Surface Levels)
        surface: {
          DEFAULT: '#FEF7FF',
          dim: '#DED8E1',
          bright: '#FEF7FF',
          'container-lowest': '#FFFFFF',
          'container-low': '#F7F2FA',
          container: '#F3EDF7',
          'container-high': '#ECE6F0',
          'container-highest': '#E6E0E9',
          variant: '#E7E0EC',
        },

        // On-Surface colors
        'on-surface': {
          DEFAULT: '#1D1B20',
          variant: '#49454F',
        },

        // Outline
        outline: {
          DEFAULT: '#79747E',
          variant: '#CAC4D0',
        },

        // Background
        background: {
          DEFAULT: '#FEF7FF',
        },

        // Inverse
        inverse: {
          surface: '#322F35',
          'on-surface': '#F5EFF7',
          primary: '#D0BCFF',
        },

        // Brand color (customizable)
        brand: {
          DEFAULT: 'var(--md-brand-color, #667eea)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#667eea',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },

      /* ============================================
         MATERIAL DESIGN 3 TYPOGRAPHY
         ============================================ */
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        brand: ['Google Sans', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Fira Code', 'Roboto Mono', 'monospace'],
      },

      fontSize: {
        // Display
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-md': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],

        // Headline
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],

        // Title
        'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],

        // Label
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],

        // Body
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
      },

      /* ============================================
         MATERIAL DESIGN 3 SHAPE (Border Radius)
         ============================================ */
      borderRadius: {
        'none': '0px',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
        'full': '9999px',
      },

      /* ============================================
         MATERIAL DESIGN 3 ELEVATION (Box Shadow)
         ============================================ */
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      },

      /* ============================================
         MATERIAL DESIGN 3 MOTION (Transitions)
         ============================================ */
      transitionDuration: {
        'short1': '50ms',
        'short2': '100ms',
        'short3': '150ms',
        'short4': '200ms',
        'medium1': '250ms',
        'medium2': '300ms',
        'medium3': '350ms',
        'medium4': '400ms',
        'long1': '450ms',
        'long2': '500ms',
        'long3': '550ms',
        'long4': '600ms',
      },

      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'standard-decelerate': 'cubic-bezier(0, 0, 0, 1)',
        'standard-accelerate': 'cubic-bezier(0.3, 0, 1, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },

      /* ============================================
         MATERIAL DESIGN 3 STATE LAYERS
         ============================================ */
      opacity: {
        'hover': '0.08',
        'focus': '0.12',
        'pressed': '0.12',
        'dragged': '0.16',
      },

      /* ============================================
         ANIMATIONS
         ============================================ */
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-in-up': 'fadeInUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'ripple': 'ripple 400ms ease-out forwards',
        'spin-slow': 'spin 1.5s linear infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        ripple: {
          from: { transform: 'scale(0)', opacity: '0.5' },
          to: { transform: 'scale(4)', opacity: '0' },
        },
      },

      /* ============================================
         SPACING
         ============================================ */
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },

  /* ============================================
     PLUGINS
     ============================================ */
  plugins: [
    // Crayon UI requires tailwindcss-animate for transitions
    require('tailwindcss-animate'),

    // Custom plugin for M3 state layers
    function({ addUtilities }) {
      addUtilities({
        '.state-layer': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.state-layer::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          background: 'currentColor',
          opacity: '0',
          transition: 'opacity 200ms ease',
          pointerEvents: 'none',
        },
        '.state-layer:hover::before': {
          opacity: '0.08',
        },
        '.state-layer:focus-visible::before': {
          opacity: '0.12',
        },
        '.state-layer:active::before': {
          opacity: '0.12',
        },
      })
    },
  ],

  /* ============================================
     DARK MODE
     ============================================ */
  darkMode: 'media', // or 'class' for manual toggle
}
