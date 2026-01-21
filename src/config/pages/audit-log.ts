import type { PageConfig } from "./types";

export const auditLogPageConfig: PageConfig = {
  id: "audit-log",
  title: "Audit Log",
  description: "Track all system activities and changes",

  source: {
    entity: "audit_entries",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Events", field: "count" },
      { id: "today", label: "Today", field: "todayCount" },
      { id: "warnings", label: "Warnings", field: "warningCount" },
      { id: "critical", label: "Critical", field: "criticalCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search audit log...",
      fields: ["action", "user", "details"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Authentication", value: "auth" },
            { label: "Data", value: "data" },
            { label: "Settings", value: "settings" },
            { label: "Security", value: "security" },
            { label: "System", value: "system" },
          ],
        },
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Info", value: "info" },
            { label: "Warning", value: "warning" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          field: "timestamp",
          label: "Date Range",
          type: "dateRange",
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "timestamp", label: "Timestamp" },
        { field: "user", label: "User" },
        { field: "action", label: "Action" },
        { field: "severity", label: "Severity" },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["table"],
    export: { enabled: true, formats: ["csv", "xlsx", "json"] },
    refresh: { enabled: true },
  },

  views: {
    table: {
      columns: [
        { field: "timestamp", label: "Timestamp", sortable: true, format: { type: "datetime" } },
        { field: "user", label: "User", sortable: true },
        { field: "action", label: "Action", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge", colorMap: { auth: "#3b82f6", data: "#22c55e", settings: "#a855f7", security: "#f97316", system: "#6b7280" } } },
        { field: "severity", label: "Severity", sortable: true, format: { type: "badge", colorMap: { info: "#3b82f6", warning: "#eab308", critical: "#ef4444" } } },
        { field: "details", label: "Details", sortable: false },
        { field: "ipAddress", label: "IP Address", sortable: true },
      ],
      defaultPageSize: 20,
      pageSizeOptions: [20, 50, 100],
      selectable: false,
    },
  },

  primaryAction: {
    id: "export",
    label: "Export Log",
    icon: "download",
    variant: "outline",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "copy", label: "Copy Entry" },
  ],
};
