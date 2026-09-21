/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx},tsx",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          canvas: "#0a0e17",
          surface: "#101623",
          card: "#151d2e",
          cardHover: "#1c273d",
          cardSub: "#1a2336",
          border: "rgba(255, 255, 255, 0.14)",
          borderLight: "rgba(255, 255, 255, 0.22)",
          gold: "#e2ca9c",
          goldHover: "#ebd8b5",
          goldMuted: "rgba(226, 202, 156, 0.15)",
        },
        brand: {
          deep: "#0a0e17",
          surface: "#101623",
          elevated: "#151d2e",
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
