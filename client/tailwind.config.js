/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        platform: {
          '今日头条': '#e74c3c',
          '百度热搜': '#2980b9',
          '网易新闻': '#c0392b',
          '新浪新闻': '#d35400',
          '微信公众号': '#27ae60',
        }
      },
    },
  },
  plugins: [],
}
