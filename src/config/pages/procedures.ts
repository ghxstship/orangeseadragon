import type { PageConfig } from "./types";

export const proceduresPageConfig: PageConfig = {
  id: "procedures",
  title: "Procedures",
  description: "Standard operating procedures and checklists",

  source: {
    entity: "procedures",
    defaultSorts: [{ field: "lastUpdated", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Procedures", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "categories", label: "Categories", field: "categoryCount" },
      { id: "steps", label: "Total Steps", field: "totalSteps" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search procedures...",
      fields: ["name", "category", "owner"],
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
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Operations", value: "Operations" },
            { label: "Safety", value: "Safety" },
            { label: "Procurement", value: "Procurement" },
            { label: "HR", value: "HR" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", draft: "#eab308", archived: "#6b7280" } } },
        { field: "version", label: "Version", sortable: true },
        { field: "steps", label: "Steps", sortable: true, align: "right" },
        { field: "owner", label: "Owner", sortable: true },
        { field: "lastUpdated", label: "Updated", sortable: true, format: { type: "date" } },
        { field: "completions", label: "Completions", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Procedure", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "start", label: "Start Checklist" },
    { id: "history", label: "View History" },
    { id: "archive", label: "Archive", variant: "destructive" },
  ],
};
