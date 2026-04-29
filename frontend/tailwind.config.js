/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        bgPage: "#0a0e1a",
        bgCard: "#0f1629",
        borderMain: "#1e2d4a",
        textPrimary: "#e2e8f0",
        textSecondary: "#64748b",
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeSlideIn: "fadeSlideIn 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
