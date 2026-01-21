import type { PageConfig } from "./types";

export const healthChecksPageConfig: PageConfig = {
  id: "health-checks",
  title: "Health Checks",
  source: {
    entity: "health-checks",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Services", field: "count" },
      { id: "healthy", label: "Healthy", field: "healthyCount" },
      { id: "degraded", label: "Degraded", field: "degradedCount" },
      { id: "avgResponse", label: "Avg Response", field: "avgResponseTime" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search services...",
      fields: ["name", "endpoint"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Healthy", value: "healthy" },
            { label: "Degraded", value: "degraded" },
            { label: "Unhealthy", value: "unhealthy" },
          ],
        },
      ],
    },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Service", sortable: true },
        { field: "endpoint", label: "Endpoint" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { healthy: "#22c55e", degraded: "#eab308", unhealthy: "#ef4444" } } },
        { field: "responseTime", label: "Response", align: "right" },
        { field: "uptime", label: "Uptime", align: "right", format: { type: "percentage", decimals: 2 } },
        { field: "lastChecked", label: "Last Check", format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    grid: {
      titleField: "name",
      subtitleField: "endpoint",
      badgeField: "status",
      cardFields: ["responseTime", "uptime", "lastChecked"],
      columns: 2,
    },
  },
  primaryAction: {
    id: "refresh",
    label: "Refresh All",
    icon: "refresh-cw",
  },
  rowActions: [
    { id: "check", label: "Check Now" },
    { id: "history", label: "View History" },
    { id: "configure", label: "Configure" },
  ],
};
