import type { PageConfig } from "./types";

export const cdnManagementPageConfig: PageConfig = {
  id: "cdn-management",
  title: "CDN Management",
  description: "Content delivery network configuration",

  source: {
    entity: "cdn_edges",
    defaultSorts: [{ field: "location", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "edges", label: "Edge Locations", field: "count" },
      { id: "hitRate", label: "Cache Hit Rate", field: "avgHitRate", format: "percentage" },
      { id: "bandwidth", label: "Bandwidth (24h)", field: "totalBandwidth" },
      { id: "requests", label: "Requests (24h)", field: "totalRequests" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search locations...",
      fields: ["location", "region"],
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
            { label: "Offline", value: "offline" },
          ],
        },
      ],
    },
    viewTypes: ["grid", "table"],
  },

  views: {
    grid: {
      titleField: "location",
      subtitleField: "region",
      badgeField: "status",
      cardFields: ["hitRate", "bandwidth", "requests"],
      columns: 3,
    },
    table: {
      columns: [
        { field: "location", label: "Location", sortable: true },
        { field: "region", label: "Region", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { healthy: "#22c55e", degraded: "#eab308", offline: "#ef4444" } } },
        { field: "hitRate", label: "Hit Rate", sortable: true, format: { type: "percentage" } },
        { field: "bandwidth", label: "Bandwidth", sortable: true },
        { field: "requests", label: "Requests", sortable: true, format: { type: "number" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: {
    id: "purge",
    label: "Purge Cache",
    icon: "trash",
    variant: "outline",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "purge", label: "Purge Cache" },
    { id: "disable", label: "Disable" },
  ],
};
