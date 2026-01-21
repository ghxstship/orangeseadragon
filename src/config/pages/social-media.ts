import type { PageConfig } from "./types";

export const socialMediaPageConfig: PageConfig = {
  id: "social-media",
  title: "Social Media",
  description: "Manage social media content and scheduling",

  source: {
    entity: "social-posts",
    defaultSorts: [{ field: "scheduledDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Posts", field: "count" },
      { id: "published", label: "Published", field: "publishedCount" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
      { id: "engagement", label: "Total Engagement", field: "totalEngagement" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search posts...",
      fields: ["content", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Scheduled", value: "scheduled" },
            { label: "Published", value: "published" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "content", label: "Content", sortable: true },
        { field: "eventName", label: "Event" },
        { field: "scheduledDate", label: "Date", sortable: true },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "mediaType", label: "Type" },
      ],
    },
    list: {
      titleField: "content",
      subtitleField: "eventName",
      badgeField: "status",
      metaFields: ["scheduledDate", "mediaType"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Post",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Post" },
    { id: "duplicate", label: "Duplicate" },
    { id: "schedule", label: "Schedule" },
    { id: "publish", label: "Publish Now" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
