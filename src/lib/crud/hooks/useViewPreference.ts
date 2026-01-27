'use client';

import { useState, useEffect } from 'react';

/**
 * Hook for managing view preferences (table, kanban, etc.)
 * Persists preferences in localStorage
 */
export function useViewPreference(entitySlug: string, defaultView: string) {
  const storageKey = `view-preference-${entitySlug}`;

  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored || defaultView;
    }
    return defaultView;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, currentView);
    }
  }, [currentView, storageKey]);

  const setView = (view: string) => {
    setCurrentView(view);
  };

  return [currentView, setView] as const;
}
