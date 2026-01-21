import type { PageConfig } from "./types";

export const apiReferencePageConfig: PageConfig = {
  id: "api-reference",
  title: "API Reference",
  description: "Complete API documentation and endpoint reference",

  source: {
    entity: "api_endpoints",
    defaultSorts: [{ field: "category", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "version", label: "API Version", field: "version" },
      { id: "endpoints", label: "Endpoints", field: "count" },
      { id: "rateLimit", label: "Rate Limit", field: "rateLimit" },
      { id: "uptime", label: "Uptime", field: "uptime" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search endpoints...",
      fields: ["name", "path", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "method",
          label: "Method",
          type: "select",
          options: [
            { label: "GET", value: "GET" },
            { label: "POST", value: "POST" },
            { label: "PUT", value: "PUT" },
            { label: "DELETE", value: "DELETE" },
            { label: "PATCH", value: "PATCH" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Events", value: "Events" },
            { label: "Contacts", value: "Contacts" },
            { label: "Webhooks", value: "Webhooks" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table"],
  },

  views: {
    table: {
      columns: [
        { field: "method", label: "Method", sortable: true, width: 100, format: { type: "badge", colorMap: { GET: "#22c55e", POST: "#3b82f6", PUT: "#eab308", DELETE: "#ef4444", PATCH: "#a855f7" } } },
        { field: "path", label: "Path", sortable: true },
        { field: "name", label: "Name", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
      ],
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50],
      selectable: false,
    },
  },

  primaryAction: {
    id: "docs",
    label: "View Full Docs",
    icon: "external",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "try", label: "Try It" },
    { id: "copy", label: "Copy Path" },
  ],
};
