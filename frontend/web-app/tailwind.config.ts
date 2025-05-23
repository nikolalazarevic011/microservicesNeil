import type { Config } from "tailwindcss";
import flowbiteReact from "flowbite-react/plugin/tailwindcss";
import aspectRatio from '@tailwindcss/aspect-ratio';
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ".flowbite-react\\class-list.json"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [flowbiteReact,aspectRatio],
};
export default config;