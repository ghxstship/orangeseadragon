import type { PageConfig } from "./types";

export const messagesPageConfig: PageConfig = {
  id: "messages",
  title: "Messages",
  description: "Your inbox and conversations",

  source: {
    entity: "messages",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Messages", field: "count" },
      { id: "unread", label: "Unread", field: "unreadCount" },
      { id: "starred", label: "Starred", field: "starredCount" },
      { id: "attachments", label: "With Attachments", field: "attachmentCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search messages...",
      fields: ["subject", "sender", "preview"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "read",
          label: "Status",
          type: "select",
          options: [
            { label: "Unread", value: "false" },
            { label: "Read", value: "true" },
          ],
        },
        {
          field: "starred",
          label: "Starred",
          type: "select",
          options: [
            { label: "Starred", value: "true" },
            { label: "Not Starred", value: "false" },
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
        { field: "sender", label: "From", sortable: true },
        { field: "subject", label: "Subject", sortable: true },
        { field: "timestamp", label: "Date", sortable: true, format: { type: "datetime" } },
        { field: "read", label: "Status", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 20,
      selectable: true,
    },
  },

  primaryAction: { id: "compose", label: "Compose", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "reply", label: "Reply" },
    { id: "star", label: "Star" },
    { id: "archive", label: "Archive" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
