/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFBF4',
          100: '#FFF8F0',
          200: '#FDF1DF',
          300: '#F6E3C4'
        },
        terracotta: {
          50: '#FBEEE4',
          100: '#F4D9C2',
          200: '#E9B895',
          300: '#DB9468',
          400: '#C86A3C',
          500: '#B05730',
          600: '#8F4A28',
          700: '#6F3920',
          800: '#4E2817'
        },
        olive: {
          100: '#E4EAD1',
          300: '#B3C179',
          500: '#6B8E23',
          700: '#4A6318'
        },
        ink: {
          50: '#F1EAE3',
          300: '#8B7D76',
          500: '#544640',
          700: '#2C2320'
        },
        danger: {
          400: '#C85050',
          500: '#B23A3A',
          600: '#8F2828'
        }
      },
      fontFamily: {
        heading: ['Quicksand', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
      },
      fontSize: {
        base: ['18px', '28px'],
        lg: ['20px', '30px'],
        xl: ['22px', '32px'],
        '2xl': ['28px', '36px'],
        '3xl': ['36px', '44px'],
        '4xl': ['48px', '56px']
      },
      borderRadius: {
        DEFAULT: '14px',
        lg: '20px',
        xl: '28px'
      },
      boxShadow: {
        card: '0 4px 14px rgba(70, 40, 20, 0.06)',
        pop: '0 10px 30px rgba(70, 40, 20, 0.12)'
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        pop: 'pop 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
        slideUp: 'slideUp 0.28s ease-out',
        fadeIn: 'fadeIn 0.28s ease-out'
      }
    }
  },
  plugins: []
}
