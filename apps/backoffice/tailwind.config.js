/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#040810",
          900: "#070c16",
          800: "#0c1524",
          700: "#111e32",
          600: "#162540",
          500: "#1e304e",
          400: "#2c455e",
          300: "#4d6a85",
          200: "#7a9ab5",
        },
        neon: {
          cyan: "#00c8ff",
          green: "#00e87a",
          red: "#ff3b5c",
          gold: "#ffc24d",
        },
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        exo: ['"Exo 2"', "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0,200,255,0.2), 0 0 40px rgba(0,200,255,0.08)",
        "neon-sm": "0 0 8px rgba(0,200,255,0.35)",
      },
    },
  },
  plugins: [],
};
