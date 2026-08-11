import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080A0C",
        graphite: "#171B1E",
        ceramic: "#F1F3F0",
        smoke: "#D8DEDC",
        line: "rgba(255,255,255,0.12)",
        mint: "#6EE7B7",
        coral: "#FF6B5F",
        steel: "#91A3AD"
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "sans-serif"],
        sans: ["var(--font-body)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Cascadia Code", "ui-monospace", "monospace"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(110, 231, 183, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
