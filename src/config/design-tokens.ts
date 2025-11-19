/**
 * Design tokens for the yoga booking app
 * Aligned with .cursorrules design system
 * Note: Most styling should use Tailwind CSS classes and CSS variables.
 * This file is for reference and programmatic access only.
 */

export const colors = {
  primary: {
    DEFAULT: "#4E95FF", // Soft blue per .cursorrules
    subtle: "#EFF4FF", // Very light blue wash for backgrounds / highlights
    foreground: "#FFFFFF",
  },
  accent: {
    lavender: "#A5B4FC", // Soft lavender
    mint: "#A7F3D0", // Alternative accent
    subtle: "#EEF2FF", // Gentle accent wash
  },
  background: {
    canvas: "#F5F4F1", // Warm light neutral for page background
    muted: "#F3F4F6", // Muted sections, subtle panels
    soft: "#F9FAFB", // General light neutral (can be used in components)
    surface: "#FFFFFF", // Primary card / surface color
  },
  text: {
    primary: "#0F172A", // Slate-900 style
    secondary: "#64748B", // Muted
    tertiary: "#94A3B8", // Even softer / meta
    onPrimary: "#FFFFFF",
  },
  border: {
    DEFAULT: "#E5E7EB", // Light gray per .cursorrules
    subtle: "#E2E8F0", // Slightly stronger when more definition is needed
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  states: {
    hoverSoft: "rgba(148, 163, 253, 0.08)", // For hover backgrounds
    activeSoft: "rgba(78, 149, 255, 0.10)", // For active pills / selections
  },
} as const;

/**
 * Spacing scale per .cursorrules
 * Allowed values: 4, 8, 12, 16, 24, 32
 */
export const spacing = {
  1: "4px", // 0.25rem
  2: "8px", // 0.5rem
  3: "12px", // 0.75rem
  4: "16px", // 1rem
  6: "24px", // 1.5rem
  8: "32px", // 2rem
} as const;

export const typography = {
  fontFamily: {
    sans: "'Geist', system-ui, -apple-system, sans-serif",
    mono: "'Geist Mono', monospace",
  },
  /**
   * Typography scale per .cursorrules
   * h1: text-3xl–text-4xl
   * h2: text-2xl
   * h3: text-xl
   * Body: text-sm–text-base
   * Meta: text-xs
   */
  fontSize: {
    xs: "0.75rem", // 12px - meta text
    sm: "0.875rem", // 14px - body
    base: "1rem", // 16px - body
    xl: "1.25rem", // 20px - h3
    "2xl": "1.5rem", // 24px - h2
    "3xl": "1.875rem", // 30px - h1
    "4xl": "2.25rem", // 36px - h1
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Border radius per .cursorrules
 * Cards: rounded-xl, rounded-2xl, rounded-3xl
 * Pills: rounded-full
 * Avoid: rounded-sm
 */
export const borderRadius = {
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px", // Full rounded for pills/badges
} as const;

/**
 * Shadows per .cursorrules
 * Use minimal shadow - cards should be light
 */
export const shadows = {
  xs: "0 0 0 1px rgba(15, 23, 42, 0.02)", // Very soft outline
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // Minimal for cards
} as const;

export const transitions = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
} as const;
