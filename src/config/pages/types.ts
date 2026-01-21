/**
 * Page Configuration Types
 * Defines the schema for configuring data view pages
 */

import type { ViewType } from "@/lib/data-view-engine/hooks";
import type { FilterOperator, SortDirection } from "@/lib/data-view-engine/types";

export interface PageConfig {
  id: string;
  title: string;
  description?: string;

  source: SourceConfig;
  stats?: StatsConfig;
  toolbar: ToolbarConfig;
  views: ViewsConfig;

  primaryAction?: ActionConfig;
  rowActions?: ActionConfig[];

  permissions?: PermissionsConfig;
}

export interface SourceConfig {
  entity: string;
  endpoint?: string;
  defaultFilters?: FilterConfig[];
  defaultSorts?: SortConfig[];
}

export interface StatsConfig {
  enabled: boolean;
  items: StatItemConfig[];
}

export interface StatItemConfig {
  id: string;
  label: string;
  field?: string;
  value?: string | number;
  format?: "number" | "currency" | "percentage";
  trend?: {
    field: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: string;
}

export interface ToolbarConfig {
  search?: SearchConfig;
  filters?: FiltersConfig;
  sort?: SortToolbarConfig;
  columns?: ColumnsConfig;
  viewTypes?: ViewType[];
  export?: ExportToolbarConfig;
  import?: ImportConfig;
  refresh?: RefreshConfig;
  bulkActions?: BulkActionConfig[];
}

export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  fields?: string[];
}

export interface FiltersConfig {
  enabled: boolean;
  fields: FilterFieldConfig[];
}

export interface FilterFieldConfig {
  field: string;
  label: string;
  type: "select" | "multiselect" | "text" | "number" | "date" | "dateRange" | "boolean";
  options?: FilterOption[];
  operators?: FilterOperator[];
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface SortToolbarConfig {
  enabled: boolean;
  fields: SortFieldConfig[];
}

export interface SortFieldConfig {
  field: string;
  label: string;
  defaultDirection?: SortDirection;
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface ColumnsConfig {
  enabled: boolean;
}

export interface ExportToolbarConfig {
  enabled: boolean;
  formats: ("csv" | "xlsx" | "pdf" | "json")[];
}

export interface ImportConfig {
  enabled: boolean;
  formats?: string[];
  template?: string;
}

export interface RefreshConfig {
  enabled: boolean;
  autoRefresh?: boolean;
  interval?: number;
}

export interface BulkActionConfig {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "destructive";
  confirmation?: ConfirmationConfig;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  href?: string;
  confirmation?: ConfirmationConfig;
}

export interface ViewsConfig {
  table?: TableViewConfig;
  list?: ListViewConfig;
  grid?: GridViewConfig;
  kanban?: KanbanViewConfig;
  calendar?: CalendarViewConfig;
  timeline?: TimelineViewConfig;
  gantt?: GanttViewConfig;
  map?: MapViewConfig;
}

export interface TableViewConfig {
  columns: TableColumnConfig[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
}

export interface TableColumnConfig {
  field: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  format?: ColumnFormat;
}

export type ColumnFormat =
  | { type: "text" }
  | { type: "number"; decimals?: number }
  | { type: "currency"; currency?: string }
  | { type: "percentage"; decimals?: number }
  | { type: "date"; format?: string }
  | { type: "datetime"; format?: string }
  | { type: "boolean"; trueLabel?: string; falseLabel?: string }
  | { type: "badge"; colorMap?: Record<string, string> }
  | { type: "link"; hrefField?: string }
  | { type: "avatar"; fallbackField?: string }
  | { type: "custom"; render?: string };

export interface ListViewConfig {
  titleField: string;
  subtitleField?: string;
  descriptionField?: string;
  avatarField?: string;
  badgeField?: string;
  metaFields?: string[];
  showChevron?: boolean;
}

export interface GridViewConfig {
  cardFields: string[];
  imageField?: string;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  columns?: number;
}

export interface KanbanViewConfig {
  statusField: string;
  columns: KanbanColumnConfig[];
  cardTitleField: string;
  cardSubtitleField?: string;
  cardFields?: string[];
  allowDrag?: boolean;
}

export interface KanbanColumnConfig {
  id: string;
  label: string;
  value: string | number;
  color?: string;
  limit?: number;
}

export interface CalendarViewConfig {
  startField: string;
  endField?: string;
  titleField: string;
  colorField?: string;
  allDayField?: string;
  defaultView?: "month" | "week" | "day" | "agenda";
}

export interface TimelineViewConfig {
  startField: string;
  endField: string;
  titleField: string;
  groupField?: string;
  colorField?: string;
}

export interface GanttViewConfig {
  startField: string;
  endField: string;
  titleField: string;
  progressField?: string;
  dependenciesField?: string;
  assigneeField?: string;
}

export interface MapViewConfig {
  latitudeField: string;
  longitudeField: string;
  titleField?: string;
  clusterMarkers?: boolean;
  defaultZoom?: number;
  defaultCenter?: { lat: number; lng: number };
}

export interface PermissionsConfig {
  create?: string[];
  read?: string[];
  update?: string[];
  delete?: string[];
  export?: string[];
  import?: string[];
}
