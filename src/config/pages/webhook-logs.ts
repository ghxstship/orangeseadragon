import type { PageConfig } from "./types";

export const webhookLogsPageConfig: PageConfig = {
  id: "webhook-logs",
  title: "Webhook Logs",
  description: "Monitor webhook delivery and debug issues",

  source: {
    entity: "webhookLogs",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Webhooks", field: "totalCount" },
      { id: "success", label: "Successful", field: "successCount" },
      { id: "failed", label: "Failed", field: "failedCount" },
      { id: "rate", label: "Success Rate", field: "successRate" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search by event or endpoint...",
      fields: ["event", "endpoint"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Success", value: "success" },
            { label: "Failed", value: "failed" },
            { label: "Pending", value: "pending" },
            { label: "Retrying", value: "retrying" },
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
        { field: "event", label: "Event", sortable: true },
        { field: "endpoint", label: "Endpoint", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              success: "#22c55e",
              failed: "#ef4444",
              pending: "#eab308",
              retrying: "#f97316",
            },
          },
        },
        { field: "statusCode", label: "Code", sortable: true },
        { field: "duration", label: "Duration (ms)", sortable: true },
        { field: "attempts", label: "Attempts", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "payload", label: "View Payload" },
    { id: "response", label: "View Response" },
    { id: "retry", label: "Retry" },
  ],
};
