import type { PageConfig } from "./types";

export const apiVersionsPageConfig: PageConfig = {
  id: "api-versions",
  title: "API Versions",
  description: "Manage API version settings and view changelog",

  source: {
    entity: "apiVersions",
    defaultSorts: [{ field: "releaseDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "current", label: "Current Version", field: "currentVersion" },
      { id: "supported", label: "Supported", field: "supportedCount" },
      { id: "deprecated", label: "Deprecated", field: "deprecatedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search versions...",
      fields: ["version"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Current", value: "current" },
            { label: "Supported", value: "supported" },
            { label: "Deprecated", value: "deprecated" },
            { label: "Sunset", value: "sunset" },
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
        { field: "version", label: "Version", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { current: "#22c55e", supported: "#3b82f6", deprecated: "#eab308", sunset: "#ef4444" } } },
        { field: "releaseDate", label: "Released", sortable: true, format: { type: "date" } },
        { field: "sunsetDate", label: "Sunset Date", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "changelog", label: "View Full Changelog", icon: "external-link" },
  rowActions: [
    { id: "viewDocs", label: "View Docs" },
    { id: "migrate", label: "Migration Guide" },
  ],
};
