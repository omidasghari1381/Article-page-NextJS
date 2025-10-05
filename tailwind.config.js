/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {},screens: {
      xs: "480px",     // 📱 موبایل کوچک
      sm: "640px",     // 📱 موبایل بزرگ
      md: "768px",     // 📱 تبلت
      lg: "1124px",    // 💻 لپ‌تاپ ۱۳ اینچ
      xl: "1280px",    // 💻 لپ‌تاپ بزرگ‌تر
      xl14: "1366px",  // 💻 مخصوص ۱۴ اینچ
      "2xl": "1536px", // 🖥 مانیتورهای بزرگ
    }, },
  plugins: [],
  extend: {
    colors: {
      customGray: "#F5F5F5",
      customBlack: "#393F3F",
    },
  },
};
