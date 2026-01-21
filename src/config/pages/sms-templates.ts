import type { PageConfig } from "./types";

export const smsTemplatesPageConfig: PageConfig = {
  id: "sms-templates",
  title: "SMS Templates",
  description: "Manage SMS templates for notifications",

  source: {
    entity: "smsTemplates",
    defaultSorts: [{ field: "lastModified", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Templates", field: "totalTemplates" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "sent", label: "Total Sent", field: "totalSent" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search templates...",
      fields: ["name", "message"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Alert", value: "alert" },
            { label: "Reminder", value: "reminder" },
            { label: "Notification", value: "notification" },
            { label: "Marketing", value: "marketing" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "message", label: "Message", sortable: false },
        {
          field: "category",
          label: "Category",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              alert: "#ef4444",
              reminder: "#f97316",
              notification: "#3b82f6",
              marketing: "#22c55e",
            },
          },
        },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              draft: "#6b7280",
              archived: "#ef4444",
            },
          },
        },
        { field: "characterCount", label: "Characters", sortable: true },
        { field: "usageCount", label: "Sent", sortable: true, format: { type: "number" } },
        { field: "lastModified", label: "Modified", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create-template", label: "Create Template", icon: "plus" },
  rowActions: [
    { id: "preview", label: "Preview" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "send-test", label: "Send Test" },
    { id: "archive", label: "Archive" },
    { id: "delete", label: "Delete" },
  ],
};
