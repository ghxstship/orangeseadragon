import type { PageConfig } from "./types";

export const ciCdPipelinesPageConfig: PageConfig = {
  id: "ci-cd-pipelines",
  title: "CI/CD Pipelines",
  description: "Continuous integration and deployment workflows",

  source: {
    entity: "pipelines",
    defaultSorts: [{ field: "startedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Pipelines", field: "totalPipelines" },
      { id: "successful", label: "Successful", field: "successCount" },
      { id: "running", label: "Running", field: "runningCount" },
      { id: "successRate", label: "Success Rate", field: "successRate" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search pipelines...",
      fields: ["name", "branch", "commit"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Success", value: "success" },
            { label: "Failed", value: "failed" },
            { label: "Running", value: "running" },
            { label: "Pending", value: "pending" },
          ],
        },
        {
          field: "branch",
          label: "Branch",
          type: "select",
          options: [
            { label: "main", value: "main" },
            { label: "develop", value: "develop" },
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
        { field: "branch", label: "Branch", sortable: true },
        { field: "commit", label: "Commit", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { success: "#22c55e", failed: "#ef4444", running: "#3b82f6", pending: "#6b7280" } } },
        { field: "triggeredBy", label: "Triggered By", sortable: true },
        { field: "startedAt", label: "Started", sortable: true, format: { type: "date" } },
        { field: "duration", label: "Duration", sortable: false },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "run", label: "Run Pipeline", icon: "play" },
  rowActions: [
    { id: "viewLogs", label: "View Logs" },
    { id: "viewArtifacts", label: "View Artifacts" },
    { id: "rerun", label: "Rerun Pipeline" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
