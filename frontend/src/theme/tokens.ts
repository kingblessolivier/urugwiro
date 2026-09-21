/**
 * Urugwiro Design Tokens
 *
 * Brand: Trust + Connection + Discovery
 * Palette: Emerald Primary, Neutral Foundation
 */

export const tokens = {
  colors: {
    primary: {
      light: '#10b981', // Emerald 400
      DEFAULT: '#059669', // Emerald 600
      dark: '#047857', // Emerald 700
      deep: '#064e3b', // Emerald 900
    },
    neutral: {
      white: '#ffffff',
      offWhite: '#f9fafb', // Gray 50
      lightGray: '#f3f4f6', // Gray 100
      gray: '#d1d5db', // Gray 300
      slate: '#64748b', // Slate 500
      darkSlate: '#475569', // Slate 600
      nearBlack: '#0f172a', // Slate 900
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 2000,
    modal: 3000,
    toast: 4000,
  }
};

export type Tokens = typeof tokens;
