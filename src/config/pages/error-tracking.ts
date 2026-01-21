import type { PageConfig } from "./types";

export const errorTrackingPageConfig: PageConfig = {
  id: "error-tracking",
  title: "Error Tracking",
  description: "Monitor and resolve application errors",

  source: {
    entity: "errorEvents",
    defaultSorts: [{ field: "lastSeen", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Errors", field: "totalErrors" },
      { id: "new", label: "New", field: "newErrors" },
      { id: "occurrences", label: "Occurrences", field: "totalOccurrences" },
      { id: "users", label: "Users Affected", field: "affectedUsers" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search errors...",
      fields: ["title", "message", "type"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "New", value: "new" },
            { label: "Investigating", value: "investigating" },
            { label: "Resolved", value: "resolved" },
            { label: "Ignored", value: "ignored" },
          ],
        },
        {
          field: "environment",
          label: "Environment",
          type: "select",
          options: [
            { label: "Production", value: "production" },
            { label: "Staging", value: "staging" },
            { label: "Development", value: "development" },
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
        { field: "title", label: "Error", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { new: "#ef4444", investigating: "#eab308", resolved: "#22c55e", ignored: "#6b7280" } } },
        { field: "occurrences", label: "Occurrences", sortable: true, format: { type: "number" } },
        { field: "users", label: "Users", sortable: true, format: { type: "number" } },
        { field: "lastSeen", label: "Last Seen", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "stacktrace", label: "View Stack Trace" },
    { id: "investigating", label: "Mark as Investigating" },
    { id: "resolve", label: "Mark as Resolved" },
    { id: "ignore", label: "Ignore" },
  ],
};
