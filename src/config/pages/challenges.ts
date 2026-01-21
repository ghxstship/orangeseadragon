import type { PageConfig } from "./types";

export const challengesPageConfig: PageConfig = {
  id: "challenges",
  title: "Challenges",
  description: "Competitions and challenges",

  source: {
    entity: "challenges",
    defaultSorts: [{ field: "endDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Challenges", field: "totalChallenges" },
      { id: "active", label: "Active", field: "activeChallenges" },
      { id: "participants", label: "Total Participants", field: "totalParticipants" },
      { id: "entries", label: "Your Entries", field: "yourEntries" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search challenges...",
      fields: ["title", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Completed", value: "completed" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Design", value: "Design" },
            { label: "Sustainability", value: "Sustainability" },
            { label: "Technology", value: "Technology" },
            { label: "Community", value: "Community" },
          ],
        },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Challenge", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", upcoming: "#3b82f6", completed: "#6b7280" } } },
        { field: "participants", label: "Participants", sortable: true, format: { type: "number" } },
        { field: "prize", label: "Prize", sortable: true },
        { field: "endDate", label: "End Date", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "leaderboard", label: "View Leaderboard", icon: "trophy" },
  rowActions: [
    { id: "enter", label: "Enter Challenge" },
    { id: "view", label: "View Details" },
    { id: "results", label: "View Results" },
  ],
};
