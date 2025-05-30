// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 여기에 커스텀 테마 설정을 추가할 수 있습니다.
      // 예시:
      // colors: {
      //   'custom-blue': '#0070f3',
      // },
    },
  },
  plugins: [
    // 여기에 Tailwind CSS 플러그인을 추가할 수 있습니다.
  ],
};
