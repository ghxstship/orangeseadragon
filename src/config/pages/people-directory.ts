import type { PageConfig } from "./types";

export const peopleDirectoryPageConfig: PageConfig = {
  id: "people-directory",
  title: "Directory",
  description: "Team member directory",

  source: {
    entity: "peopleDirectory",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total People", field: "totalCount" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "away", label: "Away", field: "awayCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search people...",
      fields: ["name", "email", "role", "department"],
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
            { label: "Away", value: "away" },
            { label: "Inactive", value: "inactive" },
          ],
        },
        {
          field: "department",
          label: "Department",
          type: "select",
          options: [
            { label: "Engineering", value: "engineering" },
            { label: "Design", value: "design" },
            { label: "Marketing", value: "marketing" },
            { label: "Operations", value: "operations" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "email", label: "Email", sortable: true },
        { field: "phone", label: "Phone", sortable: true },
        { field: "role", label: "Role", sortable: true },
        { field: "department", label: "Department", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              away: "#eab308",
              inactive: "#6b7280",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-person", label: "Add Person", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "message", label: "Send Message" },
    { id: "edit", label: "Edit" },
  ],
};
