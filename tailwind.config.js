// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Next.js App Router 사용 시
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Next.js Pages Router 사용 시
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 공용 컴포넌트 폴더가 있다면
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // src 폴더를 사용한다면 이 경로도 추가
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
