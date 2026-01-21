import type { PageConfig } from "./types";

export const activityPageConfig: PageConfig = {
  id: "activity",
  title: "Activity",
  description: "Recent activity across your organization",

  source: {
    entity: "activities",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "today", label: "Today", field: "todayCount" },
      { id: "week", label: "This Week", field: "weekCount" },
      { id: "users", label: "Active Users", field: "activeUsers" },
      { id: "tasks", label: "Tasks Completed", field: "tasksCompleted" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search activity...",
      fields: ["user", "description", "action"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Task", value: "task" },
            { label: "Document", value: "document" },
            { label: "Comment", value: "comment" },
            { label: "Event", value: "event" },
            { label: "Team", value: "team" },
            { label: "Finance", value: "finance" },
            { label: "Asset", value: "asset" },
            { label: "Settings", value: "settings" },
          ],
        },
        {
          field: "timestamp",
          label: "Date Range",
          type: "dateRange",
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "timestamp", label: "Time" },
        { field: "user", label: "User" },
        { field: "type", label: "Type" },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list"],
    refresh: { enabled: true },
  },

  views: {
    list: {
      titleField: "user",
      subtitleField: "description",
      badgeField: "type",
      metaFields: ["timestamp"],
    },
  },

  primaryAction: {
    id: "refresh",
    label: "Refresh",
    icon: "refresh",
    variant: "outline",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "go-to", label: "Go to Item" },
  ],
};
