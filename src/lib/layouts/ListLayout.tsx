"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Toolbar } from "@/components/views/toolbar";
import { DataView } from "@/components/views/data-view";
import { PageHeader } from "@/components/common/page-header";
import { StatCard, StatGrid } from "@/components/common/stat-card";
import { ContextualEmptyState } from "@/components/common/contextual-empty-state";
import { useDataView, useFilteredData } from "@/lib/data-view-engine/hooks/use-data-view";
import type { ViewType } from "@/lib/data-view-engine/hooks/use-data-view";
import type { EntitySchema } from "@/lib/schema/types";
import { Plus, RefreshCw } from "lucide-react";

/**
 * LIST LAYOUT
 * 
 * Unified list layout that accepts EntitySchema directly.
 * All configuration comes from the schema - no separate config object.
 */

export interface ListLayoutProps<T extends object> {
  schema: EntitySchema<T>;
  data: T[];
  loading?: boolean;
  error?: Error | null;
  
  currentSubpage?: string;
  onSubpageChange?: (subpage: string) => void;
  
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  
  stats?: Array<{
    id: string;
    label: string;
    value: string | number;
    format?: 'number' | 'currency' | 'percentage';
  }>;
  
  getRowId: (item: T) => string;
  onRowClick?: (item: T) => void;
  onAction?: (actionId: string, payload?: unknown) => void;
  onRefresh?: () => void;
  
  children?: React.ReactNode;
}

export function ListLayout<T extends object>({
  schema,
  data,
  loading = false,
  error,
  currentSubpage,
  onSubpageChange,
  currentView,
  onViewChange,
  stats,
  getRowId,
  onRowClick,
  onAction,
  onRefresh,
  children,
}: ListLayoutProps<T>) {
  const listConfig = schema.layouts.list;
  const tableConfig = schema.views?.table;
  
  const defaultViewType = (currentView || listConfig.defaultView || 'table') as ViewType;
  const defaultColumns = tableConfig?.columns
    ?.filter((c): c is string => typeof c === 'string')
    .slice(0, 6) ?? Object.keys(schema.data.fields).slice(0, 6);

  const { state, actions } = useDataView({
    defaultViewType,
    defaultColumns,
    defaultPageSize: listConfig.pageSize ?? 20,
  });

  const searchFields = (schema.search?.fields ?? []) as (keyof T)[];
  
  const { filteredData, paginatedData, totalCount } = useFilteredData({
    data,
    state,
    searchFields,
    getItemId: getRowId,
  });

  const activeSubpage = currentSubpage || listConfig.subpages[0]?.key;

  const handlePrimaryAction = React.useCallback(() => {
    onAction?.('create');
  }, [onAction]);

  const handleViewChange = React.useCallback((view: ViewType) => {
    actions.setViewType(view);
    onViewChange?.(view);
  }, [actions, onViewChange]);

  if (error) {
    return (
      <div className="flex flex-col h-full bg-background">
        <PageHeader title={schema.identity.namePlural} />
        <div className="flex-1 flex items-center justify-center p-8">
          <ContextualEmptyState
            type="error"
            title="Failed to load data"
            description={error.message}
            actionLabel={onRefresh ? "Try again" : undefined}
            onAction={onRefresh}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{schema.identity.namePlural}</h1>
            {schema.identity.description && (
              <p className="text-muted-foreground">{schema.identity.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            )}
            {schema.permissions?.create !== false && (
              <Button onClick={handlePrimaryAction}>
                <Plus className="h-4 w-4 mr-2" />
                New {schema.identity.name}
              </Button>
            )}
          </div>
        </div>

        {/* Subpage Navigation */}
        {listConfig.subpages.length > 1 && (
          <div className="px-6 pb-0 border-t bg-muted/30">
            <Tabs value={activeSubpage} onValueChange={onSubpageChange}>
              <TabsList variant="underline">
                {listConfig.subpages.map((subpage) => (
                  <TabsTrigger key={subpage.key} value={subpage.key}>
                    <div className="flex items-center gap-2">
                      {subpage.icon && <span className="text-sm">{subpage.icon}</span>}
                      <span>{subpage.label}</span>
                      {subpage.count && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {data.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        {stats && stats.length > 0 && (
          <StatGrid columns={Math.min(stats.length, 4) as 2 | 3 | 4}>
            {stats.map((stat) => (
              <StatCard
                key={stat.id}
                title={stat.label}
                value={
                  stat.format === "currency"
                    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(stat.value))
                    : stat.format === "percentage"
                    ? `${stat.value}%`
                    : String(stat.value)
                }
              />
            ))}
          </StatGrid>
        )}

        {/* Toolbar */}
        <Toolbar
          search={schema.search?.enabled ? {
            value: state.search,
            onChange: actions.setSearch,
            placeholder: schema.search.placeholder,
          } : undefined}
          view={listConfig.availableViews.length > 1 ? {
            current: state.viewType,
            available: listConfig.availableViews as ViewType[],
            onChange: handleViewChange,
          } : undefined}
          refresh={onRefresh ? { onRefresh, loading } : undefined}
          selectedCount={state.selectedIds.length}
        />

        {/* Data View or Children */}
        {children ? (
          children
        ) : loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <ContextualEmptyState
            type={state.search ? "no-results" : "no-data"}
            title={state.search ? "No results found" : `No ${schema.identity.namePlural.toLowerCase()} yet`}
            description={state.search ? "Try adjusting your search" : `Get started by creating your first ${schema.identity.name.toLowerCase()}.`}
            actionLabel={!state.search ? `Create ${schema.identity.name}` : undefined}
            onAction={!state.search ? handlePrimaryAction : undefined}
          />
        ) : (
          <DataView
            data={(state.viewType === "table" ? paginatedData : filteredData) as T[]}
            viewType={state.viewType}
            config={{
              table: tableConfig ? {
                columns: (tableConfig.columns || []).map((col) => {
                  const fieldKey = typeof col === 'string' ? col : col.field;
                  const fieldDef = schema.data.fields[fieldKey];
                  return {
                    field: fieldKey,
                    label: fieldDef?.label || fieldKey,
                    sortable: fieldDef?.sortable ?? true,
                    visible: true,
                  };
                }),
                features: {
                  selection: tableConfig.features?.selection,
                },
              } : undefined,
            }}
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
            rowActions={schema.actions?.row}
            getRowId={getRowId}
            loading={loading}
            emptyMessage={`No ${schema.identity.namePlural.toLowerCase()} found.`}
          />
        )}

        {/* Pagination Info */}
        {!children && state.viewType === "table" && totalCount > state.pageSize && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(state.page - 1) * state.pageSize + 1} to{" "}
              {Math.min(state.page * state.pageSize, totalCount)} of {totalCount}
            </span>
          </div>
        )}
      </div>

      {/* Footer with Bulk Actions */}
      {state.selectedIds.length > 0 && schema.actions?.bulk && (
        <footer className="border-t bg-muted/50 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {state.selectedIds.length} item{state.selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => actions.setSelectedIds([])}>
                Clear selection
              </Button>
              {schema.actions.bulk.map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => onAction?.(action.key, { selectedIds: state.selectedIds })}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default ListLayout;
