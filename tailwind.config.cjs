/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1124px",
      xl: "1280px",
      xl14: "1366px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        skin: {
          base: "rgb(var(--c-fg) / <alpha-value>)",
          heading: "rgb(var(--c-heading) / <alpha-value>)",
          bg: "rgb(var(--c-bg) / <alpha-value>)",
          card: "rgb(var(--c-card) / <alpha-value>)",
          border: "rgb(var(--c-border) / <alpha-value>)",
          divider: "rgb(var(--c-divider) / <alpha-value>)",
          muted: "rgb(var(--c-muted) / <alpha-value>)",
          accent: "rgb(var(--c-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--c-accent-hover) / <alpha-value>)",
        },
      },
      borderColor: {
        DEFAULT: "rgb(var(--c-border) / <alpha-value>)",
      },
      divideColor: {
        DEFAULT: "rgb(var(--c-divider) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};