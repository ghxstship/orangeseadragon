import type { PageConfig } from "./types";

export const tasksWatchingPageConfig: PageConfig = {
  id: "tasks-watching",
  title: "Watching",
  description: "Tasks you are following for updates",

  source: {
    entity: "tasks-watching",
    defaultSorts: [{ field: "lastUpdate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "watching", label: "Watching", field: "count" },
      { id: "updated", label: "Updated Today", field: "updatedToday" },
      { id: "completed", label: "Completed", field: "completedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search watched tasks...",
      fields: ["title", "assignee", "project"],
    },
    filters: {
      enabled: false,
      fields: [],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Task", sortable: true },
        { field: "assignee", label: "Assignee" },
        { field: "project", label: "Project" },
        { field: "dueDate", label: "Due Date", sortable: true },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "lastUpdate", label: "Last Update" },
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "assignee",
      badgeField: "status",
      metaFields: ["project", "dueDate", "lastUpdate"],
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "activity", label: "View Activity" },
    { id: "unwatch", label: "Unwatch", variant: "destructive" },
  ],
};
