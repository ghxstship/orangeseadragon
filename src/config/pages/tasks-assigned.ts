import type { PageConfig } from "./types";

export const tasksAssignedPageConfig: PageConfig = {
  id: "tasks-assigned",
  title: "Assigned Tasks",
  description: "Tasks you have assigned to others",

  source: {
    entity: "tasks-assigned",
    defaultSorts: [{ field: "dueDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Assigned", field: "count" },
      { id: "inProgress", label: "In Progress", field: "inProgressCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "overdue", label: "Overdue", field: "overdueCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search assigned tasks...",
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
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "assignee",
      badgeField: "status",
      metaFields: ["project", "dueDate"],
    },
  },

  primaryAction: {
    id: "assign",
    label: "Assign Task",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "reassign", label: "Reassign" },
    { id: "remind", label: "Send Reminder" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
