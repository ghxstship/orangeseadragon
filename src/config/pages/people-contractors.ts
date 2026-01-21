import type { PageConfig } from "./types";

export const peopleContractorsPageConfig: PageConfig = {
  id: "people-contractors",
  title: "Contractors",
  description: "External contractors and freelancers",

  source: {
    entity: "peopleContractors",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Contractors", field: "totalCount" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "inactive", label: "Inactive", field: "inactiveCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search contractors...",
      fields: ["name", "specialty", "email"],
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
            { label: "Inactive", value: "inactive" },
          ],
        },
        {
          field: "specialty",
          label: "Specialty",
          type: "select",
          options: [
            { label: "Audio", value: "audio" },
            { label: "Video", value: "video" },
            { label: "Lighting", value: "lighting" },
            { label: "Stage", value: "stage" },
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
        { field: "specialty", label: "Specialty", sortable: true },
        { field: "email", label: "Email", sortable: true },
        { field: "phone", label: "Phone", sortable: true },
        { field: "rate", label: "Rate", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              inactive: "#6b7280",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-contractor", label: "Add Contractor", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "book", label: "Book" },
    { id: "edit", label: "Edit" },
  ],
};
