import type { DashboardPageConfig } from "./dashboard-types";

export const dashboardPageConfig: DashboardPageConfig = {
  id: "dashboard",
  title: "Dashboard",
  description: "Welcome back! Here's what's happening across your organization.",

  widgets: [
    { type: "stat", id: "activeTasks", title: "Active Tasks", field: "activeTasks" },
    { type: "stat", id: "upcomingEvents", title: "Upcoming Events", field: "upcomingEvents" },
    { type: "stat", id: "teamMembers", title: "Team Members", field: "teamMembers" },
    { type: "stat", id: "assetsCheckedOut", title: "Assets Checked Out", field: "assetsCheckedOut" },
    {
      type: "activity",
      id: "recentActivity",
      title: "Recent Activity",
      dataSource: "recentActivity",
      actionField: "action",
      descriptionField: "description",
      userField: "user",
      timeField: "time",
      limit: 5,
    },
    {
      type: "list",
      id: "upcomingTasks",
      title: "Upcoming Tasks",
      dataSource: "upcomingTasks",
      titleField: "title",
      subtitleField: "project",
      badgeField: "priority",
      metaField: "dueDate",
      limit: 5,
    },
    {
      type: "alerts",
      id: "alerts",
      title: "Alerts",
      dataSource: "alerts",
      messageField: "message",
      severityField: "severity",
      limit: 3,
    },
    {
      type: "quick-actions",
      id: "quickActions",
      title: "Quick Actions",
      actions: [
        { id: "new-task", label: "New Task", icon: "check-square", action: "create-task" },
        { id: "schedule", label: "Schedule", icon: "calendar", action: "open-calendar" },
        { id: "crew-call", label: "Crew Call", icon: "users", action: "create-crew-call" },
        { id: "check-out", label: "Check Out", icon: "package", action: "check-out-asset" },
      ],
      columns: 2,
    },
    {
      type: "progress",
      id: "thisWeek",
      title: "This Week",
      items: [
        { label: "Tasks Completed", valueField: "tasksCompleted", maxField: "totalTasks" },
        { label: "Hours Logged", valueField: "hoursLogged", max: 200 },
        { label: "Revenue", valueField: "revenue", format: "currency" },
        { label: "Expenses", valueField: "expenses", format: "currency" },
      ],
    },
  ],

  layout: {
    columns: 3,
  },
};
