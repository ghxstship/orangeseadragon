import type { PageConfig } from "./types";

export const tasksCompletedPageConfig: PageConfig = {
  id: "tasks-completed",
  title: "Completed Tasks",
  description: "Tasks that have been finished",

  source: {
    entity: "tasks-completed",
    defaultSorts: [{ field: "completedDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "week", label: "Completed This Week", field: "weekCount" },
      { id: "month", label: "Completed This Month", field: "monthCount" },
      { id: "avgTime", label: "Avg Completion Time", field: "avgCompletionTime" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search completed tasks...",
      fields: ["title", "completedBy", "project"],
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
        { field: "completedBy", label: "Completed By" },
        { field: "project", label: "Project" },
        { field: "completedDate", label: "Completed", sortable: true },
        { field: "duration", label: "Duration" },
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "completedBy",
      metaFields: ["project", "completedDate", "duration"],
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "reopen", label: "Reopen" },
    { id: "duplicate", label: "Duplicate" },
  ],
};
