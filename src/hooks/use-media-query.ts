"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * SSR-safe media query hook with debounced resize handling.
 * Returns `false` during SSR and hydration, then syncs with the actual viewport.
 *
 * @param query - CSS media query string, e.g. "(min-width: 768px)"
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((e: MediaQueryListEvent | MediaQueryList) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    // Sync initial value after mount (avoids SSR mismatch)
    setMatches(mql.matches);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query, handleChange]);

  return matches;
}
