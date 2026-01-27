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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import type { ViewType, DataViewState } from "@/lib/data-view-engine/hooks";
import type {
  TableViewConfig,
  TableColumnDefinition,
  KanbanViewConfig,
  CalendarViewConfig,
  TimelineViewConfig,
  MapViewConfig,
  ActionDefinition,
  ListViewConfig,
  GridViewConfig,
  GanttViewConfig,
  ColumnFormat,
} from "@/lib/schema/types";

type ActionConfig = ActionDefinition;

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
  };
  state: DataViewState;
  onStateChange: (updates: Partial<DataViewState>) => void;
  onRowClick?: (item: T) => void;
  rowActions?: ActionConfig[];
  getRowId: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
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

    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          View type &quot;{viewType}&quot; is not supported.
        </div>
      );
  }
}

function formatValue(value: unknown, format?: ColumnFormat): React.ReactNode {
  if (value === null || value === undefined) return "-";

  if (!format) return String(value);

  switch (format.type) {
    case "number":
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: format.decimals ?? 0,
        maximumFractionDigits: format.decimals ?? 0,
      }).format(value as number);

    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: format.currency ?? "USD",
      }).format(value as number);

    case "percentage":
      return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: format.decimals ?? 0,
        maximumFractionDigits: format.decimals ?? 0,
      }).format((value as number) / 100);

    case "date":
      return new Date(value as string).toLocaleDateString();

    case "datetime":
      return new Date(value as string).toLocaleString();

    case "boolean":
      return (value as boolean)
        ? format.trueLabel ?? "Yes"
        : format.falseLabel ?? "No";

    case "badge":
      const badgeColor = format.colorMap?.[String(value)];
      return (
        <Badge
          variant="secondary"
          style={badgeColor ? { backgroundColor: badgeColor } : undefined}
        >
          {String(value)}
        </Badge>
      );

    default:
      return String(value);
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
}: TableRendererProps<T>) {
  const columns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!config?.columns) return [];

    return config.columns
      .map((col) => normalizeColumn(col))
      .filter((col) => col.visible !== false)
      .filter((col) =>
        state.visibleColumns.length === 0 ||
        state.visibleColumns.includes(col.field)
      )
      .map((col) => ({
        accessorKey: col.field,
        header: col.label,
        cell: ({ row }) => {
          const value = row.getValue(col.field);
          return formatValue(value, col.format);
        },
        enableSorting: col.sortable !== false,
      }));
  }, [config?.columns, state.visibleColumns]);

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
      pageSize={10}
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
