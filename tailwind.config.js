/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#fafaf9",
        line: "#e5e3de",
        accent: "#3457d5",
      },
    },
  },
  plugins: [],
};
