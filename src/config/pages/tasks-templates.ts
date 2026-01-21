import type { PageConfig } from "./types";

export const tasksTemplatesPageConfig: PageConfig = {
  id: "tasks-templates",
  title: "Task Templates",
  description: "Reusable task templates for common workflows",

  source: {
    entity: "task-templates",
    defaultSorts: [{ field: "usedCount", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Templates", field: "count" },
      { id: "tasks", label: "Total Tasks", field: "totalTasks" },
      { id: "used", label: "Times Used", field: "totalUsed" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search templates...",
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
            { label: "Events", value: "Events" },
            { label: "Operations", value: "Operations" },
            { label: "Marketing", value: "Marketing" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "description", label: "Description" },
        { field: "category", label: "Category", format: { type: "badge" } },
        { field: "tasks", label: "Tasks", align: "right" },
        { field: "usedCount", label: "Used", sortable: true, align: "right" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "category",
      metaFields: ["tasks", "usedCount"],
    },
    grid: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "category",
      cardFields: ["tasks", "usedCount"],
      columns: 2,
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Template",
    icon: "plus",
  },

  rowActions: [
    { id: "use", label: "Use Template" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
