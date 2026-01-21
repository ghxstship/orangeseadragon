import type { PageConfig } from "./types";

export const reportsPageConfig: PageConfig = {
  id: "reports",
  title: "Reports",
  description: "Generate and schedule reports",

  source: {
    entity: "reports",
    defaultSorts: [{ field: "lastRun", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Reports", field: "count" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
      { id: "favorites", label: "Favorites", field: "favoriteCount" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search reports...",
      fields: ["name", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Finance", value: "Finance" },
            { label: "Projects", value: "Projects" },
            { label: "Assets", value: "Assets" },
            { label: "Workforce", value: "Workforce" },
            { label: "Events", value: "Events" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Chart", value: "chart" },
            { label: "Table", value: "table" },
            { label: "Summary", value: "summary" },
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
        { field: "category", label: "Category", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "schedule", label: "Schedule", sortable: true },
        { field: "lastRun", label: "Last Run", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Report", icon: "plus" },
  rowActions: [
    { id: "run", label: "Run" },
    { id: "view", label: "View Report" },
    { id: "schedule", label: "Schedule" },
    { id: "duplicate", label: "Duplicate" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
