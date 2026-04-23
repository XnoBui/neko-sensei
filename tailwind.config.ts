import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: "#fff5f7",
          100: "#ffe4ec",
          200: "#ffc1d4",
          300: "#ff94b4",
          400: "#ff5e8f",
          500: "#f43f75",
          600: "#d81f5c",
          700: "#ad1648",
          800: "#861239",
          900: "#6b0e2d",
        },
        matcha: {
          500: "#7bb662",
          600: "#5e9c47",
        },
      },
      fontFamily: {
        jp: ['"Hiragino Sans"', '"Yu Gothic"', '"Noto Sans JP"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
