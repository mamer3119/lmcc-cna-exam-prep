import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-sunken": "var(--surface-sunken)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        critical: "var(--critical)",
        "critical-bg": "var(--critical-bg)",
        core: "var(--core)",
        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        error: "var(--error)",
        mastered: "var(--mastered)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      fontVariantNumeric: {
        tnum: "tabular-nums",
      },
      borderRadius: {
        card: "var(--radius-card)",
        chip: "var(--radius-chip)",
        btn: "var(--radius-btn)",
      },
    },
  },
  plugins: [],
};

export default config;
