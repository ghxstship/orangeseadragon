import type { PageConfig } from "./types";

export const eventsPageConfig: PageConfig = {
  id: "events",
  title: "Events",
  description: "Manage your events and productions",

  source: {
    entity: "events",
    defaultSorts: [{ field: "startDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Events", field: "count" },
      { id: "upcoming", label: "Upcoming", field: "upcomingCount" },
      { id: "active", label: "Active Now", field: "activeCount" },
      { id: "capacity", label: "Total Capacity", field: "totalCapacity" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search events...",
      fields: ["name", "venue", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "phase",
          label: "Phase",
          type: "select",
          options: [
            { label: "Concept", value: "concept" },
            { label: "Planning", value: "planning" },
            { label: "Pre-Production", value: "pre_production" },
            { label: "Setup", value: "setup" },
            { label: "Active", value: "active" },
            { label: "Live", value: "live" },
            { label: "Teardown", value: "teardown" },
            { label: "Post-Mortem", value: "post_mortem" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          field: "eventType",
          label: "Type",
          type: "select",
          options: [
            { label: "Festival", value: "festival" },
            { label: "Conference", value: "conference" },
            { label: "Concert", value: "concert" },
            { label: "Corporate", value: "corporate" },
            { label: "Wedding", value: "wedding" },
            { label: "Private", value: "private" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "eventType", label: "Type", sortable: true, format: { type: "badge" } },
        { field: "phase", label: "Phase", sortable: true, format: { type: "badge", colorMap: { concept: "#6b7280", planning: "#3b82f6", pre_production: "#eab308", setup: "#f97316", active: "#22c55e", live: "#ef4444", teardown: "#a855f7", post_mortem: "#6366f1", archived: "#9ca3af" } } },
        { field: "venue", label: "Venue", sortable: true },
        { field: "startDate", label: "Start", sortable: true, format: { type: "date" } },
        { field: "endDate", label: "End", sortable: true, format: { type: "date" } },
        { field: "capacity", label: "Capacity", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Event", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Event" },
    { id: "runsheet", label: "Manage Runsheet" },
    { id: "crew", label: "View Crew Calls" },
    { id: "duplicate", label: "Duplicate" },
    { id: "cancel", label: "Cancel Event", variant: "destructive" },
  ],
};
