import type { PageConfig } from "./types";

export const emailTemplatesPageConfig: PageConfig = {
  id: "email-templates",
  title: "Email Templates",
  description: "Manage email templates for communications",

  source: {
    entity: "email-templates",
    defaultSorts: [{ field: "last_modified", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Templates", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "sent", label: "Total Sent", field: "totalSent" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search templates...",
      fields: ["name", "subject"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Transactional", value: "transactional" },
            { label: "Marketing", value: "marketing" },
            { label: "Notification", value: "notification" },
            { label: "Reminder", value: "reminder" },
          ],
        },
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
      ],
    },
    viewTypes: ["list", "table", "grid"],
  },

  views: {
    list: {
      titleField: "name",
      subtitleField: "subject",
      badgeField: "status",
      metaFields: ["category", "usage_count"],
    },
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "subject", label: "Subject", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", draft: "#6b7280", archived: "#ef4444" } } },
        { field: "usage_count", label: "Sent", sortable: true, align: "right", format: { type: "number" } },
        { field: "last_modified", label: "Modified", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
    grid: {
      titleField: "name",
      subtitleField: "subject",
      badgeField: "status",
      cardFields: ["category", "usage_count"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Template",
    icon: "plus",
  },

  rowActions: [
    { id: "preview", label: "Preview" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "send-test", label: "Send Test" },
    { id: "archive", label: "Archive" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
