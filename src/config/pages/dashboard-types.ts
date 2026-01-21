export type WidgetType = 
  | "stat"
  | "chart"
  | "list"
  | "table"
  | "activity"
  | "alerts"
  | "quick-actions"
  | "progress"
  | "calendar"
  | "custom";

export type ChartType = "bar" | "line" | "pie" | "donut" | "area" | "sparkline";

export interface StatWidgetConfig {
  type: "stat";
  id: string;
  title: string;
  field: string;
  format?: "number" | "currency" | "percentage";
  trend?: { field: string; direction: "up-good" | "down-good" };
  icon?: string;
  color?: string;
}

export interface ChartWidgetConfig {
  type: "chart";
  id: string;
  title: string;
  chartType: ChartType;
  dataSource: string;
  xField: string;
  yField: string;
  groupBy?: string;
  height?: number;
}

export interface ListWidgetConfig {
  type: "list";
  id: string;
  title: string;
  dataSource: string;
  titleField: string;
  subtitleField?: string;
  metaField?: string;
  badgeField?: string;
  limit?: number;
  emptyMessage?: string;
}

export interface TableWidgetConfig {
  type: "table";
  id: string;
  title: string;
  dataSource: string;
  columns: { field: string; label: string; format?: string }[];
  limit?: number;
}

export interface ActivityWidgetConfig {
  type: "activity";
  id: string;
  title: string;
  dataSource: string;
  actionField: string;
  descriptionField: string;
  userField: string;
  timeField: string;
  limit?: number;
}

export interface AlertsWidgetConfig {
  type: "alerts";
  id: string;
  title: string;
  dataSource: string;
  messageField: string;
  severityField: string;
  limit?: number;
}

export interface QuickActionsWidgetConfig {
  type: "quick-actions";
  id: string;
  title: string;
  actions: {
    id: string;
    label: string;
    icon: string;
    href?: string;
    action?: string;
  }[];
  columns?: 2 | 3 | 4;
}

export interface ProgressWidgetConfig {
  type: "progress";
  id: string;
  title: string;
  items: {
    label: string;
    valueField: string;
    maxField?: string;
    max?: number;
    format?: "number" | "currency" | "percentage";
  }[];
}

export type WidgetConfig =
  | StatWidgetConfig
  | ChartWidgetConfig
  | ListWidgetConfig
  | TableWidgetConfig
  | ActivityWidgetConfig
  | AlertsWidgetConfig
  | QuickActionsWidgetConfig
  | ProgressWidgetConfig;

export interface DashboardLayoutItem {
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardPageConfig {
  id: string;
  title: string;
  description?: string;
  widgets: WidgetConfig[];
  layout?: {
    columns: number;
    items?: DashboardLayoutItem[];
  };
  refreshInterval?: number;
  dateRange?: {
    enabled: boolean;
    default: "today" | "week" | "month" | "quarter" | "year" | "custom";
  };
}
