"use client";

import { useState, useEffect } from "react";

/**
 * Detects the user's `prefers-reduced-motion` OS setting.
 *
 * Returns `true` when the user prefers reduced motion.
 * Listens for changes so the value updates live if the user toggles the setting.
 *
 * Usage with Framer Motion:
 *   const prefersReduced = useReducedMotion();
 *   <motion.div animate={prefersReduced ? {} : { opacity: 1, y: 0 }} />
 *
 * Or wrap in <MotionSafe>:
 *   <MotionSafe fallback={<div>{children}</div>}>
 *     <motion.div animate={...}>{children}</motion.div>
 *   </MotionSafe>
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

/**
 * Static motion variants that respect reduced motion.
 * Pass these to Framer Motion's `variants` prop.
 */
export const safeMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Returns empty animation props when reduced motion is preferred.
 * Use as a spread: <motion.div {...safeAnimate(prefersReduced, { opacity: 1, y: 0 })} />
 */
export function safeAnimate(
  prefersReduced: boolean,
  animate: Record<string, unknown>,
  initial?: Record<string, unknown>
) {
  if (prefersReduced) {
    return { initial: animate, animate };
  }
  return { initial: initial ?? { opacity: 0 }, animate };
}
