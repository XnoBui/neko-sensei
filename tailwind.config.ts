import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // iOS 26 system palette
        ios: {
          bg: "#f2f2f7",        // systemGroupedBackground (light)
          bg2: "#ffffff",        // secondarySystemGroupedBackground
          surface: "rgba(255,255,255,0.72)",
          stroke: "rgba(60,60,67,0.18)",   // separator
          strokeSoft: "rgba(60,60,67,0.08)",
          label: "#1c1c1e",
          label2: "#3c3c43",
          label3: "rgba(60,60,67,0.6)",
          label4: "rgba(60,60,67,0.3)",
          blue: "#007aff",
          blueDark: "#0a84ff",
          indigo: "#5856d6",
          green: "#34c759",
          red: "#ff3b30",
          orange: "#ff9500",
          pink: "#ff375f",
          fill: "rgba(120,120,128,0.12)",
          fill2: "rgba(120,120,128,0.08)",
        },
      },
      fontFamily: {
        sf: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"',
          '"Helvetica Neue"', 'Inter', 'system-ui', 'sans-serif',
        ],
        sfRound: ['"SF Pro Rounded"', '-apple-system', 'system-ui', 'sans-serif'],
        jp: [
          '"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', '"Yu Gothic"',
          '"Noto Sans JP"', 'sans-serif',
        ],
      },
      borderRadius: {
        ios: "14px",
        iosLg: "22px",
        iosXl: "28px",
      },
      boxShadow: {
        ios: "0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 24px -8px rgba(15,15,30,0.18)",
        iosSoft: "0 2px 12px -4px rgba(15,15,30,0.12)",
      },
      backdropBlur: {
        ios: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
