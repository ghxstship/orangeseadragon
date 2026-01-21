import type { PageConfig } from "./types";

export const testimonialsPageConfig: PageConfig = {
  id: "testimonials",
  title: "Testimonials",
  description: "Customer testimonials and quotes",

  source: {
    entity: "testimonials",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total", field: "totalCount" },
      { id: "featured", label: "Featured", field: "featuredCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "avgRating", label: "Avg Rating", field: "avgRating" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search testimonials...",
      fields: ["quote", "author", "company"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "featured",
          label: "Featured",
          type: "select",
          options: [
            { label: "Featured", value: "true" },
            { label: "Not Featured", value: "false" },
          ],
        },
        {
          field: "approved",
          label: "Status",
          type: "select",
          options: [
            { label: "Approved", value: "true" },
            { label: "Pending", value: "false" },
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
        { field: "author", label: "Author", sortable: true },
        { field: "role", label: "Role", sortable: true },
        { field: "company", label: "Company", sortable: true },
        { field: "rating", label: "Rating", sortable: true },
        {
          field: "featured",
          label: "Featured",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              true: "#eab308",
              false: "#6b7280",
            },
          },
        },
        {
          field: "approved",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              true: "#22c55e",
              false: "#6b7280",
            },
          },
        },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-testimonial", label: "Add Testimonial", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "feature", label: "Toggle Featured" },
    { id: "approve", label: "Toggle Approval" },
    { id: "delete", label: "Delete" },
  ],
};
