import type { PageConfig } from "./types";

export const dataPrivacyPageConfig: PageConfig = {
  id: "data-privacy",
  title: "Data Privacy",
  description: "Manage data privacy settings and compliance",

  source: {
    entity: "privacySettings",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "score", label: "Privacy Score", field: "privacyScore" },
      { id: "enabled", label: "Settings Enabled", field: "enabledCount" },
      { id: "requests", label: "Data Requests", field: "pendingRequests" },
      { id: "audit", label: "Last Audit", field: "lastAudit" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search settings...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Security", value: "Security" },
            { label: "Compliance", value: "Compliance" },
            { label: "Privacy", value: "Privacy" },
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
        { field: "name", label: "Setting", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "category", label: "Category", sortable: true },
        { field: "enabled", label: "Enabled", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "audit", label: "Run Audit", icon: "shield" },
  rowActions: [
    { id: "toggle", label: "Toggle" },
    { id: "configure", label: "Configure" },
  ],
};
