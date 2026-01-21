/**
 * Data View Engine Types
 * Core type definitions for the data view and query system
 */

export type FieldType = 
  | "string" 
  | "number" 
  | "boolean" 
  | "date" 
  | "datetime" 
  | "time"
  | "email"
  | "url"
  | "phone"
  | "currency"
  | "percentage"
  | "json"
  | "array"
  | "relation"
  | "file"
  | "image";

export type SortDirection = "asc" | "desc";

export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | "isNull"
  | "isNotNull"
  | "between"
  | "regex";

export type AggregateFunction = "count" | "sum" | "avg" | "min" | "max" | "first" | "last";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  label?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  format?: FieldFormat;
  relation?: RelationDefinition;
}

export interface FieldValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: unknown[];
  custom?: string;
}

export interface FieldFormat {
  type: string;
  options?: Record<string, unknown>;
}

export interface RelationDefinition {
  entity: string;
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  foreignKey?: string;
  through?: string;
  cascade?: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: "table" | "view" | "query" | "api" | "file";
  entity?: string;
  fields: FieldDefinition[];
  primaryKey?: string;
  timestamps?: boolean;
  softDelete?: boolean;
}

export interface DataView {
  id: string;
  name: string;
  description?: string;
  source: DataSource;
  columns: ColumnDefinition[];
  filters?: FilterGroup;
  sorts?: SortDefinition[];
  groupBy?: GroupDefinition;
  pagination?: PaginationConfig;
  permissions?: ViewPermissions;
}

export interface ColumnDefinition {
  field: string;
  label?: string;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  format?: ColumnFormat;
  aggregate?: AggregateFunction;
  computed?: ComputedColumn;
}

export interface ColumnFormat {
  type: "text" | "number" | "currency" | "date" | "datetime" | "boolean" | "badge" | "link" | "image" | "custom";
  options?: Record<string, unknown>;
  template?: string;
}

export interface ComputedColumn {
  expression: string;
  dependencies: string[];
}

export interface FilterDefinition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  logic: "and" | "or";
  filters: (FilterDefinition | FilterGroup)[];
}

export interface SortDefinition {
  field: string;
  direction: SortDirection;
  nullsFirst?: boolean;
}

export interface GroupDefinition {
  fields: string[];
  aggregates?: AggregateDefinition[];
  having?: FilterGroup;
}

export interface AggregateDefinition {
  field: string;
  function: AggregateFunction;
  alias?: string;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  pageSizeOptions?: number[];
}

export interface ViewPermissions {
  read?: string[];
  create?: string[];
  update?: string[];
  delete?: string[];
  export?: string[];
}

export interface QueryBuilder {
  select(fields: string[]): QueryBuilder;
  from(source: string): QueryBuilder;
  where(filter: FilterDefinition | FilterGroup): QueryBuilder;
  orderBy(sort: SortDefinition | SortDefinition[]): QueryBuilder;
  groupBy(fields: string[]): QueryBuilder;
  having(filter: FilterGroup): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  join(relation: JoinDefinition): QueryBuilder;
  build(): CompiledQuery;
}

export interface JoinDefinition {
  type: "inner" | "left" | "right" | "full";
  source: string;
  on: JoinCondition;
  alias?: string;
}

export interface JoinCondition {
  leftField: string;
  rightField: string;
  operator?: FilterOperator;
}

export interface CompiledQuery {
  sql?: string;
  params?: unknown[];
  source: string;
  fields: string[];
  filters?: FilterGroup;
  sorts?: SortDefinition[];
  groups?: string[];
  having?: FilterGroup;
  limit?: number;
  offset?: number;
  joins?: JoinDefinition[];
}

export interface QueryResult<T = Record<string, unknown>> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  aggregates?: Record<string, unknown>;
  metadata?: QueryMetadata;
}

export interface QueryMetadata {
  executionTime: number;
  cached: boolean;
  source: string;
}

export interface DataViewConfig {
  id: string;
  name: string;
  type: "table" | "grid" | "list" | "kanban" | "calendar" | "timeline" | "chart" | "map";
  source: string;
  columns: ColumnDefinition[];
  defaultFilters?: FilterGroup;
  defaultSorts?: SortDefinition[];
  actions?: ViewAction[];
  toolbar?: ToolbarConfig;
  export?: ExportConfig;
}

export interface ViewAction {
  id: string;
  label: string;
  icon?: string;
  type: "create" | "edit" | "delete" | "custom" | "bulk";
  handler?: string;
  confirmation?: ActionConfirmation;
  permissions?: string[];
}

export interface ActionConfirmation {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ToolbarConfig {
  search?: boolean;
  filters?: boolean;
  columns?: boolean;
  export?: boolean;
  refresh?: boolean;
  density?: boolean;
  customActions?: ViewAction[];
}

export interface ExportConfig {
  formats: ("csv" | "xlsx" | "pdf" | "json")[];
  maxRows?: number;
  includeHeaders?: boolean;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "donut" | "area" | "scatter" | "radar" | "heatmap";
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series: SeriesConfig[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
}

export interface AxisConfig {
  field: string;
  label?: string;
  type?: "category" | "value" | "time";
  format?: string;
}

export interface SeriesConfig {
  name: string;
  field: string;
  type?: string;
  color?: string;
  aggregate?: AggregateFunction;
}

export interface LegendConfig {
  show: boolean;
  position: "top" | "bottom" | "left" | "right";
}

export interface TooltipConfig {
  show: boolean;
  format?: string;
}

export interface KanbanConfig {
  statusField: string;
  columns: KanbanColumn[];
  cardTitle: string;
  cardSubtitle?: string;
  cardFields?: string[];
  allowDrag?: boolean;
}

export interface KanbanColumn {
  id: string;
  label: string;
  value: unknown;
  color?: string;
  limit?: number;
}

export interface CalendarConfig {
  startField: string;
  endField?: string;
  titleField: string;
  colorField?: string;
  allDayField?: string;
  views: ("month" | "week" | "day" | "agenda")[];
  defaultView?: string;
}

export interface TimelineConfig {
  startField: string;
  endField: string;
  titleField: string;
  groupField?: string;
  colorField?: string;
}

export interface MapConfig {
  latitudeField: string;
  longitudeField: string;
  titleField?: string;
  clusterMarkers?: boolean;
  defaultZoom?: number;
  defaultCenter?: { lat: number; lng: number };
}
