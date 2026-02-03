'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ColumnPreference {
  id: string;
  visible: boolean;
  order: number;
}

export interface ColumnPreferenceState {
  columns: ColumnPreference[];
  visibleColumnIds: string[];
}

/**
 * Hook for managing column visibility and order preferences.
 * Persists preferences in localStorage per entity.
 */
export function useColumnPreference(
  entitySlug: string,
  defaultColumns: Array<{ id: string; label: string }>
): {
  columns: Array<{ id: string; label: string; visible: boolean; order: number }>;
  visibleColumnIds: string[];
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  setColumnOrder: (columnIds: string[]) => void;
  resetToDefaults: () => void;
} {
  const storageKey = `column-preference-${entitySlug}`;

  const getDefaultState = useCallback((): ColumnPreference[] => {
    return defaultColumns.map((col, index) => ({
      id: col.id,
      visible: true,
      order: index,
    }));
  }, [defaultColumns]);

  const [preferences, setPreferences] = useState<ColumnPreference[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as ColumnPreference[];
          // Merge with defaults to handle new columns added to schema
          const existingIds = new Set(parsed.map(p => p.id));
          const merged = [...parsed];
          
          defaultColumns.forEach((col, index) => {
            if (!existingIds.has(col.id)) {
              merged.push({
                id: col.id,
                visible: true,
                order: merged.length + index,
              });
            }
          });
          
          // Remove columns that no longer exist in schema
          const schemaIds = new Set(defaultColumns.map(c => c.id));
          return merged.filter(p => schemaIds.has(p.id));
        }
      } catch {
        // Invalid stored data, use defaults
      }
    }
    return getDefaultState();
  });

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    }
  }, [preferences, storageKey]);

  // Compute derived values
  const columns = defaultColumns
    .map(col => {
      const pref = preferences.find(p => p.id === col.id);
      return {
        id: col.id,
        label: col.label,
        visible: pref?.visible ?? true,
        order: pref?.order ?? defaultColumns.findIndex(c => c.id === col.id),
      };
    })
    .sort((a, b) => a.order - b.order);

  const visibleColumnIds = columns
    .filter(col => col.visible)
    .map(col => col.id);

  const setColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.id === columnId);
      if (existing) {
        return prev.map(p => p.id === columnId ? { ...p, visible } : p);
      }
      // Column not in preferences yet, add it
      const defaultIndex = defaultColumns.findIndex(c => c.id === columnId);
      return [...prev, { id: columnId, visible, order: defaultIndex }];
    });
  }, [defaultColumns]);

  const setColumnOrder = useCallback((columnIds: string[]) => {
    setPreferences(prev => {
      return columnIds.map((id, index) => {
        const existing = prev.find(p => p.id === id);
        return {
          id,
          visible: existing?.visible ?? true,
          order: index,
        };
      });
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(getDefaultState());
  }, [getDefaultState]);

  return {
    columns,
    visibleColumnIds,
    setColumnVisibility,
    setColumnOrder,
    resetToDefaults,
  };
}
