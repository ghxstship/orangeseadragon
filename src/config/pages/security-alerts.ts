import type { PageConfig } from "./types";

export const securityAlertsPageConfig: PageConfig = {
  id: "security-alerts",
  title: "Security Alerts",
  description: "Monitor and respond to security events",

  source: {
    entity: "securityAlerts",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Alerts", field: "totalAlerts" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "investigating", label: "Investigating", field: "investigatingCount" },
      { id: "critical", label: "Critical", field: "criticalCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search alerts...",
      fields: ["title", "description", "type", "source"],
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
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Open", value: "open" },
            { label: "Investigating", value: "investigating" },
            { label: "Resolved", value: "resolved" },
          ],
        },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Alert", sortable: true },
        { field: "type", label: "Type", sortable: true },
        {
          field: "severity",
          label: "Severity",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              critical: "#dc2626",
              high: "#ef4444",
              medium: "#eab308",
              low: "#3b82f6",
            },
          },
        },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              open: "#ef4444",
              investigating: "#eab308",
              resolved: "#22c55e",
            },
          },
        },
        { field: "source", label: "Source", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "investigate", label: "Investigate" },
    { id: "resolve", label: "Mark as Resolved" },
    { id: "dismiss", label: "Dismiss" },
  ],
};
