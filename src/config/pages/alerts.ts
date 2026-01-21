import type { PageConfig } from "./types";

export const alertsPageConfig: PageConfig = {
  id: "alerts",
  title: "Alerts",
  description: "System alerts and notifications",

  source: {
    entity: "alerts",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Alerts", field: "count" },
      { id: "unacknowledged", label: "Unacknowledged", field: "unacknowledgedCount" },
      { id: "critical", label: "Critical", field: "criticalCount" },
      { id: "warnings", label: "Warnings", field: "warningCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search alerts...",
      fields: ["title", "message", "source"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Critical", value: "critical" },
            { label: "Warning", value: "warning" },
            { label: "Info", value: "info" },
            { label: "Success", value: "success" },
          ],
        },
        {
          field: "acknowledged",
          label: "Status",
          type: "select",
          options: [
            { label: "Acknowledged", value: "true" },
            { label: "Unacknowledged", value: "false" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "severity", label: "Severity", sortable: true, format: { type: "badge", colorMap: { critical: "#ef4444", warning: "#eab308", info: "#3b82f6", success: "#22c55e" } } },
        { field: "source", label: "Source", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "datetime" } },
        { field: "acknowledged", label: "Status", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "markAllRead", label: "Mark All Read", icon: "check" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "acknowledge", label: "Acknowledge" },
    { id: "snooze", label: "Snooze" },
    { id: "dismiss", label: "Dismiss", variant: "destructive" },
  ],
};
