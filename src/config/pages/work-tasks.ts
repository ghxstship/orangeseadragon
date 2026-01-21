import type { BoardPageConfig } from "./board-types";

export const workTasksPageConfig: BoardPageConfig = {
  id: "work-tasks",
  title: "Tasks",
  description: "Manage tasks across all your projects",
  statusField: "status",

  columns: [
    { id: "backlog", title: "Backlog", statusValue: "backlog", color: "#6b7280" },
    { id: "todo", title: "To Do", statusValue: "todo", color: "#3b82f6" },
    { id: "in_progress", title: "In Progress", statusValue: "in_progress", color: "#eab308" },
    { id: "in_review", title: "In Review", statusValue: "in_review", color: "#a855f7" },
    { id: "blocked", title: "Blocked", statusValue: "blocked", color: "#ef4444" },
    { id: "done", title: "Done", statusValue: "done", color: "#22c55e" },
  ],

  card: {
    titleField: "title",
    subtitleField: "projectName",
    priorityField: "priority",
    metaFields: ["dueDate"],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search tasks...",
      fields: ["title", "projectName"],
    },
    filters: [
      {
        field: "priority",
        label: "Priority",
        options: [
          { label: "Urgent", value: "urgent" },
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
    ],
  },

  actions: {
    create: { label: "New Task", enabled: true },
    dragDrop: { enabled: true, crossColumn: true },
    quickAdd: { enabled: true },
  },

  primaryAction: {
    id: "create",
    label: "New Task",
    icon: "plus",
  },

  cardActions: [
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "move", label: "Move to project" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
