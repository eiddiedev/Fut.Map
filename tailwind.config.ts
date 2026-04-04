import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#02050a",
          panel: "#071016",
          line: "#1cffb3",
          glow: "#84ffd7"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(28,255,179,0.12), 0 0 40px rgba(28,255,179,0.16)"
      },
      backgroundImage: {
        "grid-radial":
          "radial-gradient(circle at 50% 0%, rgba(38,255,208,0.12), transparent 32%), linear-gradient(180deg, rgba(3,7,12,0.4), rgba(3,7,12,0.92))"
      }
    }
  },
  plugins: []
};

export default config;
