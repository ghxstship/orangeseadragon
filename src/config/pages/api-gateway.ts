import type { PageConfig } from "./types";

export const apiGatewayPageConfig: PageConfig = {
  id: "api-gateway",
  title: "API Gateway",
  description: "Manage API routing, rate limiting, and security",

  source: {
    entity: "apiEndpoints",
    defaultSorts: [{ field: "requests", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "requests", label: "Requests (24h)", field: "totalRequests" },
      { id: "latency", label: "Avg Latency", field: "avgLatency" },
      { id: "errorRate", label: "Error Rate", field: "avgErrorRate" },
      { id: "endpoints", label: "Endpoints", field: "count" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search endpoints...",
      fields: ["path", "method"],
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
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "method", label: "Method", sortable: true, format: { type: "badge", colorMap: { GET: "#22c55e", POST: "#3b82f6", PUT: "#eab308", DELETE: "#ef4444", PATCH: "#a855f7" } } },
        { field: "path", label: "Path", sortable: true },
        { field: "requests", label: "Requests", sortable: true, align: "right" },
        { field: "avgLatency", label: "Latency (ms)", sortable: true, align: "right" },
        { field: "errorRate", label: "Error Rate", sortable: true, align: "right" },
        { field: "rateLimit", label: "Rate Limit", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: undefined,
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "configure", label: "Configure" },
  ],
};
