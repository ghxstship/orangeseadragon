import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const projectsSettingsConfig: SettingsLayoutConfig = {
  title: "Projects Settings",
  description: "Configure project management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic project settings",
      icon: "settings",
    },
    {
      key: "workflow",
      title: "Workflow",
      description: "Task workflow",
      icon: "git-branch",
    },
    {
      key: "sprints",
      title: "Sprints",
      description: "Sprint configuration",
      icon: "zap",
    },
    {
      key: "teams",
      title: "Teams",
      description: "Team settings",
      icon: "users",
    },
    {
      key: "notifications",
      title: "Notifications",
      description: "Project notifications",
      icon: "bell",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const projectsSettingsDefaults = {
  general: {
    projectPrefix: "PRJ",
    defaultProjectType: "standard",
    enableProjectTemplates: true,
  },
  workflow: {
    taskStatuses: ["todo", "in_progress", "review", "done"],
    defaultStatus: "todo",
    enableSubtasks: true,
    maxSubtaskDepth: 2,
  },
  sprints: {
    defaultSprintDuration: 14,
    enableSprintPlanning: true,
    enableVelocityTracking: true,
    autoCloseSprints: false,
  },
  teams: {
    enableTeamCapacity: true,
    defaultWorkHoursPerDay: 8,
    enableResourceAllocation: true,
  },
  notifications: {
    notifyOnAssignment: true,
    notifyOnDueDate: true,
    dueDateReminderDays: 1,
    notifyOnStatusChange: true,
  },
};
