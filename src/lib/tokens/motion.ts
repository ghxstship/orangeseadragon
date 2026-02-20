/**
 * MOTION DESIGN TOKENS — Single Source of Truth
 *
 * All animation durations, easing curves, spring configs, and motion presets
 * are defined here. Components MUST import from this module instead of
 * hardcoding values. CSS custom properties mirror these values in globals.css
 * for Tailwind/CSS consumers.
 *
 * Naming convention:
 *   DURATION_*   — timing in seconds (framer-motion) or ms (CSS)
 *   EASE_*       — cubic-bezier arrays (framer-motion) or strings (CSS)
 *   SPRING_*     — spring physics configs (framer-motion only)
 *   MOTION_*     — composed presets combining initial/animate/exit/transition
 */

import type { Transition, Variants } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   DURATIONS (seconds — framer-motion native unit)
   CSS mirrors use ms via --motion-duration-* custom properties.
   ───────────────────────────────────────────────────────────── */

export const DURATION = {
  instant: 0,
  fast: 0.15,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.4,
  slower: 0.5,
  deliberate: 0.7,
  counter: 1,
  shimmer: 1.5,
  chart: 1.5,
  aurora: 30,
} as const;

/* ─────────────────────────────────────────────────────────────
   EASING CURVES
   Named curves for consistent feel across all animations.
   ───────────────────────────────────────────────────────────── */

export const EASE = {
  /** Default — smooth deceleration for entrances */
  out: "easeOut" as const,
  /** Acceleration for exits */
  in: "easeIn" as const,
  /** Symmetric — for looping/reversible animations */
  inOut: "easeInOut" as const,
  /** Linear — for progress bars, shimmer, continuous motion */
  linear: "linear" as const,
  /** Premium deceleration — Apple-style entrance curve */
  decelerate: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  /** Snappy overshoot — for UI elements that need to feel responsive */
  overshoot: [0.23, 1, 0.32, 1] as [number, number, number, number],
  /** Expo out — dramatic deceleration for page transitions */
  expo: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

/* ─────────────────────────────────────────────────────────────
   SPRING PHYSICS
   Named spring configs for framer-motion's spring type.
   ───────────────────────────────────────────────────────────── */

export const SPRING = {
  /** Default — balanced responsiveness */
  default: { type: "spring" as const, stiffness: 260, damping: 20 },
  /** Gentle — for content reveals, list staggers */
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  /** Snappy — for hover/tap micro-interactions */
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  /** Bouncy — for playful elements (badges, notifications) */
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15 },
} as const;

/* ─────────────────────────────────────────────────────────────
   TRANSITION PRESETS
   Composed Transition objects ready to spread into framer-motion.
   ───────────────────────────────────────────────────────────── */

export const TRANSITION: Record<string, Transition> = {
  /** Page-level route transitions */
  page: { duration: DURATION.moderate, ease: EASE.decelerate },
  /** Route template wrapper (lighter than full page) */
  template: { ease: EASE.out, duration: DURATION.normal },
  /** Fade-in entrance */
  fadeIn: { duration: DURATION.slow, ease: EASE.decelerate },
  /** Quick element appear/disappear */
  quick: { duration: DURATION.fast },
  /** Standard element transition */
  normal: { duration: DURATION.normal },
  /** Overlay backdrop fade */
  overlay: { duration: DURATION.normal },
  /** Sidebar section expand/collapse */
  collapse: { duration: DURATION.normal },
  /** Icon rotation (chevrons, toggles) */
  iconSpin: { duration: DURATION.fast },
  /** Progress bar / width animation */
  progress: { duration: DURATION.slower, ease: EASE.out },
  /** Chart path drawing */
  chartDraw: { duration: DURATION.chart, ease: EASE.inOut },
  /** Chart area fill reveal */
  chartFill: { duration: DURATION.counter, delay: 0.5 },
  /** Shimmer / skeleton pulse */
  shimmer: { duration: DURATION.shimmer, repeat: Infinity, ease: EASE.linear },
  /** Scanner line sweep */
  scanner: { duration: 2, repeat: Infinity, ease: EASE.linear },
  /** Counter number animation */
  counter: { duration: DURATION.counter },
  /** List item exit */
  exit: { duration: DURATION.normal },
} as const;

/* ─────────────────────────────────────────────────────────────
   MOTION PRESETS
   Full initial/animate/exit objects for common patterns.
   ───────────────────────────────────────────────────────────── */

