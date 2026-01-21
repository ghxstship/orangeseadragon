"use client";

import * as React from "react";
import { PageHeader } from "./page-header";
import { StatCard, StatGrid } from "./stat-card";
import { Toolbar } from "@/components/views/toolbar";
import { DataView } from "@/components/views/data-view";
import { useDataView, useFilteredData } from "@/lib/data-view-engine/hooks";
import type { ViewType } from "@/lib/data-view-engine/hooks";
import type { PageConfig, StatItemConfig } from "@/config/pages/types";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, RefreshCw } from "lucide-react";
import type { ToolbarColumn } from "@/components/views/toolbar";

export interface DataViewPageProps<T extends object> {
  config: PageConfig;
  data: T[];
  loading?: boolean;
  stats?: Array<StatItemConfig & { value: string | number }>;
  getRowId: (item: T) => string;
  searchFields?: (keyof T)[];
  onAction?: (actionId: string, payload?: unknown) => void;
  onRowClick?: (item: T) => void;
  onRefresh?: () => void;
}

export function DataViewPage<T extends object>({
  config,
  data,
  loading = false,
  stats,
  getRowId,
  searchFields = [],
  onAction,
  onRowClick,
  onRefresh,
}: DataViewPageProps<T>) {
  const defaultViewType = config.toolbar.viewTypes?.[0] ?? "table";
  const defaultColumns = config.views.table?.columns
    .filter((c) => c.visible !== false)
    .map((c) => c.field) ?? [];

  const { state, actions } = useDataView({
    defaultViewType,
    defaultColumns,
    defaultPageSize: config.views.table?.defaultPageSize ?? 10,
  });

  const { filteredData, paginatedData, totalCount, selectedItems } = useFilteredData({
    data,
    state,
    searchFields,
    getItemId: getRowId,
  });

  const handlePrimaryAction = React.useCallback(() => {
    if (config.primaryAction) {
      onAction?.(config.primaryAction.id);
    }
  }, [config.primaryAction, onAction]);

  const handleBulkAction = React.useCallback(
    (actionId: string) => {
      onAction?.(actionId, { selectedIds: state.selectedIds, selectedItems });
    },
    [onAction, state.selectedIds, selectedItems]
  );

  const primaryActionButton = config.primaryAction ? (
    <Button onClick={handlePrimaryAction}>
      {config.primaryAction.icon === "plus" && <Plus className="mr-2 h-4 w-4" />}
      {config.primaryAction.label}
    </Button>
  ) : undefined;

  const toolbarSearch = config.toolbar.search?.enabled
    ? {
        value: state.search,
        onChange: actions.setSearch,
        placeholder: config.toolbar.search.placeholder ?? "Search...",
      }
    : undefined;

  const toolbarView = config.toolbar.viewTypes && config.toolbar.viewTypes.length > 1
    ? {
        current: state.viewType,
        available: config.toolbar.viewTypes,
        onChange: (view: ViewType) => actions.setViewType(view),
      }
    : undefined;

  const visibleColumnIds = state.visibleColumns.length > 0
    ? state.visibleColumns
    : config.views.table?.columns.filter((c) => c.visible !== false).map((c) => c.field) ?? [];

  const toolbarColumns = config.toolbar.columns?.enabled && config.views.table?.columns
    ? {
        items: config.views.table.columns.map((c) => ({
          id: c.field,
          label: c.label,
          visible: visibleColumnIds.includes(c.field),
        })),
        onChange: (columns: ToolbarColumn[]) => {
          actions.setVisibleColumns(columns.filter((c) => c.visible).map((c) => c.id));
        },
      }
    : undefined;

  const toolbarRefresh = config.toolbar.refresh?.enabled
    ? { onRefresh: onRefresh ?? (() => {}), loading }
    : undefined;

  const toolbarActions = config.toolbar.bulkActions && state.selectedIds.length > 0
    ? {
        bulk: config.toolbar.bulkActions.map((action) => ({
          id: action.id,
          label: action.label,
          variant: action.variant as "default" | "destructive" | undefined,
          onClick: () => handleBulkAction(action.id),
        })),
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={primaryActionButton}
      />

      {stats && stats.length > 0 && (
        <StatGrid columns={Math.min(stats.length, 4) as 2 | 3 | 4 | undefined}>
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.label}
              value={
                stat.format === "currency"
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Number(stat.value))
                  : stat.format === "percentage"
                  ? `${stat.value}%`
                  : String(stat.value)
              }
            />
          ))}
        </StatGrid>
      )}

      <Toolbar
        search={toolbarSearch}
        view={toolbarView}
        columns={toolbarColumns}
        refresh={toolbarRefresh}
        actions={toolbarActions}
        selectedCount={state.selectedIds.length}
      />

      <DataView<T>
        data={(state.viewType === "table" ? paginatedData : filteredData) as T[]}
        viewType={state.viewType}
        config={config.views}
        state={state}
        onStateChange={(updates) => {
          if (updates.search !== undefined) actions.setSearch(updates.search);
          if (updates.viewType !== undefined) actions.setViewType(updates.viewType);
          if (updates.selectedIds !== undefined) actions.setSelectedIds(updates.selectedIds);
          if (updates.page !== undefined) actions.setPage(updates.page);
          if (updates.pageSize !== undefined) actions.setPageSize(updates.pageSize);
          if (updates.visibleColumns !== undefined) actions.setVisibleColumns(updates.visibleColumns);
        }}
        onRowClick={onRowClick}
        rowActions={config.rowActions}
        getRowId={getRowId}
        loading={loading}
        emptyMessage={`No ${config.title.toLowerCase()} found.`}
      />

      {state.viewType === "table" && totalCount > state.pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(state.page - 1) * state.pageSize + 1} to{" "}
            {Math.min(state.page * state.pageSize, totalCount)} of {totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
