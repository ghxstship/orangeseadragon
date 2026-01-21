import type { PageConfig } from "./types";

export const eventLogsPageConfig: PageConfig = {
  id: "event-logs",
  title: "Event Logs",
  description: "Track all system events and activities",

  source: {
    entity: "eventLogs",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Events", field: "totalEvents" },
      { id: "user", label: "User Events", field: "userEvents" },
      { id: "system", label: "System Events", field: "systemEvents" },
      { id: "api", label: "API Events", field: "apiEvents" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search events...",
      fields: ["eventType", "resource", "actor"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "actorType",
          label: "Actor Type",
          type: "select",
          options: [
            { label: "User", value: "user" },
            { label: "System", value: "system" },
            { label: "API", value: "api" },
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
        { field: "eventType", label: "Event Type", sortable: true },
        { field: "resource", label: "Resource", sortable: true },
        { field: "resourceId", label: "Resource ID", sortable: false },
        { field: "actor", label: "Actor", sortable: true },
        { field: "actorType", label: "Actor Type", sortable: true, format: { type: "badge", colorMap: { user: "#3b82f6", system: "#a855f7", api: "#22c55e" } } },
        { field: "timestamp", label: "Timestamp", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "export", label: "Export", icon: "download" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "resource", label: "View Resource" },
    { id: "copy", label: "Copy Event ID" },
  ],
};
