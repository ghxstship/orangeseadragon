import type { PageConfig } from "./types";

export const availabilityPageConfig: PageConfig = {
  id: "availability",
  title: "Team Availability",
  description: "View and manage team member availability",

  source: {
    entity: "teamMembers",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Team Members", field: "count" },
      { id: "available", label: "Available Today", field: "availableCount" },
      { id: "partial", label: "Partial Availability", field: "partialCount" },
      { id: "unavailable", label: "Unavailable", field: "unavailableCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search team members...",
      fields: ["name", "role"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "role",
          label: "Role",
          type: "select",
          options: [
            { label: "Stage Manager", value: "Stage Manager" },
            { label: "Audio Engineer", value: "Audio Engineer" },
            { label: "Lighting Tech", value: "Lighting Tech" },
            { label: "Event Coordinator", value: "Event Coordinator" },
            { label: "AV Tech", value: "AV Tech" },
            { label: "Production Manager", value: "Production Manager" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "role", label: "Role", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "update", label: "Update My Availability", icon: "calendar" },
  rowActions: [
    { id: "view", label: "View Schedule" },
    { id: "edit", label: "Edit Availability" },
  ],
};
