import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This maps the CSS variables from layout.tsx to Tailwind classes
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        widest: ".3em",
        extra: ".5em",
      },
      keyframes: {
        reveal: {
          "0%": { filter: "blur(12px)", opacity: "0" },
          "100%": { filter: "blur(0)", opacity: "1" },
        },
      },
      animation: {
        reveal: "reveal 1.5s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;