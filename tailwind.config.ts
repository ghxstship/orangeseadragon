import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "income": "hsl(var(--chart-income))",
          "expense": "hsl(var(--chart-expense))",
          "axis": "hsl(var(--chart-axis))",
          "grid": "hsl(var(--chart-grid))",
          "tooltip-bg": "hsl(var(--chart-tooltip-bg))",
          "tooltip-border": "hsl(var(--chart-tooltip-border))",
          "tooltip-text": "hsl(var(--chart-tooltip-text))",
        },
        marker: {
          "venue": "hsl(var(--marker-venue))",
          "asset": "hsl(var(--marker-asset))",
          "person": "hsl(var(--marker-person))",
          "event": "hsl(var(--marker-event))",
          "default": "hsl(var(--marker-default))",
        },
        status: {
          "on-track": "hsl(var(--status-on-track))",
          "at-risk": "hsl(var(--status-at-risk))",
          "delayed": "hsl(var(--status-delayed))",
          "completed": "hsl(var(--status-completed))",
          "blocked": "hsl(var(--status-blocked))",
          "todo": "hsl(var(--status-todo))",
          "in-review": "hsl(var(--status-in-review))",
          "milestone": "hsl(var(--status-milestone))",
          "critical-path": "hsl(var(--status-critical-path))",
          "dependency": "hsl(var(--status-dependency))",
        },
        priority: {
          low: "hsl(var(--priority-low))",
          medium: "hsl(var(--priority-medium))",
          high: "hsl(var(--priority-high))",
          urgent: "hsl(var(--priority-urgent))",
        },
        semantic: {
          success: "hsl(var(--semantic-success))",
          warning: "hsl(var(--semantic-warning))",
          info: "hsl(var(--semantic-info))",
          accent: "hsl(var(--semantic-accent))",
          purple: "hsl(var(--semantic-purple))",
          cyan: "hsl(var(--semantic-cyan))",
          orange: "hsl(var(--semantic-orange))",
          indigo: "hsl(var(--semantic-indigo))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        aurora: {
          "0%": { backgroundPosition: "50% 50%, 50% 50%, 50% 50%" },
          "25%": { backgroundPosition: "50% 50%, 100% 0%, 50% 100%" },
          "50%": { backgroundPosition: "0% 0%, 100% 100%, 0% 0%" },
          "75%": { backgroundPosition: "50% 50%, 0% 100%, 100% 50%" },
          "100%": { backgroundPosition: "50% 50%, 50% 50%, 50% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "aurora": "aurora 30s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
