'use client';

import { useState, useEffect } from 'react';
import type { ViewType } from '@/lib/data-view-engine/hooks/use-data-view';

/**
 * Hook for managing view preferences (table, kanban, etc.)
 * Persists preferences in localStorage
 */
export function useViewPreference(entitySlug: string, defaultView: ViewType): [ViewType, (view: ViewType) => void] {
  const storageKey = `view-preference-${entitySlug}`;

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && isValidViewType(stored)) {
        return stored;
      }
    }
    return defaultView;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, currentView);
    }
  }, [currentView, storageKey]);

  const setView = (view: ViewType) => {
    setCurrentView(view);
  };

  return [currentView, setView];
}

function isValidViewType(value: string): value is ViewType {
  return ['table', 'list', 'grid', 'kanban', 'calendar', 'timeline', 'gantt', 'map', 'workload'].includes(value);
}
