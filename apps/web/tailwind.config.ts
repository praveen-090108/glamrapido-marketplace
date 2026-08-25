import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080f24",
        muted: "#586276",
        blush: "#fff1f6",
        brand: {
          50: "#fff0f5",
          100: "#ffe2ec",
          500: "#f61d5e",
          600: "#e60b4f",
          700: "#ba073f"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(246, 29, 94, 0.09)",
        card: "0 12px 30px rgba(15, 23, 42, 0.055)"
      }
    }
  },
  plugins: []
} satisfies Config;
