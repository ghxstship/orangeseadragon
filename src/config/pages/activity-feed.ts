import type { PageConfig } from "./types";

export const activityFeedPageConfig: PageConfig = {
  id: "activity-feed",
  title: "Activity Feed",
  description: "Recent activity across your organization",

  source: {
    entity: "activityItems",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Today's Activity", field: "count" },
      { id: "events", label: "Events", field: "eventCount" },
      { id: "financial", label: "Financial", field: "financialCount" },
      { id: "users", label: "Active Users", field: "userCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search activity...",
      fields: ["description", "actor", "action"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Event", value: "event" },
            { label: "Contact", value: "contact" },
            { label: "Invoice", value: "invoice" },
            { label: "Vendor", value: "vendor" },
            { label: "Comment", value: "comment" },
            { label: "Notification", value: "notification" },
          ],
        },
        {
          field: "action",
          label: "Action",
          type: "select",
          options: [
            { label: "Created", value: "created" },
            { label: "Updated", value: "updated" },
            { label: "Deleted", value: "deleted" },
            { label: "Paid", value: "paid" },
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
        { field: "actor", label: "Actor", sortable: true },
        { field: "action", label: "Action", sortable: true, format: { type: "badge", colorMap: { created: "#22c55e", updated: "#3b82f6", deleted: "#ef4444", paid: "#10b981", added: "#a855f7", sent: "#6b7280" } } },
        { field: "description", label: "Description", sortable: false },
        { field: "type", label: "Type", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "datetime" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: undefined,
  rowActions: [
    { id: "view", label: "View Details" },
  ],
};
