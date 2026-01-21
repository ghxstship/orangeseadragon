import type { PageConfig } from "./types";

export const notificationsPageConfig: PageConfig = {
  id: "notifications",
  title: "Notifications",
  description: "Your notifications and alerts",

  source: {
    entity: "notifications",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "unread", label: "Unread", field: "unreadCount" },
      { id: "today", label: "Today", field: "todayCount" },
      { id: "total", label: "This Week", field: "count" },
      { id: "warnings", label: "Warnings", field: "warningCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search notifications...",
      fields: ["title", "message"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Info", value: "info" },
            { label: "Success", value: "success" },
            { label: "Warning", value: "warning" },
            { label: "Error", value: "error" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Task", value: "task" },
            { label: "Event", value: "event" },
            { label: "Message", value: "message" },
            { label: "Document", value: "document" },
            { label: "Team", value: "team" },
            { label: "Finance", value: "finance" },
            { label: "System", value: "system" },
          ],
        },
        {
          field: "read",
          label: "Status",
          type: "select",
          options: [
            { label: "Unread", value: "false" },
            { label: "Read", value: "true" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "message", label: "Message", sortable: false },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { info: "#3b82f6", success: "#22c55e", warning: "#eab308", error: "#ef4444" } } },
        { field: "category", label: "Category", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "datetime" } },
        { field: "read", label: "Read", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 20,
      selectable: true,
    },
  },

  primaryAction: { id: "markAllRead", label: "Mark All Read", icon: "check" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "markRead", label: "Mark as Read" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
