import type { PageConfig } from "./types";

export const automationPageConfig: PageConfig = {
  id: "automation",
  title: "Automation",
  description: "Configure automated workflows and actions",

  source: {
    entity: "automations",
    defaultSorts: [{ field: "lastRun", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Automations", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "runs", label: "Total Runs", field: "totalRuns" },
      { id: "errors", label: "Errors", field: "errorCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search automations...",
      fields: ["name", "description", "trigger"],
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
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "trigger", label: "Trigger", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", paused: "#eab308", error: "#ef4444" } } },
        { field: "runCount", label: "Runs", sortable: true, align: "right" },
        { field: "successRate", label: "Success Rate", sortable: true, align: "right" },
        { field: "lastRun", label: "Last Run", sortable: true, format: { type: "datetime" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Automation", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Automation" },
    { id: "history", label: "View Run History" },
    { id: "run", label: "Run Now" },
    { id: "duplicate", label: "Duplicate" },
    { id: "toggle", label: "Toggle Status" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
