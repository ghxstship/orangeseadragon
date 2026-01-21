import type { PageConfig } from "./types";

export const webinarsPageConfig: PageConfig = {
  id: "webinars",
  title: "Webinars",
  description: "Live sessions and recorded training",

  source: {
    entity: "webinars",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Webinars", field: "totalCount" },
      { id: "live", label: "Live Now", field: "liveCount" },
      { id: "upcoming", label: "Upcoming", field: "upcomingCount" },
      { id: "recorded", label: "Recorded", field: "recordedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search webinars...",
      fields: ["title", "description", "presenter", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Upcoming", value: "upcoming" },
            { label: "Live Now", value: "live" },
            { label: "Recorded", value: "recorded" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Product Updates", value: "Product Updates" },
            { label: "Training", value: "Training" },
            { label: "Best Practices", value: "Best Practices" },
            { label: "Developer", value: "Developer" },
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
        { field: "title", label: "Title", sortable: true },
        { field: "presenter", label: "Presenter", sortable: true },
        { field: "category", label: "Category", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              upcoming: "#3b82f6",
              live: "#ef4444",
              recorded: "#6b7280",
            },
          },
        },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "time", label: "Time", sortable: false },
        { field: "duration", label: "Duration (min)", sortable: true },
        { field: "attendees", label: "Attendees", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "join", label: "Join Now" },
    { id: "register", label: "Register" },
    { id: "watch", label: "Watch" },
    { id: "details", label: "View Details" },
  ],
};
