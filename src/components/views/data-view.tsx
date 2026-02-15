"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, RowAction } from "./data-table";
import { ListView, ListItem } from "./list-view";
import { KanbanBoard, KanbanColumn } from "./kanban-board";
import { CalendarView, CalendarEvent } from "./calendar-view";
import { TimelineView, TimelineItem, TimelineGroup } from "./timeline-view";
import { GanttView, GanttTask } from "./gantt-view";
import { MapView, MapMarker } from "./map-view";
import { MatrixView } from "./matrix-view";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecordHoverPreview } from "@/components/common/record-hover-preview";
import { InlineEditCell } from "@/components/views/inline-edit-cell";
/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE } from "@/lib/config";
import type { ViewType, DataViewState } from "@/lib/data-view-engine/hooks";
import type {
  TableViewConfig,
  TableColumnDefinition,
  KanbanViewConfig,
  CalendarViewConfig,
  TimelineViewConfig,
  MapViewConfig,
  MatrixViewConfig,
  ActionDefinition,
  ListViewConfig,
  GridViewConfig,
  GanttViewConfig,
  ColumnFormat,
} from "@/lib/schema/types";

type ActionConfig = ActionDefinition;

const getPercentageWidthStyle = (pct: number): React.CSSProperties => ({
  width: `${pct}%`,
});

const getStatusDotStyle = (badgeColor?: string): React.CSSProperties => ({
  backgroundColor: badgeColor || 'currentColor',
});

// Helper to normalize column definitions
function normalizeColumn(col: string | TableColumnDefinition): TableColumnDefinition & { label: string; sortable: boolean; visible: boolean; format?: ColumnFormat } {
  if (typeof col === 'string') {
    return { field: col, label: col, sortable: true, visible: true };
  }
  return {
    ...col,
    label: col.field,
    sortable: true,
    visible: true
  };
}

export interface DataViewProps<T extends object> {
  data: T[];
  viewType: ViewType;
  config: {
    table?: TableViewConfig;
    list?: ListViewConfig;
    grid?: GridViewConfig;
    kanban?: KanbanViewConfig;
    calendar?: CalendarViewConfig;
    timeline?: TimelineViewConfig;
    gantt?: GanttViewConfig;
    map?: MapViewConfig;
    matrix?: MatrixViewConfig;
  };
  state: DataViewState;
  onStateChange: (updates: Partial<DataViewState>) => void;
  onRowClick?: (item: T) => void;
  rowActions?: ActionConfig[];
  getRowId: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  renderRowWrapper?: (row: T, children: React.ReactNode) => React.ReactNode;
  onCellEdit?: (rowId: string, fieldKey: string, value: unknown) => Promise<void> | void;
  editableFields?: string[];
}

function haveSameIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const comparison = new Set(b);
  return a.every((id) => comparison.has(id));
}

export function DataView<T extends object>({
  data,
  viewType,
  config,
  state,
  onStateChange,
  onRowClick,
  rowActions,
  getRowId,
  loading = false,
  emptyMessage = "No data found.",
  renderRowWrapper,
  onCellEdit,
  editableFields,
}: DataViewProps<T>) {
  // Cast to internal type for renderer compatibility
  type R = Record<string, unknown>;
  const typedData = data as unknown as R[];
  const typedGetRowId = getRowId as (item: R) => string;
  const typedOnRowClick = onRowClick as ((item: R) => void) | undefined;

  const handleSelectionChange = React.useCallback(
    (selectedRows: R[]) => {
      const nextSelectedIds = selectedRows.map(typedGetRowId);

      if (haveSameIds(state.selectedIds, nextSelectedIds)) {
        return;
      }

      onStateChange({ selectedIds: nextSelectedIds });
    },
    [onStateChange, typedGetRowId, state.selectedIds]
  );

  switch (viewType) {
    case "table":
      return (
        <TableRenderer
          data={typedData}
          config={config.table}
          state={state}
          onSelectionChange={handleSelectionChange}
          onRowClick={typedOnRowClick}
          rowActions={rowActions}
          getRowId={typedGetRowId}
          loading={loading}
          emptyMessage={emptyMessage}
          renderRowWrapper={renderRowWrapper as ((row: Record<string, unknown>, children: React.ReactNode) => React.ReactNode) | undefined}
          onCellEdit={onCellEdit as ((rowId: string, fieldKey: string, value: unknown) => Promise<void> | void) | undefined}
          editableFields={editableFields}
        />
      );

    case "list":
      return (
        <ListRenderer
          data={typedData}
          config={config.list}
          state={state}
          onSelectionChange={handleSelectionChange}
          onRowClick={typedOnRowClick}
          rowActions={rowActions}
          getRowId={typedGetRowId}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      );

    case "grid":
      return (
        <GridRenderer
          data={typedData}
          config={config.grid}
          onRowClick={typedOnRowClick}
          rowActions={rowActions}
          getRowId={typedGetRowId}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      );

    case "kanban":
      return (
        <KanbanRenderer
          data={typedData}
          config={config.kanban}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );

    case "calendar":
      return (
        <CalendarRenderer
          data={typedData}
          config={config.calendar}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );

    case "timeline":
      return (
        <TimelineRenderer
          data={typedData}
          config={config.timeline}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );

    case "gantt":
      return (
        <GanttRenderer
          data={typedData}
          config={config.gantt}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );

    case "map":
      return (
        <MapRenderer
          data={typedData}
          config={config.map}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );
    case "matrix":
      return (
        <MatrixRenderer
          data={typedData}
          config={config.matrix}
          onRowClick={typedOnRowClick}
          getRowId={typedGetRowId}
        />
      );

    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          View type &quot;{viewType}&quot; is not supported.
        </div>
      );
  }
}

