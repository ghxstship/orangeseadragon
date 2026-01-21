import type { PageConfig } from "./types";

export const workflowsPageConfig: PageConfig = {
  id: "workflows",
  title: "Workflows",
  description: "Automate processes with workflow templates",

  source: {
    entity: "workflows",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Workflows", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "runs", label: "Total Runs", field: "totalRuns" },
      { id: "success", label: "Success Rate", field: "successRate", format: "percentage" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search workflows...",
      fields: ["name", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "is_active",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        },
        {
          field: "trigger_type",
          label: "Trigger",
          type: "select",
          options: [
            { label: "On Create", value: "entity_created" },
            { label: "On Update", value: "entity_updated" },
            { label: "Scheduled", value: "schedule" },
            { label: "Manual", value: "manual" },
          ],
        },
      ],
    },
    viewTypes: ["grid", "list"],
  },

  views: {
    grid: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "category",
      cardFields: ["trigger_type", "runs_total", "runs_success"],
      columns: 3,
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "category",
      metaFields: ["trigger_type", "runs_total"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Workflow",
    icon: "plus",
  },

  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "runs", label: "View Runs" },
    { id: "duplicate", label: "Duplicate" },
    { id: "toggle", label: "Toggle Status" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
