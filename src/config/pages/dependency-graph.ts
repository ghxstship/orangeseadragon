import type { PageConfig } from "./types";

export const dependencyGraphPageConfig: PageConfig = {
  id: "dependency-graph",
  title: "Dependency Graph",
  description: "Visualize service dependencies and relationships",

  source: {
    entity: "services",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "services", label: "Services", field: "serviceCount" },
      { id: "dependencies", label: "Dependencies", field: "dependencyCount" },
      { id: "healthy", label: "Healthy", field: "healthyCount" },
      { id: "criticalPath", label: "Critical Path", field: "criticalPath" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search services...",
      fields: ["name", "version"],
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
            { label: "Down", value: "down" },
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
        { field: "name", label: "Service", sortable: true },
        { field: "version", label: "Version", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { healthy: "#22c55e", degraded: "#eab308", down: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Service", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "dependencies", label: "View Dependencies" },
    { id: "dependents", label: "View Dependents" },
  ],
};
