import type { PageConfig } from "./types";

export const disasterRecoveryPageConfig: PageConfig = {
  id: "disaster-recovery",
  title: "Disaster Recovery",
  description: "Business continuity and disaster recovery planning",

  source: {
    entity: "recoveryTargets",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "status", label: "DR Status", field: "drStatus" },
      { id: "protected", label: "Systems Protected", field: "protectedCount" },
      { id: "rto", label: "Target RTO", field: "targetRto" },
      { id: "lastTest", label: "Last DR Test", field: "lastTest" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search targets...",
      fields: ["name", "type"],
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
            { label: "Database", value: "Database" },
            { label: "Compute", value: "Compute" },
            { label: "Storage", value: "Storage" },
            { label: "Cache", value: "Cache" },
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
        { field: "name", label: "Target", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { healthy: "#22c55e", warning: "#eab308", critical: "#ef4444" } } },
        { field: "rto", label: "RTO", sortable: true },
        { field: "rpo", label: "RPO", sortable: true },
        { field: "lastTested", label: "Last Tested", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "test", label: "Test Recovery", icon: "refresh-cw" },
  rowActions: [
    { id: "test", label: "Test" },
    { id: "configure", label: "Configure" },
    { id: "history", label: "View History" },
  ],
};
