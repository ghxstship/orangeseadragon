'use client';

import React from 'react';
import { DataTable } from '@/components/views/data-table';
import { EntitySchema, EntityRecord } from '@/lib/schema/types';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ViewRendererProps<T extends EntityRecord = EntityRecord> {
  schema: EntitySchema<T>;
  viewType: string;
  viewConfig?: Record<string, unknown>;
  data: T[];
  loading?: boolean;
  error?: Error | { message: string };
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pagination?: {
    page: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { page: number; pageSize: number }) => void;
  sort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' }) => void;
  onRowClick?: (record: T) => void;
  visibleColumns?: string[];
}

/**
 * View Renderer Component
 *
 * Dynamically renders the appropriate view component based on viewType.
 * Supports table, kanban, calendar, and other view types.
 */
export function ViewRenderer<T extends EntityRecord = EntityRecord>({
  schema,
  viewType,
  viewConfig,
  data,
  loading = false,
  error,
  onRowClick,
  visibleColumns,
  // selection, onSelectionChange, pagination, onPaginationChange, sort, onSortChange
  // are accepted via props interface but not yet consumed — reserved for future use
  ...rest
}: ViewRendererProps<T>) {
  void rest; // Suppress unused variable warning for reserved props
  // Map schema to columns for DataTable, filtering by visibleColumns if provided
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const tableConfig = schema.views.table;
    if (!tableConfig) return [];

    return tableConfig.columns
      .map((col: string | { field: string }) => {
        const fieldKey = typeof col === 'string' ? col : col.field;
        return fieldKey;
      })
      .filter((fieldKey: string) => {
        // If visibleColumns is provided, only include visible columns
        if (visibleColumns && visibleColumns.length > 0) {
          return visibleColumns.includes(fieldKey);
        }
        return true;
      })
      .map((fieldKey: string) => {
        const field = schema.data.fields[fieldKey] || schema.data.computed?.[fieldKey];

        return {
          id: fieldKey,
          accessorKey: fieldKey,
          header: field?.label || fieldKey,
          cell: ({ getValue }: { getValue: () => unknown }) => {
            const value = getValue();
            if (value === null || value === undefined) return '-';
            return String(value);
          }
        };
      });
  }, [schema, visibleColumns]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex bg-destructive/10 items-center justify-center h-64 rounded-lg border border-destructive/20 p-6 text-center">
        <div>
          <h3 className="text-destructive font-semibold">Error loading data</h3>
          <p className="text-destructive/80 text-sm mt-1">{error.message || 'There was a problem fetching the data.'}</p>
        </div>
      </div>
    );
  }

  // Get display functions from schema
  const getTitle = (record: T) => {
    if (typeof schema.display.title === 'function') {
      return schema.display.title(record);
    }
    return record.name || record.title || 'Untitled';
  };

  const getSubtitle = (record: T) => {
    if (typeof schema.display.subtitle === 'function') {
      return schema.display.subtitle(record);
    }
    return '';
  };

  const getBadge = (record: T) => {
    if (typeof schema.display.badge === 'function') {
      return schema.display.badge(record);
    }
    return null;
  };

  // Grid View Component
  const renderGridView = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground">No items found</div>
        </div>
      );
    }

    const imageField = (viewConfig as Record<string, unknown> | undefined)?.imageField as string | undefined;
    const cardFields = ((viewConfig as Record<string, unknown> | undefined)?.cardFields as string[]) || [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((record, index) => {
          const badge = getBadge(record);
          const imageUrl = imageField ? (record[imageField] as string) : null;

          return (
            <Card
              key={record.id || index}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group"
              onClick={() => onRowClick?.(record)}
            >
              {imageUrl ? (
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  <Image
                    src={imageUrl}
                    alt={String(getTitle(record))}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ) : (
                // Fallback placeholder if image field exists but no value
                imageField && (
                  <div className="aspect-video w-full bg-muted/50 flex items-center justify-center text-muted-foreground/30">
                    <span className="text-4xl">📷</span>
                  </div>
                )
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {String(getTitle(record))}
                  </CardTitle>
                  {badge && (
                    <Badge variant={badge.variant === 'success' ? 'default' : badge.variant === 'destructive' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                      {badge.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {String(getSubtitle(record))}
                </p>
                {cardFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                    {cardFields.map(fieldKey => {
                      const fieldDef = schema.data.fields[fieldKey];
                      const value = record[fieldKey];
                      if (!value) return null;
                      return (
                        <div key={fieldKey}>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                            {fieldDef?.label || fieldKey}
                          </span>
                          <span className="text-xs font-medium truncate block">
                            {String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // List View Component
  const renderListView = () => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground">No items found</div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((record, index) => {
          const badge = getBadge(record);
          return (
            <div
              key={record.id || index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(record)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{String(getTitle(record))}</p>
                <p className="text-sm text-muted-foreground truncate">{String(getSubtitle(record))}</p>
              </div>
              {badge && (
                <Badge variant={badge.variant === 'success' ? 'default' : badge.variant === 'destructive' ? 'destructive' : 'secondary'} className="ml-4 shrink-0">
                  {badge.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Kanban View Component
  const renderKanbanView = () => {
    // Get status field and its options from schema
    const statusField = schema.data.fields.status;
    const defaultOptions = [
      { label: 'To Do', value: 'todo' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Done', value: 'done' },
    ];
    const statusOptions = Array.isArray(statusField?.options) ? statusField.options as { label: string; value: string }[] : defaultOptions;

    // Group data by status
    const groupedData: Record<string, typeof data> = {};
    statusOptions.forEach((opt) => {
      groupedData[opt.value] = [];
    });
    data.forEach((record) => {
      const status = record.status || 'todo';
      if (!groupedData[status]) {
        groupedData[status] = [];
      }
      groupedData[status].push(record);
    });

    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusOptions.map((column) => (
          <div key={column.value} className="flex-shrink-0 w-72">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">{column.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {groupedData[column.value]?.length || 0}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {(groupedData[column.value] || []).map((record, index) => {
                  const badge = getBadge(record);
                  return (
                    <Card
                      key={record.id || index}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onRowClick?.(record)}
                    >
                      <CardContent className="p-3">
                        <p className="font-medium text-sm line-clamp-2">{String(getTitle(record))}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{String(getSubtitle(record))}</p>
                        {badge && badge.label !== column.label && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {badge.label}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Calendar View Component (simplified month view)
  const renderCalendarView = () => {
    // For now, render as a list grouped by date
    const dateField = Object.keys(schema.data.fields).find(
      (key) => schema.data.fields[key].type === 'date' || schema.data.fields[key].type === 'datetime'
    ) || 'created_at';

    // Group by date
    const groupedByDate: Record<string, typeof data> = {};
    data.forEach((record) => {
      const dateValue = record[dateField];
      const dateKey = dateValue ? new Date(dateValue as string).toLocaleDateString() : 'No Date';
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(record);
    });

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
      if (a === 'No Date') return 1;
      if (b === 'No Date') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground">No events found</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">{dateKey}</h3>
            <div className="space-y-2">
              {groupedByDate[dateKey].map((record, index) => {
                const badge = getBadge(record);
                return (
                  <div
                    key={record.id || index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(record)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{String(getTitle(record))}</p>
                      <p className="text-sm text-muted-foreground truncate">{String(getSubtitle(record))}</p>
                    </div>
                    {badge && (
                      <Badge variant={badge.variant === 'success' ? 'default' : badge.variant === 'destructive' ? 'destructive' : 'secondary'} className="ml-4 shrink-0">
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render based on view type
  switch (viewType) {
    case 'table':
      return (
        <DataTable
          columns={columns}
          data={data}
          showSearch={false}
        />
      );

    case 'grid':
      return renderGridView();

    case 'list':
      return renderListView();

    case 'kanban':
      return renderKanbanView();

    case 'calendar':
    case 'timeline':
      return renderCalendarView();

    case 'map':
      return (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground">Map view requires location data</div>
        </div>
      );

    default:
      // Fallback to table view for any unknown view type
      return (
        <DataTable
          columns={columns}
          data={data}
          showSearch={false}
        />
      );
  }
}
