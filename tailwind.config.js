/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#fafafa",
        paper: "#050505",
        line: "rgba(255,255,255,0.08)",
        accent: "#3457d5",
        surface: {
          DEFAULT: "#0a0a0a",
          raised: "#111111",
          border: "rgba(255,255,255,0.08)",
        },
        github: {
          DEFAULT: "#238636",
          hover: "#2ea043",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      animation: {
        spotlight: "spotlight 2s ease 0.75s 1 forwards",
        aurora: "aurora 60s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        "beam-pulse": "beam-pulse 8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%, -40%) scale(1)" },
        },
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "beam-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
