"use client";

import * as React from "react";
import type { FilterGroup, SortDefinition } from "../types";

export type ViewType = "table" | "list" | "grid" | "kanban" | "calendar" | "timeline" | "gantt" | "map" | "workload";

export interface DataViewState {
  search: string;
  filters: FilterGroup | null;
  sorts: SortDefinition[];
  visibleColumns: string[];
  viewType: ViewType;
  selectedIds: string[];
  page: number;
  pageSize: number;
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
  reset: () => void;
}

export interface UseDataViewOptions {
  initialState?: Partial<DataViewState>;
  defaultViewType?: ViewType;
  defaultPageSize?: number;
  defaultColumns?: string[];
  onStateChange?: (state: DataViewState) => void;
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
  } = options;

  const [state, setState] = React.useState<DataViewState>(() => ({
    ...DEFAULT_STATE,
    viewType: defaultViewType,
    pageSize: defaultPageSize,
    visibleColumns: defaultColumns,
    ...initialState,
  }));

  const updateState = React.useCallback(
    (updates: Partial<DataViewState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        onStateChange?.(newState);
        return newState;
      });
    },
    [onStateChange]
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
}

export function useFilteredData<T>({
  data,
  state,
  searchFields = [],
  getItemId,
}: UseDataViewFilterOptions<T>): {
  filteredData: T[];
  paginatedData: T[];
  totalCount: number;
  totalPages: number;
  selectedItems: T[];
} {
  const filteredData = React.useMemo(() => {
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

    return result;
  }, [data, state.search, searchFields]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / state.pageSize);

  const paginatedData = React.useMemo(() => {
    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, state.page, state.pageSize]);

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
