"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SPRING,
  DURATION,
  EASE,
  TRANSITION,
  MOTION_PRESET,
  STAGGER_DELAY,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/tokens/motion";

/* ─────────────────────────────────────────────────────────────
   MOTION PRIMITIVES
   Reusable animated wrappers that respect prefers-reduced-motion.
   All animations are spring-based for a premium, physical feel.
   Durations, easings, and springs are sourced from @/lib/tokens/motion.
   ───────────────────────────────────────────────────────────── */

const springTransition: Transition = SPRING.default;

const gentleSpring: Transition = SPRING.gentle;

const snappySpring: Transition = SPRING.snappy;

/* ── Fade In ─────────────────────────────────────────────── */

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = DURATION.slow,
  direction = "up",
  distance = 20,
}: FadeInProps) {
  const shouldReduce = useReducedMotion();

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: EASE.decelerate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger Children ────────────────────────────────────── */

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

const staggerContainer: Variants = staggerContainerVariants();

const staggerItem: Variants = staggerItemVariants;

export function StaggerList({
  children,
  className,
  staggerDelay = STAGGER_DELAY.normal,
  initialDelay = 0,
}: StaggerProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants(staggerDelay, initialDelay)}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Animated List (for data rows) ───────────────────────── */

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({
  children,
  className,
  layoutId,
}: {
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      layout={!!layoutId}
      layoutId={layoutId}
      exit={MOTION_PRESET.scaleExit.exit}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Scale on Hover / Tap ────────────────────────────────── */

interface ScaleOnHoverProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  tapScale?: number;
  lift?: number;
}

export function ScaleOnHover({
  children,
  className,
  scale = 1.02,
  tapScale = 0.98,
  lift = 4,
}: ScaleOnHoverProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale, y: -lift }}
      whileTap={{ scale: tapScale }}
      transition={snappySpring}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Page Transition Wrapper ─────────────────────────────── */

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={MOTION_PRESET.page.initial}
      animate={MOTION_PRESET.page.animate}
      exit={MOTION_PRESET.page.exit}
      transition={TRANSITION.page}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated Counter (for KPI numbers) ──────────────────── */

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  formatFn?: (n: number) => string;
}

export function AnimatedCounter({
  value,
  className,
  prefix = "",
  suffix = "",
  duration = DURATION.counter,
  formatFn,
}: AnimatedCounterProps) {
  const shouldReduce = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(shouldReduce ? value : 0);
  const prevValue = React.useRef(value);

  React.useEffect(() => {
    if (shouldReduce) {
      setDisplayValue(value);
      return;
    }

    const startValue = prevValue.current;
    prevValue.current = value;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration, shouldReduce]);

  const formatted = formatFn
    ? formatFn(displayValue)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ── Presence Wrapper (for conditional rendering) ────────── */

interface AnimatePresenceWrapperProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatePresenceWrapper({
  show,
  children,
  className,
}: AnimatePresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={gentleSpring}
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Shimmer / Skeleton Pulse ────────────────────────────── */

export function ShimmerBlock({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        className
      )}
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={TRANSITION.shimmer}
    />
  );
}

/* ── Exports ─────────────────────────────────────────────── */

export { AnimatePresence, motion, springTransition, gentleSpring, snappySpring };
export type { Variants, Transition };
