import type { PageConfig } from "./types";

export const jobsPageConfig: PageConfig = {
  id: "jobs",
  title: "Jobs",
  description: "Job and gig management",

  source: {
    entity: "jobs",
    defaultSorts: [{ field: "date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Jobs", field: "count" },
      { id: "upcoming", label: "Upcoming", field: "upcomingCount" },
      { id: "crew", label: "Crew Needed", field: "crewRatio" },
      { id: "thisWeek", label: "This Week", field: "thisWeekCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search jobs...",
      fields: ["title", "client", "location", "type"],
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
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Conference", value: "Conference" },
            { label: "Festival", value: "Festival" },
            { label: "Wedding", value: "Wedding" },
            { label: "Corporate", value: "Corporate" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "client", label: "Client", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { upcoming: "#3b82f6", in_progress: "#eab308", completed: "#22c55e", cancelled: "#ef4444" } } },
        { field: "type", label: "Type", sortable: true },
        { field: "crewAssigned", label: "Crew", sortable: true },
        { field: "rate", label: "Rate", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Job", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "crew", label: "Manage Crew" },
    { id: "timesheets", label: "View Timesheets" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
