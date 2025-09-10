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
        // Shalean Cleaning Services Brand Colors
        primary: {
          DEFAULT: "#1E88E5", // Trustworthy Blue
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E3F2FD", // Clean Sky Blue
          foreground: "#212121",
        },
        accent: {
          DEFAULT: "#AEEA00", // Energetic Lime Green
          foreground: "#212121",
        },
        background: "#FFFFFF", // Pure White
        foreground: "#212121", // Charcoal Black
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#212121",
        },
        muted: {
          DEFAULT: "#F0F0F0", // Light Grey
          foreground: "#616161", // Medium Grey
        },
        border: "#E0E0E0", // Light border color
        input: "#F0F0F0",
        ring: "#1E88E5", // Primary blue for focus rings
        destructive: {
          DEFAULT: "#DC2626", // Red for destructive actions
          foreground: "#FFFFFF",
        },
        // Additional brand-specific colors
        "brand-blue": {
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#1E88E5", // Primary
          600: "#1976D2",
          700: "#1565C0",
          800: "#0D47A1",
          900: "#0A3D91",
        },
        "brand-green": {
          50: "#F1F8E9",
          100: "#DCEDC8",
          200: "#C5E1A5",
          300: "#AED581",
          400: "#9CCC65",
          500: "#AEEA00", // Accent
          600: "#8BC34A",
          700: "#689F38",
          800: "#558B2F",
          900: "#33691E",
        },
        "brand-neutral": {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#616161", // Medium Grey
          700: "#424242",
          800: "#303030",
          900: "#212121", // Charcoal Black
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // Note: In Tailwind CSS v4, plugins are handled differently
  // The tailwindcss-animate plugin is not needed in v4
};

export default config;
