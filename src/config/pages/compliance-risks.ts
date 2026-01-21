import type { PageConfig } from "./types";

export const complianceRisksPageConfig: PageConfig = {
  id: "compliance-risks",
  title: "Risk Register",
  description: "Compliance risk management",

  source: {
    entity: "complianceRisks",
    defaultSorts: [{ field: "impact", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Risks", field: "totalCount" },
      { id: "high", label: "High Impact", field: "highImpactCount" },
      { id: "mitigated", label: "Mitigated", field: "mitigatedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search risks...",
      fields: ["name", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "impact",
          label: "Impact",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Identified", value: "identified" },
            { label: "Assessing", value: "assessing" },
            { label: "Mitigated", value: "mitigated" },
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
        { field: "category", label: "Category", sortable: true },
        {
          field: "likelihood",
          label: "Likelihood",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              high: "#ef4444",
              medium: "#eab308",
              low: "#6b7280",
            },
          },
        },
        {
          field: "impact",
          label: "Impact",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              high: "#ef4444",
              medium: "#eab308",
              low: "#6b7280",
            },
          },
        },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              identified: "#3b82f6",
              assessing: "#eab308",
              mitigated: "#22c55e",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-risk", label: "Add Risk", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "update-status", label: "Update Status" },
    { id: "add-mitigation", label: "Add Mitigation" },
  ],
};
