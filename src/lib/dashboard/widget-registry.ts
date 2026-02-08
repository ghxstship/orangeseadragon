// Dashboard Widget Registry - defines all available widgets and their configurations

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: "metrics" | "tasks" | "calendar" | "activity" | "custom";
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  component: string; // Component path for dynamic import
  defaultConfig?: Record<string, unknown>;
  configSchema?: WidgetConfigField[];
  roles?: string[]; // Restrict to specific roles
}

export interface WidgetConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "multiselect";
  options?: { value: string; label: string }[];
  default?: unknown;
  required?: boolean;
}

export interface DashboardWidget {
  id: string;
  widgetId: string;
  position: { x: number; y: number };
  size: WidgetSize;
  config?: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  columns: number;
  isDefault?: boolean;
  isShared?: boolean;
  userId?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Size to grid span mapping
export const sizeToSpan: Record<WidgetSize, { cols: number; rows: number }> = {
  small: { cols: 3, rows: 1 },
  medium: { cols: 6, rows: 1 },
  large: { cols: 6, rows: 2 },
  full: { cols: 12, rows: 1 },
};

// Widget Registry - all available widgets
export const widgetRegistry: WidgetDefinition[] = [
  {
    id: "metrics",
    name: "Key Metrics",
    description: "Display key performance metrics with trends",
    category: "metrics",
    defaultSize: "full",
    minSize: "medium",
    maxSize: "full",
    component: "MetricsWidget",
    defaultConfig: {
      title: "Key Metrics",
    },
    configSchema: [
      { key: "title", label: "Title", type: "text", default: "Key Metrics" },
    ],
  },
  {
    id: "quick-stats",
    name: "Quick Stats",
    description: "Compact statistics overview",
    category: "metrics",
    defaultSize: "small",
    minSize: "small",
    maxSize: "medium",
    component: "QuickStatsWidget",
  },
  {
    id: "today-schedule",
    name: "Today's Schedule",
    description: "View today's calendar events",
    category: "calendar",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "TodayScheduleWidget",
  },
  {
    id: "upcoming-tasks",
    name: "Upcoming Tasks",
    description: "Tasks due soon",
    category: "tasks",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "UpcomingTasksWidget",
    defaultConfig: {
      limit: 5,
      showCompleted: false,
    },
    configSchema: [
      { key: "limit", label: "Number of tasks", type: "number", default: 5 },
      { key: "showCompleted", label: "Show completed", type: "boolean", default: false },
    ],
  },
  {
    id: "my-tasks",
    name: "My Tasks",
    description: "Tasks assigned to you",
    category: "tasks",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "MyTasksWidget",
    defaultConfig: {
      limit: 5,
    },
    configSchema: [
      { key: "limit", label: "Number of tasks", type: "number", default: 5 },
    ],
  },
  {
    id: "quick-actions",
    name: "Quick Actions",
    description: "Shortcuts to common actions",
    category: "activity",
    defaultSize: "small",
    minSize: "small",
    maxSize: "medium",
    component: "QuickActionsWidget",
  },
  {
    id: "recent-activity",
    name: "Recent Activity",
    description: "Latest activity feed",
    category: "activity",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "RecentActivityWidget",
    defaultConfig: {
      limit: 8,
    },
    configSchema: [
      { key: "limit", label: "Number of items", type: "number", default: 8 },
    ],
  },
  {
    id: "active-events",
    name: "Active Events",
    description: "Currently running events",
    category: "calendar",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "ActiveEventsWidget",
  },
  {
    id: "crew-status",
    name: "Crew Status",
    description: "Team member availability",
    category: "activity",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "large",
    component: "CrewStatusWidget",
    roles: ["admin", "producer", "coordinator"],
  },
  {
    id: "inbox-summary",
    name: "Inbox Summary",
    description: "Unread notifications and pending approvals",
    category: "activity",
    defaultSize: "small",
    minSize: "small",
    maxSize: "medium",
    component: "InboxSummaryWidget",
  },
  {
    id: "project-progress",
    name: "Project Progress",
    description: "Progress across active projects",
    category: "metrics",
    defaultSize: "medium",
    minSize: "medium",
    maxSize: "large",
    component: "ProjectProgressWidget",
  },
  {
    id: "setup-checklist",
    name: "Getting Started",
    description: "Complete your setup checklist",
    category: "activity",
    defaultSize: "medium",
    minSize: "small",
    maxSize: "medium",
    component: "SetupChecklistWidget",
  },
];

// Get widget definition by ID
export function getWidgetDefinition(widgetId: string): WidgetDefinition | undefined {
  return widgetRegistry.find((w) => w.id === widgetId);
}

// Get widgets by category
export function getWidgetsByCategory(category: WidgetDefinition["category"]): WidgetDefinition[] {
  return widgetRegistry.filter((w) => w.category === category);
}

// Get widgets available for a role
export function getWidgetsForRole(role?: string): WidgetDefinition[] {
  if (!role) return widgetRegistry.filter((w) => !w.roles);
  return widgetRegistry.filter((w) => !w.roles || w.roles.includes(role));
}

// Default dashboard layout
export const defaultDashboardLayout: DashboardLayout = {
  id: "default",
  name: "Default Dashboard",
  columns: 12,
  widgets: [
    { id: "w1", widgetId: "metrics", position: { x: 0, y: 0 }, size: "full" },
    { id: "w2", widgetId: "today-schedule", position: { x: 0, y: 1 }, size: "medium" },
    { id: "w3", widgetId: "upcoming-tasks", position: { x: 6, y: 1 }, size: "medium" },
    { id: "w4", widgetId: "quick-actions", position: { x: 0, y: 2 }, size: "small" },
    { id: "w5", widgetId: "recent-activity", position: { x: 3, y: 2 }, size: "medium", config: { limit: 8 } },
  ],
};
