// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-mint-50",
    "bg-mint-100",
    "bg-mint-200",
    "bg-mint-300",
    "bg-mint-400",
    "bg-mint-500",
    "bg-mint-600",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#f3fdfa",
          100: "#d1f8ec",
          200: "#aaf0db",
          300: "#78e6c8",
          400: "#4bdcb4",
          500: "#26d3a1",
          600: "#1ab88a",
          700: "#149770",
          800: "#0d7658",
          900: "#065840",
        },
      },
    },
  },
  plugins: [
    // 여기에 Tailwind CSS 플러그인을 추가할 수 있습니다.
  ],
};
