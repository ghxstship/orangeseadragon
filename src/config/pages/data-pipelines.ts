import type { PageConfig } from "./types";

export const dataPipelinesPageConfig: PageConfig = {
  id: "data-pipelines",
  title: "Data Pipelines",
  description: "Manage ETL and data transformation pipelines",

  source: {
    entity: "pipelines",
    defaultSorts: [{ field: "lastRun", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Pipelines", field: "totalPipelines" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "errors", label: "Errors", field: "errorCount" },
      { id: "records", label: "Records Today", field: "totalRecords" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search pipelines...",
      fields: ["name", "source", "destination"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Paused", value: "paused" },
            { label: "Error", value: "error" },
            { label: "Running", value: "running" },
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
        { field: "name", label: "Pipeline", sortable: true },
        { field: "source", label: "Source", sortable: true },
        { field: "destination", label: "Destination", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", paused: "#6b7280", error: "#ef4444", running: "#3b82f6" } } },
        { field: "schedule", label: "Schedule", sortable: false },
        { field: "lastRun", label: "Last Run", sortable: true, format: { type: "date" } },
        { field: "recordsProcessed", label: "Records", sortable: true, format: { type: "number" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Pipeline", icon: "plus" },
  rowActions: [
    { id: "run", label: "Run" },
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "logs", label: "View Logs" },
    { id: "toggle", label: "Pause/Resume" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
