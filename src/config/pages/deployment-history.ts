import type { PageConfig } from "./types";

export const deploymentHistoryPageConfig: PageConfig = {
  id: "deployment-history",
  title: "Deployment History",
  description: "Track all deployments across environments",

  source: {
    entity: "deployments",
    defaultSorts: [{ field: "deployedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Deployments", field: "totalDeployments" },
      { id: "successful", label: "Successful", field: "successCount" },
      { id: "production", label: "Production", field: "prodCount" },
      { id: "version", label: "Current Version", field: "currentVersion" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search deployments...",
      fields: ["version", "deployedBy", "branch"],
    },
    filters: {
      enabled: true,
      fields: [
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
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Success", value: "success" },
            { label: "Failed", value: "failed" },
            { label: "In Progress", value: "in_progress" },
            { label: "Rolled Back", value: "rolled_back" },
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
        { field: "version", label: "Version", sortable: true },
        { field: "environment", label: "Environment", sortable: true, format: { type: "badge", colorMap: { production: "#ef4444", staging: "#eab308", development: "#3b82f6" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { success: "#22c55e", failed: "#ef4444", in_progress: "#3b82f6", rolled_back: "#eab308" } } },
        { field: "deployedBy", label: "Deployed By", sortable: true },
        { field: "deployedAt", label: "Deployed At", sortable: true, format: { type: "date" } },
        { field: "duration", label: "Duration", sortable: false },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "deploy", label: "New Deployment", icon: "rocket" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "logs", label: "View Logs" },
    { id: "commit", label: "View Commit" },
    { id: "rollback", label: "Rollback", variant: "destructive" },
  ],
};
