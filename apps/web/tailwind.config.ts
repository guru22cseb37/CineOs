import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          void: '#05050A',        // near-black background
          obsidian: '#0D0D1A',    // card background
          glass: 'rgba(255,255,255,0.04)', // glassmorphism surface
          gold: '#F5C842',        // primary accent
          crimson: '#E63946',     // danger / dislike
          jade: '#2EC4B6',        // success / like
          muted: '#8B8FA8',       // secondary text
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
