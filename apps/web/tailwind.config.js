/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Background palette (adapts to theme)
        background: {
          DEFAULT: "rgb(var(--color-background) / <alpha-value>)",
          secondary: "rgb(var(--color-background-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-background-tertiary) / <alpha-value>)",
          elevated: "rgb(var(--color-background-elevated) / <alpha-value>)",
        },
        // Primary accent color (Green)
        primary: {
          DEFAULT: "#22c55e", // Green-500
          hover: "#16a34a", // Green-600
          active: "#15803d", // Green-700
          glow: "rgba(34, 197, 94, 0.5)",
        },
        // Text colors (adapts to theme)
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        // Border colors (adapts to theme)
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          hover: "rgb(var(--color-border-hover) / <alpha-value>)",
          active: "rgb(var(--color-border-active) / <alpha-value>)",
        },
        // Status colors
        status: {
          success: "#22c55e",
          warning: "#eab308",
          error: "#ef4444",
          info: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 20px rgba(34, 197, 94, 0.4)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};