function formatValue(value: unknown, format?: ColumnFormat, fieldName?: string): React.ReactNode {
  if (value === null || value === undefined) return <span className="opacity-20">-</span>;

  if (!format) {
    if (typeof value === 'boolean') {
      return value ? <Badge className="bg-semantic-success/10 text-semantic-success border-semantic-success/20 hover:bg-semantic-success/20">TRUE</Badge> : <Badge variant="outline" className="opacity-50">FALSE</Badge>;
    }
    return <span className="text-sm font-medium">{String(value)}</span>;
  }

  switch (format.type) {
    case "number":
      return (
        <span className="font-mono text-xs font-bold tracking-tight">
          {new Intl.NumberFormat(DEFAULT_LOCALE, {
            minimumFractionDigits: format.decimals ?? 0,
            maximumFractionDigits: format.decimals ?? 0,
          }).format(value as number)}
        </span>
      );

    case "currency":
      return (
        <span className="font-mono text-xs font-black text-semantic-success">
          {new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: "currency",
            currency: format.currency ?? "USD",
          }).format(value as number)}
        </span>
      );

    case "percentage":
      const pct = (value as number);
      return (
        <div className="flex items-center gap-2 w-full min-w-[100px]">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                pct > 80 ? "bg-semantic-success shadow-[0_0_8px_hsl(var(--semantic-success)/0.4)]" :
                  pct > 40 ? "bg-semantic-warning" : "bg-destructive"
              )}
              style={getPercentageWidthStyle(pct)}
            />
          </div>
          <span className="text-[10px] font-black w-8 text-right">{pct}%</span>
        </div>
      );

    case "date":
    case "datetime":
      const date = new Date(value as string);
      const isToday = new Date().toDateString() === date.toDateString();
      return (
        <span className={cn("text-xs font-medium", isToday && "text-primary font-bold")}>
          {isToday ? "Today" : format.type === "date" ? date.toLocaleDateString() : date.toLocaleString()}
        </span>
      );

    case "boolean":
      return (value as boolean)
        ? <Badge className="bg-semantic-success/10 text-semantic-success border-semantic-success/20">{format.trueLabel ?? "Yes"}</Badge>
        : <Badge variant="outline" className="opacity-40">{format.falseLabel ?? "No"}</Badge>;

    case "badge":
      const badgeColor = format.colorMap?.[String(value)];
      const isStatus = ["status", "state", "stage"].includes(fieldName?.toLowerCase() || "");

      return (
        <Badge
          variant="secondary"
          className="relative pl-5 py-0.5 border-none font-bold uppercase text-[9px] tracking-wider bg-muted/50 hover:bg-muted"
        >
          {isStatus && (
            <div
              className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full animate-pulse"
              style={getStatusDotStyle(badgeColor)}
            />
          )}
          {String(value)}
        </Badge>
      );

    case "link": {
      const href = String(value);
      if (!href || href === 'null' || href === 'undefined') {
        return <span className="opacity-20">-</span>;
      }
      const display = href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      return (
        <a
          href={href.startsWith('http') ? href : `https://${href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary underline-offset-2 hover:underline truncate max-w-[200px] inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          {display}
        </a>
      );
    }

    case "avatar": {
      const name = String(value);
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium">{name}</span>
        </div>
      );
    }

    case "relation": {
      const displayText = String(value);
      if (!displayText || displayText === 'null' || displayText === 'undefined') {
        return <span className="opacity-20">-</span>;
      }
      return (
        <RecordHoverPreview entityType={format.entityType}>
          <span className="text-sm font-medium text-primary">{displayText}</span>
        </RecordHoverPreview>
      );
    }

    default:
      return <span className="text-sm font-medium">{String(value)}</span>;
  }
}

interface TableRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: TableViewConfig;
  state: DataViewState;
  onSelectionChange: (rows: T[]) => void;
  onRowClick?: (item: T) => void;
  rowActions?: ActionConfig[];
  getRowId: (item: T) => string;
  loading: boolean;
  emptyMessage: string;
  renderRowWrapper?: (row: T, children: React.ReactNode) => React.ReactNode;
  onCellEdit?: (rowId: string, fieldKey: string, value: unknown) => Promise<void> | void;
  editableFields?: string[];
}

function TableRenderer<T extends Record<string, unknown>>({
  data,
  config,
  state,
  onSelectionChange,
  onRowClick,
  rowActions,
  getRowId,
  loading,
  emptyMessage,
  renderRowWrapper,
  onCellEdit,
  editableFields,
}: TableRendererProps<T>) {
  const columns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!config?.columns) return [];

    // Get all normalized columns
    const allColumns = config.columns.map((col) => normalizeColumn(col));

    // Filter by visibility
    const visibleCols = allColumns
      .filter((col) => col.visible !== false)
      .filter((col) =>
        state.visibleColumns.length === 0 ||
        state.visibleColumns.includes(col.field)
      );

    // Sort by order in visibleColumns if provided
    const orderedCols = state.visibleColumns.length > 0
      ? visibleCols.sort((a, b) => {
        const aIndex = state.visibleColumns.indexOf(a.field);
        const bIndex = state.visibleColumns.indexOf(b.field);
        return aIndex - bIndex;
      })
      : visibleCols;

    return orderedCols.map((col) => ({
      accessorKey: col.field,
      header: col.label,
      cell: ({ row }) => {
        const value = row.getValue(col.field);
        const formatted = formatValue(value, col.format, col.field);
        const isEditable = onCellEdit && editableFields?.includes(col.field);

        if (isEditable) {
          const rowId = getRowId(row.original);
          return (
            <InlineEditCell
              value={value}
              fieldKey={col.field}
              rowId={rowId}
              onSave={onCellEdit}
              displayNode={formatted}
              cellType={col.format?.type === "number" || col.format?.type === "currency" || col.format?.type === "percentage" ? "number" : "text"}
            />
          );
        }

        return formatted;
      },
      enableSorting: col.sortable !== false,
    }));
  }, [config?.columns, state.visibleColumns, onCellEdit, editableFields, getRowId]);

  const tableRowActions = React.useMemo<RowAction<T>[] | undefined>(() => {
    if (!rowActions) return undefined;

    return rowActions.map((action) => ({
      id: action.key,
      label: action.label,
      onClick: (row: T) => {
        console.log(`Action ${action.key} on row`, row);
      },
      variant: action.variant === "destructive" ? "destructive" : "default",
    }));
  }, [rowActions]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={state.pageSize}
      pageSizeOptions={[10, 20, 50, 100]}
      selectable={config?.features?.selection ?? false}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      rowActions={tableRowActions}
      getRowId={getRowId}
      loading={loading}
      emptyMessage={emptyMessage}
      showSearch={false}
      showColumnToggle={false}
      density={state.density}
      grouping={state.grouping}
      renderRowWrapper={renderRowWrapper}
    />
  );
}

interface ListRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: ListViewConfig;
  state: DataViewState;
  onSelectionChange: (rows: T[]) => void;
  onRowClick?: (item: T) => void;
  rowActions?: ActionConfig[];
  getRowId: (item: T) => string;
  loading: boolean;
  emptyMessage: string;
}

function ListRenderer<T extends Record<string, unknown>>({
  data,
  config,
  state,
  onSelectionChange,
  onRowClick,
  rowActions,
  getRowId,
  loading,
  emptyMessage,
}: ListRendererProps<T>) {
  const items = React.useMemo<ListItem[]>(() => {
    if (!config) return [];

    return data.map((item) => ({
      id: getRowId(item),
      title: String(item[config.titleField] ?? ""),
      subtitle: config.subtitleField
        ? String(item[config.subtitleField] ?? "")
        : undefined,
      description: config.descriptionField
        ? String(item[config.descriptionField] ?? "")
        : undefined,
      avatar: config.avatarField
        ? String(item[config.avatarField] ?? "")
        : undefined,
      badge: config.badgeField
        ? { label: String(item[config.badgeField] ?? "") }
        : undefined,
      meta: config.metaFields?.map((field) => ({
        label: field,
        value: String(item[field] ?? ""),
      })),
      actions: rowActions?.map((action) => ({
        label: action.label,
        onClick: () => console.log(`Action ${action.key} on item`, item),
        destructive: action.variant === "destructive",
      })),
      data: item,
    }));
  }, [data, config, getRowId, rowActions]);

  const handleSelectionChange = React.useCallback(
    (ids: string[]) => {
      const selectedItems = data.filter((item) => ids.includes(getRowId(item)));
      onSelectionChange(selectedItems);
    },
    [data, getRowId, onSelectionChange]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ListView
      items={items}
      emptyMessage={emptyMessage}
      selectable={state.selectedIds.length > 0 || false}
      selectedIds={state.selectedIds}
      onSelectionChange={handleSelectionChange}
      onItemClick={(item) => {
        const original = data.find((d) => getRowId(d) === item.id);
        if (original && onRowClick) onRowClick(original);
      }}
      showChevron={config?.showChevron}
    />
  );
}

interface GridRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: GridViewConfig;
  onRowClick?: (item: T) => void;
  rowActions?: ActionConfig[];
  getRowId: (item: T) => string;
  loading: boolean;
  emptyMessage: string;
}

function GridRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
  loading,
  emptyMessage,
}: GridRendererProps<T>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-muted rounded mb-4" />
              <div className="h-4 w-2/3 bg-muted rounded mb-2" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        config?.columns === 2 && "grid-cols-1 sm:grid-cols-2",
        config?.columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        (!config?.columns || config.columns >= 4) &&
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}
    >
      {data.map((item) => (
        <Card
          key={getRowId(item)}
          className={cn(
            "overflow-hidden transition-shadow",
            onRowClick && "cursor-pointer hover:shadow-md"
          )}
          onClick={() => onRowClick?.(item)}
        >
          {config?.imageField && (item as Record<string, unknown>)[config.imageField] ? (
            <div className="aspect-video bg-muted relative">
              <img
                src={String(item[config.imageField])}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {config?.titleField && (
                  <h3 className="font-medium truncate">
                    {String(item[config.titleField] ?? "")}
                  </h3>
                )}
                {config?.subtitleField && (
                  <p className="text-sm text-muted-foreground truncate">
                    {String(item[config.subtitleField] ?? "")}
                  </p>
                )}
              </div>
              {config?.badgeField && (item as Record<string, unknown>)[config.badgeField] ? (
                <Badge variant="secondary">
                  {String(item[config.badgeField])}
                </Badge>
              ) : null}
            </div>
            {config?.cardFields && config.cardFields.length > 0 && (
              <div className="mt-3 space-y-1">
                {config.cardFields
                  .filter(
                    (f) => f !== config.titleField && f !== config.subtitleField
                  )
                  .slice(0, 3)
                  .map((field) => (
                    <div key={field} className="text-sm">
                      <span className="text-muted-foreground">{field}: </span>
                      <span>{String(item[field] ?? "-")}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface KanbanRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: KanbanViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function KanbanRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: KanbanRendererProps<T>) {
  const columns = React.useMemo<KanbanColumn<T & { id: string }>[]>(() => {
    if (!config) return [];
    return config.columns.map((col) => ({
      id: col.value,
      title: col.label,
      color: col.color,
      limit: col.limit,
      items: data
        .filter((item) => item[config.columnField] === col.value)
        .map((item) => ({ ...item, id: getRowId(item) })),
    }));
  }, [config, data, getRowId]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Kanban view configuration is required.
      </div>
    );
  }

  const cardTitle = config.card?.title;
  const cardSubtitle = config.card?.subtitle;

  return (
    <KanbanBoard
      columns={columns}
      onItemClick={(item) => onRowClick?.(item as T)}
      renderCard={(item) => (
        <Card className="p-3">
          <p className="font-medium text-sm">
            {typeof cardTitle === 'function'
              ? cardTitle(item)
              : String(item[cardTitle as string] ?? "")}
          </p>
          {cardSubtitle && (
            <p className="text-xs text-muted-foreground">
              {typeof cardSubtitle === 'function'
                ? cardSubtitle(item)
                : String(item[cardSubtitle as string] ?? "")}
            </p>
          )}
        </Card>
      )}
    />
  );
}

interface CalendarRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: CalendarViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function CalendarRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: CalendarRendererProps<T>) {
  const events = React.useMemo<CalendarEvent[]>(() => {
    if (!config) return [];
    return data.map((item) => ({
      id: getRowId(item),
      title: String(item[config.titleField] ?? ""),
      start: item[config.startField] as Date | string,
      end: config.endField ? (item[config.endField] as Date | string) : undefined,
      allDay: config.allDayField ? Boolean(item[config.allDayField]) : false,
      color: config.colorField ? String(item[config.colorField]) : undefined,
      data: item,
    }));
  }, [data, config, getRowId]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Calendar view configuration is required.
      </div>
    );
  }

  return (
    <CalendarView
      events={events}
      view={config.defaultView}
      onEventClick={(event) => {
        const original = data.find((d) => getRowId(d) === event.id);
        if (original && onRowClick) onRowClick(original);
      }}
    />
  );
}

interface TimelineRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: TimelineViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function TimelineRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: TimelineRendererProps<T>) {
  const items = React.useMemo<TimelineItem[]>(() => {
    if (!config) return [];
    return data.map((item) => ({
      id: getRowId(item),
      title: String(item[config.titleField] ?? ""),
      start: item[config.startField] as Date | string,
      end: item[config.endField] as Date | string,
      group: config.groupField ? String(item[config.groupField]) : undefined,
      color: undefined,
      data: item,
    }));
  }, [data, config, getRowId]);

  const groups = React.useMemo<TimelineGroup[]>(() => {
    if (!config?.groupField) return [];

    const uniqueGroups = new Set(
      data.map((item) => String(item[config.groupField!]))
    );
    return Array.from(uniqueGroups).map((g) => ({ id: g, title: g }));
  }, [data, config?.groupField]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Timeline view configuration is required.
      </div>
    );
  }

  return (
    <TimelineView
      items={items}
      groups={groups}
      onItemClick={(item) => {
        const original = data.find((d) => getRowId(d) === item.id);
        if (original && onRowClick) onRowClick(original);
      }}
    />
  );
}

interface GanttRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: GanttViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function GanttRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: GanttRendererProps<T>) {
  const tasks = React.useMemo<GanttTask[]>(() => {
    if (!config) return [];
    return data.map((item) => ({
      id: getRowId(item),
      name: String(item[config.titleField] ?? ""),
      startDate: item[config.startField] as Date | string,
      endDate: item[config.endField] as Date | string,
      progress: config.progressField
        ? (item[config.progressField] as number)
        : undefined,
      dependencies: config.dependenciesField
        ? (item[config.dependenciesField] as string[])
        : undefined,
    }));
  }, [data, config, getRowId]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Gantt view configuration is required.
      </div>
    );
  }

  return (
    <GanttView
      tasks={tasks}
      onTaskClick={(task) => {
        const original = data.find((d) => getRowId(d) === task.id);
        if (original && onRowClick) onRowClick(original);
      }}
    />
  );
}

interface MapRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: MapViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function MapRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: MapRendererProps<T>) {
  const markers = React.useMemo<MapMarker[]>(() => {
    if (!config) return [];
    return data
      .filter(
        (item) =>
          item[config.latitudeField] !== null &&
          item[config.latitudeField] !== undefined &&
          item[config.longitudeField] !== null &&
          item[config.longitudeField] !== undefined
      )
      .map((item) => ({
        id: getRowId(item),
        latitude: item[config.latitudeField] as number,
        longitude: item[config.longitudeField] as number,
        title: config.titleField ? String(item[config.titleField]) : "",
        data: item,
      }));
  }, [data, config, getRowId]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Map view configuration is required.
      </div>
    );
  }

  return (
    <MapView
      markers={markers}
      onMarkerClick={(marker) => {
        const original = data.find((d) => getRowId(d) === marker.id);
        if (original && onRowClick) onRowClick(original);
      }}
    />
  );
}

interface MatrixRendererProps<T extends Record<string, unknown>> {
  data: T[];
  config?: MatrixViewConfig;
  onRowClick?: (item: T) => void;
  getRowId: (item: T) => string;
}

function MatrixRenderer<T extends Record<string, unknown>>({
  data,
  config,
  onRowClick,
  getRowId,
}: MatrixRendererProps<T>) {
  const items = React.useMemo(() => {
    if (!config) return [];
    return data.map((item) => ({
      id: getRowId(item),
      title: String(item.title || item.name || item.item_name || "Untitled"),
      subtitle: String(item.status || ""),
      xValue: Number(item[config.xAxis] ?? 5),
      yValue: Number(item[config.yAxis] ?? 5),
      data: item,
    }));
  }, [data, config, getRowId]);

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Matrix view configuration is required.
      </div>
    );
  }

  return (
    <MatrixView
      items={items}
      config={config}
      onItemClick={onRowClick}
    />
  );
}
