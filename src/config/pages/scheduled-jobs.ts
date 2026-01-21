import type { PageConfig } from "./types";

export const scheduledJobsPageConfig: PageConfig = {
  id: "scheduled-jobs",
  title: "Scheduled Jobs",
  description: "Manage automated scheduled tasks",
  source: { entity: "scheduled_jobs", defaultSorts: [{ field: "nextRun", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Jobs", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "errors", label: "Errors", field: "errorCount" },
      { id: "nextRun", label: "Next Run", field: "nextRun" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search jobs...", fields: ["name", "description"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Paused", value: "paused" }, { label: "Error", value: "error" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "schedule", label: "Schedule", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", paused: "#eab308", error: "#ef4444" } } },
        { field: "lastStatus", label: "Last Run", sortable: true, format: { type: "badge", colorMap: { success: "#22c55e", failed: "#ef4444", running: "#3b82f6", pending: "#eab308" } } },
        { field: "nextRun", label: "Next Run", sortable: true, format: { type: "datetime" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Create Job", icon: "plus" },
  rowActions: [{ id: "edit", label: "Edit Job" }, { id: "run", label: "Run Now" }, { id: "logs", label: "View Logs" }, { id: "history", label: "View History" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
