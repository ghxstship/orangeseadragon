import type { PageConfig } from "./types";

export const mentorshipPageConfig: PageConfig = {
  id: "mentorship",
  title: "Mentorship",
  description: "Connect with industry experts",

  source: {
    entity: "mentors",
    defaultSorts: [{ field: "rating", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Mentors", field: "count" },
      { id: "available", label: "Available Now", field: "availableCount" },
      { id: "sessions", label: "Total Sessions", field: "sessionCount" },
      { id: "avgRating", label: "Avg Rating", field: "avgRating" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search mentors...",
      fields: ["name", "title", "expertise", "bio"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "availability",
          label: "Availability",
          type: "select",
          options: [
            { label: "Available", value: "available" },
            { label: "Limited", value: "limited" },
            { label: "Unavailable", value: "unavailable" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "title", label: "Title", sortable: true },
        { field: "rating", label: "Rating", sortable: true },
        { field: "sessions", label: "Sessions", sortable: true },
        { field: "availability", label: "Availability", sortable: true, format: { type: "badge", colorMap: { available: "#22c55e", limited: "#eab308", unavailable: "#ef4444" } } },
        { field: "hourlyRate", label: "Rate", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "become", label: "Become a Mentor", icon: "users" },
  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "message", label: "Message" },
    { id: "book", label: "Book Session" },
  ],
};
