import type { PageConfig } from "./types";

export const assetsMaintenancePageConfig: PageConfig = {
  id: "assets-maintenance",
  title: "Maintenance",
  description: "Equipment maintenance and repairs",

  source: {
    entity: "assetsMaintenance",
    defaultSorts: [{ field: "scheduled_date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total", field: "totalCount" },
      { id: "inProgress", label: "In Progress", field: "inProgressCount" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search...",
      fields: ["name", "assignee"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
          ],
        },
        {
          field: "priority",
          label: "Priority",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
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
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              scheduled: "#eab308",
              in_progress: "#3b82f6",
              completed: "#22c55e",
            },
          },
        },
        {
          field: "priority",
          label: "Priority",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              high: "#ef4444",
              medium: "#eab308",
              low: "#6b7280",
            },
          },
        },
        { field: "scheduled_date", label: "Scheduled", sortable: true, format: { type: "date" } },
        { field: "assignee", label: "Assignee", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "schedule", label: "Schedule Maintenance", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "complete", label: "Mark Complete" },
  ],
};
