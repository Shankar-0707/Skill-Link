import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // ── Core Semantic Tokens ──────────────────────────────
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        // ── Primary — Nocturnal Navy (#000613 / #001F3F) ──────
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          container: "var(--primary-container)",
          fixed: "var(--primary-fixed)",
          "fixed-dim": "var(--primary-fixed-dim)",
        },

        // ── Secondary — Muted Slate Blue ──────────────────────
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          container: "var(--secondary-container)",
          fixed: "var(--secondary-fixed)",
          "fixed-dim": "var(--secondary-fixed-dim)",
        },

        // ── Tertiary — Deep Terracotta ────────────────────────
        tertiary: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--tertiary-foreground)",
          container: "var(--tertiary-container)",
          fixed: "var(--tertiary-fixed)",
          "fixed-dim": "var(--tertiary-fixed-dim)",
        },

        // ── Destructive / Error ───────────────────────────────
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
        },

        // ── Muted ─────────────────────────────────────────────
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // ── Accent ────────────────────────────────────────────
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        // ── Semantic Status ───────────────────────────────────
        success: {
          DEFAULT: "var(--success)",
        },
        warning: {
          DEFAULT: "var(--warning)",
        },

        // ── Surface Hierarchy (Tonal Layers) ──────────────────
        surface: {
          DEFAULT: "var(--surface)",
          bright: "var(--surface-bright)",
          dim: "var(--surface-dim)",
          variant: "var(--surface-variant)",
          tint: "var(--surface-tint)",
          container: "var(--surface-container)",
          "container-low": "var(--surface-container-low)",
          "container-lowest": "var(--surface-container-lowest)",
          "container-high": "var(--surface-container-high)",
          "container-highest": "var(--surface-container-highest)",
        },

        // ── Outline ───────────────────────────────────────────
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },

        // ── Inverse ───────────────────────────────────────────
        inverse: {
          primary: "var(--inverse-primary)",
          surface: "var(--inverse-surface)",
          "on-surface": "var(--inverse-on-surface)",
        },
      },

      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },

      // ── Border Radius — ROUND_FOUR (base: 6px / 0.375rem) ──
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ── Keyframes ─────────────────────────────────────────
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
  plugins: [animate],
}

export default config
