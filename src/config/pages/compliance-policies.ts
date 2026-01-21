import type { PageConfig } from "./types";

export const compliancePoliciesPageConfig: PageConfig = {
  id: "compliance-policies",
  title: "Policies",
  description: "Compliance policies and procedures",

  source: {
    entity: "compliancePolicies",
    defaultSorts: [{ field: "last_updated", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Policies", field: "totalCount" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "review", label: "Due for Review", field: "reviewCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search policies...",
      fields: ["name"],
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
            { label: "Draft", value: "draft" },
            { label: "Archived", value: "archived" },
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
        { field: "version", label: "Version", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              draft: "#eab308",
              archived: "#6b7280",
            },
          },
        },
        { field: "last_updated", label: "Last Updated", sortable: true, format: { type: "date" } },
        { field: "next_review", label: "Next Review", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-policy", label: "Add Policy", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "download", label: "Download" },
  ],
};
