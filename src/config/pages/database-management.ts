import type { PageConfig } from "./types";

export const databaseManagementPageConfig: PageConfig = {
  id: "database-management",
  title: "Database Management",
  description: "Monitor and manage database instances",

  source: {
    entity: "databases",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Instances", field: "totalInstances" },
      { id: "replicas", label: "Replicas", field: "replicaCount" },
      { id: "connections", label: "Total Connections", field: "totalConnections" },
      { id: "lag", label: "Replication Lag", field: "replicationLag" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search databases...",
      fields: ["name", "type", "region"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "role",
          label: "Role",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Replica", value: "replica" },
          ],
        },
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
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "role", label: "Role", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { healthy: "#22c55e", warning: "#eab308", critical: "#ef4444" } } },
        { field: "connections", label: "Connections", sortable: true, format: { type: "number" } },
        { field: "storage", label: "Storage (GB)", sortable: true, format: { type: "number" } },
        { field: "region", label: "Region", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Instance", icon: "plus" },
  rowActions: [
    { id: "metrics", label: "Metrics" },
    { id: "restart", label: "Restart" },
    { id: "backup", label: "Create Backup" },
    { id: "logs", label: "View Logs" },
  ],
};
