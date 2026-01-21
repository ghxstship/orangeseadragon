import type { PageConfig } from "./types";

export const featureFlagsPageConfig: PageConfig = {
  id: "feature-flags",
  title: "Feature Flags",
  description: "Control feature rollouts and experiments",

  source: {
    entity: "featureFlags",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Flags", field: "totalFlags" },
      { id: "enabled", label: "Enabled", field: "enabledFlags" },
      { id: "production", label: "In Production", field: "prodFlags" },
      { id: "partial", label: "Partial Rollouts", field: "partialRollouts" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search flags...",
      fields: ["key", "name", "description"],
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
          field: "enabled",
          label: "Status",
          type: "select",
          options: [
            { label: "Enabled", value: "true" },
            { label: "Disabled", value: "false" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "environment", label: "Environment", sortable: true, format: { type: "badge", colorMap: { all: "#a855f7", production: "#ef4444", staging: "#eab308", development: "#3b82f6" } } },
        { field: "enabled", label: "Enabled", sortable: true, format: { type: "boolean" } },
        { field: "rollout_percentage", label: "Rollout %", sortable: true },
        { field: "updated_at", label: "Updated", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Flag", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Flag" },
    { id: "history", label: "View History" },
    { id: "targeting", label: "Configure Targeting" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
