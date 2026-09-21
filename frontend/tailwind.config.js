/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx},tsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: "#05070b",
          surface: "#0b0d12",
          elevated: "#12141c",
          emerald: {
            DEFAULT: "#10b981",
            glow: "rgba(16, 185, 129, 0.4)",
            dark: "#059669",
          },
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          // custom emerald colors
          glow: 'rgba(16, 185, 129, 0.4)',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'luxury': '24px',
        'card': '16px',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'luxury': '0 10px 50px -12px rgba(0, 0, 0, 0.5)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'luxury-in': 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
