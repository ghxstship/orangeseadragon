import type { PageConfig } from "./types";

export const announcementsPageConfig: PageConfig = {
  id: "announcements",
  title: "Announcements",
  description: "Company-wide announcements and updates",

  source: {
    entity: "announcements",
    defaultSorts: [{ field: "publishedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total", field: "count" },
      { id: "pinned", label: "Pinned", field: "pinnedCount" },
      { id: "highPriority", label: "High Priority", field: "highPriorityCount" },
      { id: "views", label: "Total Views", field: "totalViews" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search announcements...",
      fields: ["title", "content", "author"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "priority",
          label: "Priority",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Normal", value: "normal" },
            { label: "Low", value: "low" },
          ],
        },
        {
          field: "pinned",
          label: "Pinned",
          type: "select",
          options: [
            { label: "Pinned", value: "true" },
            { label: "Not Pinned", value: "false" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "author", label: "Author", sortable: true },
        { field: "priority", label: "Priority", sortable: true, format: { type: "badge", colorMap: { high: "#ef4444", normal: "#3b82f6", low: "#6b7280" } } },
        { field: "audience", label: "Audience", sortable: true },
        { field: "publishedAt", label: "Published", sortable: true, format: { type: "date" } },
        { field: "views", label: "Views", sortable: true, align: "right" },
        { field: "pinned", label: "Pinned", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Announcement", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "pin", label: "Pin/Unpin" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
