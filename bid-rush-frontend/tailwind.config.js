/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#d4a843",
        "gold-light": "#f0c866",
        bg: "#080810",
        "bg-2": "#0e0e1a",
        "bg-3": "#13131f",
        "bg-4": "#1a1a2e",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Outfit"', "sans-serif"],
      },
    },
  },
  plugins: [],
};