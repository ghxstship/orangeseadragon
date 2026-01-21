import type { PageConfig } from "./types";

export const cacheManagementPageConfig: PageConfig = {
  id: "cache-management",
  title: "Cache Management",
  description: "Monitor and manage cache instances",

  source: {
    entity: "cacheInstances",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "memory", label: "Total Memory", field: "totalMemory" },
      { id: "keys", label: "Total Keys", field: "totalKeys" },
      { id: "hitRate", label: "Hit Rate", field: "avgHitRate" },
      { id: "instances", label: "Instances", field: "instanceCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search instances...",
      fields: ["name", "type", "region"],
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
            { label: "Warning", value: "warning" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Redis", value: "Redis" },
            { label: "Memcached", value: "Memcached" },
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
        { field: "name", label: "Instance", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { healthy: "#22c55e", warning: "#eab308", critical: "#ef4444" } } },
        { field: "memory", label: "Memory", sortable: true },
        { field: "keys", label: "Keys", sortable: true, format: { type: "number" } },
        { field: "hitRate", label: "Hit Rate", sortable: true },
        { field: "region", label: "Region", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "clearAll", label: "Clear All Cache", icon: "trash-2" },
  rowActions: [
    { id: "metrics", label: "View Metrics" },
    { id: "flush", label: "Flush Cache" },
    { id: "configure", label: "Configure" },
  ],
};
