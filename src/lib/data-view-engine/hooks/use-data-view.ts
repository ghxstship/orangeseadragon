"use client";

import * as React from "react";
import type { FilterGroup, SortDefinition } from "../types";

export type ViewType = "table" | "list" | "grid" | "kanban" | "calendar" | "timeline" | "gantt" | "map" | "workload" | "matrix";

export interface DataViewState {
  search: string;
  filters: FilterGroup | null;
  sorts: SortDefinition[];
  visibleColumns: string[];
  viewType: ViewType;
  selectedIds: string[];
  page: number;
  pageSize: number;
  density: "comfortable" | "compact";
  grouping: string[];
}

export interface DataViewActions {
  setSearch: (search: string) => void;
  setFilters: (filters: FilterGroup | null) => void;
  setSorts: (sorts: SortDefinition[]) => void;
  setVisibleColumns: (columns: string[]) => void;
  setViewType: (viewType: ViewType) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setDensity: (density: "comfortable" | "compact") => void;
  setGrouping: (grouping: string[]) => void;
  reset: () => void;
}

export interface UseDataViewOptions {
  initialState?: Partial<DataViewState>;
  defaultViewType?: ViewType;
  defaultPageSize?: number;
  defaultColumns?: string[];
  onStateChange?: (state: DataViewState) => void;
  /** When set, persists viewType, density, pageSize, sorts, visibleColumns, grouping to localStorage */
  persistKey?: string;
}

interface PersistedViewPrefs {
  viewType?: ViewType;
  density?: "comfortable" | "compact";
  pageSize?: number;
  sorts?: SortDefinition[];
  visibleColumns?: string[];
  grouping?: string[];
}

const STORAGE_PREFIX = "atlvs-view-";

function loadPersistedPrefs(key: string): PersistedViewPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as PersistedViewPrefs) : null;
  } catch {
    return null;
  }
}

function savePersistedPrefs(key: string, state: DataViewState): void {
  if (typeof window === "undefined") return;
  try {
    const prefs: PersistedViewPrefs = {
      viewType: state.viewType,
      density: state.density,
      pageSize: state.pageSize,
      sorts: state.sorts,
      visibleColumns: state.visibleColumns,
      grouping: state.grouping,
    };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(prefs));
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

const DEFAULT_STATE: DataViewState = {
  search: "",
  filters: null,
  sorts: [],
  visibleColumns: [],
  viewType: "table",
  selectedIds: [],
  page: 1,
  pageSize: 10,
  density: "comfortable",
  grouping: [],
};

export function useDataView(options: UseDataViewOptions = {}): {
  state: DataViewState;
  actions: DataViewActions;
} {
  const {
    initialState,
    defaultViewType = "table",
    defaultPageSize = 10,
    defaultColumns = [],
    onStateChange,
    persistKey,
  } = options;

  const [state, setState] = React.useState<DataViewState>(() => {
    const persisted = persistKey ? loadPersistedPrefs(persistKey) : null;
    return {
      ...DEFAULT_STATE,
      viewType: defaultViewType,
      pageSize: defaultPageSize,
      visibleColumns: defaultColumns,
      ...initialState,
      ...(persisted ?? {}),
    };
  });

  const updateState = React.useCallback(
    (updates: Partial<DataViewState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        onStateChange?.(newState);
        if (persistKey) savePersistedPrefs(persistKey, newState);
        return newState;
      });
    },
    [onStateChange, persistKey]
  );

  const actions: DataViewActions = React.useMemo(
    () => ({
      setSearch: (search: string) => {
        updateState({ search, page: 1 });
      },
      setFilters: (filters: FilterGroup | null) => {
        updateState({ filters, page: 1 });
      },
      setSorts: (sorts: SortDefinition[]) => {
        updateState({ sorts });
      },
      setVisibleColumns: (visibleColumns: string[]) => {
        updateState({ visibleColumns });
      },
      setViewType: (viewType: ViewType) => {
        updateState({ viewType });
      },
      setSelectedIds: (selectedIds: string[]) => {
        updateState({ selectedIds });
      },
      toggleSelected: (id: string) => {
        setState((prev) => {
          const selectedIds = prev.selectedIds.includes(id)
            ? prev.selectedIds.filter((i) => i !== id)
            : [...prev.selectedIds, id];
          const newState = { ...prev, selectedIds };
          onStateChange?.(newState);
          return newState;
        });
      },
      selectAll: (ids: string[]) => {
        updateState({ selectedIds: ids });
      },
      clearSelection: () => {
        updateState({ selectedIds: [] });
      },
      setPage: (page: number) => {
        updateState({ page });
      },
      setPageSize: (pageSize: number) => {
        updateState({ pageSize, page: 1 });
      },
      setDensity: (density: "comfortable" | "compact") => {
        updateState({ density });
      },
      setGrouping: (grouping: string[]) => {
        updateState({ grouping });
      },
      reset: () => {
        setState({
          ...DEFAULT_STATE,
          viewType: defaultViewType,
          pageSize: defaultPageSize,
          visibleColumns: defaultColumns,
        });
      },
    }),
    [updateState, onStateChange, defaultViewType, defaultPageSize, defaultColumns]
  );

  return { state, actions };
}

export interface UseDataViewFilterOptions<T> {
  data: T[];
  state: DataViewState;
  searchFields?: (keyof T)[];
  getItemId: (item: T) => string;
  skipProcessing?: boolean;
}

export function useFilteredData<T>({
  data,
  state,
  searchFields = [],
  getItemId,
  skipProcessing = false,
}: UseDataViewFilterOptions<T>): {
  filteredData: T[];
  paginatedData: T[];
  totalCount: number;
  totalPages: number;
  selectedItems: T[];
} {
  const filteredData = React.useMemo(() => {
    if (skipProcessing) {
      return data;
    }

    let result = [...data];

    if (state.search && searchFields.length > 0) {
      const searchLower = state.search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    if (state.filters?.filters && state.filters.filters.length > 0) {
      const { logic, filters } = state.filters;
      const rec = result as Record<string, unknown>[];
      result = rec.filter((item) => {
        const results = filters.map((f) => {
          if ("logic" in f) return true; // skip nested groups in client filter
          const value = item[f.field];
          const filterValue = f.value;

          switch (f.operator) {
            case "eq": return String(value) === String(filterValue);
            case "ne": return String(value) !== String(filterValue);
            case "contains": return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            case "startsWith": return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
            case "isNull": return value === null || value === undefined || value === "";
            default: return true;
          }
        });

        return logic === "or" ? results.some(r => r) : results.every(r => r);
      }) as T[];
    }

    return result;
  }, [data, skipProcessing, state.search, state.filters, searchFields]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / Math.max(state.pageSize, 1));

  const paginatedData = React.useMemo(() => {
    if (skipProcessing) {
      return data;
    }

    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;
    return filteredData.slice(start, end);
  }, [data, filteredData, skipProcessing, state.page, state.pageSize]);

  const selectedItems = React.useMemo(() => {
    return data.filter((item) => state.selectedIds.includes(getItemId(item)));
  }, [data, state.selectedIds, getItemId]);

  return {
    filteredData,
    paginatedData,
    totalCount,
    totalPages,
    selectedItems,
  };
}
