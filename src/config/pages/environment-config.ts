import type { PageConfig } from "./types";

export const environmentConfigPageConfig: PageConfig = {
  id: "environment-config",
  title: "Environment Config",
  description: "Manage environment variables and secrets",

  source: {
    entity: "envVariables",
    defaultSorts: [{ field: "key", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Variables", field: "totalVariables" },
      { id: "secrets", label: "Secrets", field: "secretCount" },
      { id: "production", label: "Production", field: "prodVars" },
      { id: "environments", label: "Environments", field: "envCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search variables...",
      fields: ["key", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "environment",
          label: "Environment",
          type: "select",
          options: [
            { label: "All", value: "all" },
            { label: "Production", value: "production" },
            { label: "Staging", value: "staging" },
            { label: "Development", value: "development" },
          ],
        },
        {
          field: "isSecret",
          label: "Type",
          type: "select",
          options: [
            { label: "Secret", value: "true" },
            { label: "Public", value: "false" },
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
        { field: "key", label: "Key", sortable: true },
        { field: "environment", label: "Environment", sortable: true, format: { type: "badge", colorMap: { all: "#a855f7", production: "#ef4444", staging: "#eab308", development: "#3b82f6" } } },
        { field: "isSecret", label: "Secret", sortable: true, format: { type: "boolean" } },
        { field: "description", label: "Description", sortable: false },
        { field: "updatedAt", label: "Updated", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Variable", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "history", label: "View History" },
    { id: "copy", label: "Copy Value" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
