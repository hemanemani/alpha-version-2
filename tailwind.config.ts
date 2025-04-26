// tailwind.config.ts
import { type Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        border: "#000000",
        primary: "#22c55e",  // green-500
        muted: "#f3f4f6",    // gray-100
        destructive: "#ef4444", // red-500
      },
    },
  },
  plugins: [],
};

export default config;
