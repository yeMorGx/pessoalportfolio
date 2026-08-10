import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050608",
        graphite: "#111318",
        line: "rgba(255,255,255,0.12)",
        mint: "#77F2C3",
        coral: "#FF6B5F",
        steel: "#8DA2B8"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["Cascadia Code", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(119, 242, 195, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
