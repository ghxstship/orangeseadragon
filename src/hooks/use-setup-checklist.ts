'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'setup-checklist-progress';
const DISMISSED_KEY = 'setup-checklist-dismissed';

export interface SetupChecklistState {
  completedItems: string[];
  isLoaded: boolean;
  isDismissed: boolean;
  markComplete: (itemKey: string) => void;
  markIncomplete: (itemKey: string) => void;
  dismiss: () => void;
  reset: () => void;
}

export function useSetupChecklist(): SetupChecklistState {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const dismissed = localStorage.getItem(DISMISSED_KEY);

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCompletedItems(parsed);
          }
        } catch {
          setCompletedItems([]);
        }
      }

      if (dismissed === 'true') {
        setIsDismissed(true);
      }

      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = useCallback((items: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, []);

  const markComplete = useCallback((itemKey: string) => {
    setCompletedItems((prev) => {
      if (prev.includes(itemKey)) return prev;
      const updated = [...prev, itemKey];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const markIncomplete = useCallback((itemKey: string) => {
    setCompletedItems((prev) => {
      const updated = prev.filter((key) => key !== itemKey);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
  }, []);

  const reset = useCallback(() => {
    setCompletedItems([]);
    setIsDismissed(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DISMISSED_KEY);
    }
  }, []);

  return {
    completedItems,
    isLoaded,
    isDismissed,
    markComplete,
    markIncomplete,
    dismiss,
    reset,
  };
}
