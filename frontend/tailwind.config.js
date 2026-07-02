/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Palet "buku ledger sekolah": tinta navy + aksen kuningan stempel
        ink: {
          50: "#EEF1F6",
          100: "#D9E0EB",
          200: "#AEBBD2",
          400: "#5A6E94",
          600: "#2A3A5C",
          700: "#1E2C49",
          800: "#16233D", // primary
          900: "#0F1830",
        },
        paper: "#F4F6FA",
        brass: {
          50: "#FBF3E3",
          200: "#EBCB87",
          400: "#D6A53C",
          500: "#C8932B", // accent / stempel
          600: "#A8761E",
        },
        slate: {
          DEFAULT: "#3C4656",
        },
        success: "#2F8F5B",
        danger: "#C0392B",
      },
      fontFamily: {
        display: ["Lora", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,24,48,0.04), 0 4px 16px rgba(15,24,48,0.06)",
      },
    },
  },
  plugins: [],
};
