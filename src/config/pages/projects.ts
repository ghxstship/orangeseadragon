import type { PageConfig } from "./types";

export const projectsPageConfig: PageConfig = {
  id: "projects",
  title: "Projects",
  description: "Manage your project portfolio",

  source: {
    entity: "projects",
    defaultSorts: [{ field: "startDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Projects", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "planning", label: "Planning", field: "planningCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search projects...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Planning", value: "planning" },
            { label: "Active", value: "active" },
            { label: "On Hold", value: "on_hold" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        {
          field: "priority",
          label: "Priority",
          type: "select",
          options: [
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", planning: "#3b82f6", active: "#22c55e", on_hold: "#eab308", completed: "#a855f7", cancelled: "#ef4444" } } },
        { field: "priority", label: "Priority", sortable: true, format: { type: "badge", colorMap: { critical: "#dc2626", high: "#f97316", medium: "#eab308", low: "#3b82f6" } } },
        { field: "startDate", label: "Start", sortable: true, format: { type: "date" } },
        { field: "endDate", label: "End", sortable: true, format: { type: "date" } },
        { field: "budget", label: "Budget", sortable: true, align: "right", format: { type: "currency" } },
        { field: "teamSize", label: "Team", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Project", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "archive", label: "Archive" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
