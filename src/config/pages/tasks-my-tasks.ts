import type { PageConfig } from "./types";

export const tasksMyTasksPageConfig: PageConfig = {
  id: "tasks-my-tasks",
  title: "My Tasks",
  description: "Tasks assigned to you",

  source: {
    entity: "tasks",
    defaultSorts: [{ field: "dueDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Tasks", field: "count" },
      { id: "inProgress", label: "In Progress", field: "inProgressCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "highPriority", label: "High Priority", field: "highPriorityCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search tasks...",
      fields: ["title", "project"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "To Do", value: "todo" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
          ],
        },
        {
          field: "priority",
          label: "Priority",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Task", sortable: true },
        { field: "project", label: "Project" },
        { field: "dueDate", label: "Due Date", sortable: true },
        { field: "priority", label: "Priority", format: { type: "badge" } },
        { field: "status", label: "Status", format: { type: "badge" } },
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "project",
      badgeField: "priority",
      metaFields: ["dueDate", "status"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Task",
    icon: "plus",
  },

  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "change-priority", label: "Change Priority" },
    { id: "reassign", label: "Reassign" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
