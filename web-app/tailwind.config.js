/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f6f3',
          100: '#dfe9e2',
          200: '#bfd3c5',
          300: '#94b5a0',
          400: '#679278',
          500: '#47755b',
          600: '#355d47',
          700: '#2a4a39',
          800: '#1f3a2c',
          900: '#152a20',
          950: '#0c1913',
        },
        cream: {
          50: '#fdfbf6',
          100: '#f8f3e8',
          200: '#efe5cf',
          300: '#e3d3b0',
        },
        gold: {
          300: '#e6cf98',
          400: '#d8b872',
          500: '#c69d4f',
          600: '#a9803a',
          700: '#86632e',
        },
        ink: '#16201b',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.08) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.18) translate3d(-1.5%, -1%, 0)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(28px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fade: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scrollcue: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        kenburns: 'kenburns 24s ease-out infinite alternate',
        rise: 'rise 1.1s cubic-bezier(.2,.7,.2,1) both',
        fade: 'fade 1.4s ease both',
        scrollcue: 'scrollcue 2.2s cubic-bezier(.6,0,.4,1) infinite',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
