import type { PageConfig } from "./types";

export const peopleCertificationsPageConfig: PageConfig = {
  id: "people-certifications",
  title: "Certifications",
  description: "Team certifications and credentials",

  source: {
    entity: "peopleCertifications",
    defaultSorts: [{ field: "expires_at", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Certifications", field: "totalCount" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "expiring", label: "Expiring Soon", field: "expiringCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search...",
      fields: ["name", "certification", "issuer"],
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
            { label: "Expiring", value: "expiring" },
            { label: "Expired", value: "expired" },
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
        { field: "name", label: "Person", sortable: true },
        { field: "certification", label: "Certification", sortable: true },
        { field: "issuer", label: "Issuer", sortable: true },
        { field: "expires_at", label: "Expires", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              expiring: "#eab308",
              expired: "#ef4444",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-certification", label: "Add Certification", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "renew", label: "Renew" },
    { id: "remove", label: "Remove" },
  ],
};