export const MOTION_PRESET = {
  /** Standard fade + slide up entrance */
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  /** Subtle fade + micro-slide (for route templates) */
  fadeUpSubtle: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
  },
  /** Page transition with bidirectional exit */
  page: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
  /** Simple fade */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  /** Scale down on exit (list items) */
  scaleExit: {
    exit: { opacity: 0, scale: 0.96, transition: { duration: DURATION.normal } },
  },
  /** Slide from left (drawers, panels) */
  slideLeft: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  /** Slide from bottom (mobile sheets) */
  slideUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  /** Pop in (notifications, badges) */
  pop: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  /** Checklist item enter/exit */
  listItem: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
  },
} as const;

/* ─────────────────────────────────────────────────────────────
   HOVER / TAP PRESETS
   Consistent micro-interaction values for whileHover/whileTap.
   ───────────────────────────────────────────────────────────── */

export const HOVER = {
  /** Card lift — subtle Y shift + scale */
  lift: { y: -2, scale: 1.005, transition: SPRING.snappy },
  /** Card lift — more pronounced */
  liftStrong: { y: -5, scale: 1.02 },
  /** Stat/KPI card hover */
  stat: { y: -5, scale: 1.02 },
  /** Matrix/grid item hover */
  gridItem: { scale: 1.01, y: -2, rotate: 0.5 },
  /** Bento grid interactive item */
  bento: { y: -3, scale: 1.005 },
  /** Scale only (no lift) */
  scale: { scale: 1.02 },
} as const;

export const TAP = {
  /** Standard press feedback */
  press: { scale: 0.98 },
  /** Subtle press (cards) */
  subtle: { scale: 0.995 },
  /** Strong press (buttons) */
  strong: { scale: 0.95 },
} as const;

/* ─────────────────────────────────────────────────────────────
   STAGGER VARIANTS
   For AnimatePresence list/grid animations.
   ───────────────────────────────────────────────────────────── */

export const STAGGER_DELAY = {
  fast: 0.04,
  normal: 0.06,
  slow: 0.1,
} as const;

export const staggerContainerVariants = (
  staggerDelay: number = STAGGER_DELAY.normal,
  initialDelay: number = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
});

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING.gentle,
  },
};

/* ─────────────────────────────────────────────────────────────
   Z-INDEX SCALE
   Centralized z-index values to prevent stacking conflicts.
   CSS mirrors: --z-* custom properties in globals.css.
   ───────────────────────────────────────────────────────────── */

export const Z_INDEX = {
  /** Below default stacking (backgrounds, decorative) */
  behind: -1,
  /** Default layer */
  base: 0,
  /** Raised content (cards with hover, sticky headers) */
  raised: 10,
  /** Sticky elements (table headers, toolbars) */
  sticky: 20,
  /** Floating elements (dropdowns, popovers, tooltips) */
  dropdown: 30,
  /** Fixed navigation (sidebar, top bar) */
  navigation: 40,
  /** Overlays (modal backdrops, drawer scrims) */
  overlay: 50,
  /** Modal dialogs */
  modal: 60,
  /** Toast notifications */
  toast: 70,
  /** Copilot drawer / AI panel */
  copilot: 90,
  /** Maximum — loading screens, critical alerts */
  max: 100,
} as const;

/* ─────────────────────────────────────────────────────────────
   SHADOW TOKENS
   Named shadow presets. CSS mirrors: --shadow-* in globals.css.
   These are Tailwind class references, not raw values.
   ───────────────────────────────────────────────────────────── */

export const SHADOW = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  spatial: "shadow-spatial",
  spatialHover: "shadow-spatial-hover",
  /** Glow effect using primary color */
  glow: "shadow-glow",
  /** Success trend glow */
  successGlow: "shadow-success-glow",
  /** Destructive trend glow */
  destructiveGlow: "shadow-destructive-glow",
  /** Progress bar glow */
  progressGlow: "shadow-progress-glow",
} as const;

/* ─────────────────────────────────────────────────────────────
   OPACITY SCALE
   Named opacity values for consistent transparency.
   ───────────────────────────────────────────────────────────── */

export const OPACITY = {
  /** Barely visible — decorative noise, watermarks */
  faint: 0.04,
  /** Disabled state, subtle borders */
  muted: 0.1,
  /** Overlay backdrop (light) */
  scrim: 0.2,
  /** Section label text */
  label: 0.4,
  /** Overlay backdrop (standard) */
  overlay: 0.4,
  /** Placeholder text */
  placeholder: 0.5,
  /** Secondary text */
  secondary: 0.6,
  /** Hover reveal */
  hover: 0.8,
  /** Full visibility */
  full: 1,
} as const;
