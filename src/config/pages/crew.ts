import type { PageConfig } from "./types";

export const crewPageConfig: PageConfig = {
  id: "crew",
  title: "Crew Calls",
  description: "Manage crew scheduling and assignments",

  source: {
    entity: "crew-calls",
    defaultSorts: [{ field: "date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Crew Calls", field: "count" },
      { id: "upcoming", label: "Upcoming", field: "upcomingCount" },
      { id: "positions", label: "Positions Needed", field: "positionsNeeded" },
      { id: "fillRate", label: "Fill Rate", field: "fillRate", format: "percentage" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search crew calls...",
      fields: ["eventName", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "eventName", label: "Event", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "callTime", label: "Call Time" },
        { field: "location", label: "Location" },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "positionsFilled", label: "Filled", align: "right" },
        { field: "positionsNeeded", label: "Needed", align: "right" },
      ],
    },
    list: {
      titleField: "eventName",
      subtitleField: "location",
      badgeField: "status",
      metaFields: ["date", "callTime", "positionsFilled", "positionsNeeded"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Crew Call",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Crew Call" },
    { id: "notify", label: "Send Notifications" },
    { id: "duplicate", label: "Duplicate" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
