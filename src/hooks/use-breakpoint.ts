"use client";

import { useMediaQuery } from "./use-media-query";

/**
 * Tailwind-aligned breakpoint constants.
 * Matches the default Tailwind CSS breakpoints.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Returns the current active breakpoint and boolean flags for common device categories.
 * SSR-safe — defaults to desktop during server render to avoid layout shift on the most common viewport.
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS["2xl"]}px)`);

  const isMobile = !isMd;       // < 768px
  const isTablet = isMd && !isLg; // 768px–1023px
  const isDesktop = isLg;        // ≥ 1024px

  const current: BreakpointKey = is2xl
    ? "2xl"
    : isXl
    ? "xl"
    : isLg
    ? "lg"
    : isMd
    ? "md"
    : isSm
    ? "sm"
    : "sm";

  return {
    current,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
  };
}
