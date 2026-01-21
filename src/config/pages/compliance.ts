import type { PageConfig } from "./types";

export const compliancePageConfig: PageConfig = {
  id: "compliance",
  title: "Compliance",
  description: "Regulatory compliance and audit management",

  source: {
    entity: "complianceFrameworks",
    defaultSorts: [{ field: "nextAudit", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "frameworks", label: "Frameworks", field: "count" },
      { id: "compliant", label: "Fully Compliant", field: "compliantCount" },
      { id: "avgScore", label: "Average Score", field: "avgScore" },
      { id: "controls", label: "Controls Passed", field: "controlsRatio" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search frameworks...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Compliant", value: "compliant" },
            { label: "Partial", value: "partial" },
            { label: "Non-Compliant", value: "non_compliant" },
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
        { field: "name", label: "Framework", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { compliant: "#22c55e", partial: "#eab308", non_compliant: "#ef4444" } } },
        { field: "score", label: "Score", sortable: true, align: "right" },
        { field: "lastAudit", label: "Last Audit", sortable: true, format: { type: "date" } },
        { field: "nextAudit", label: "Next Audit", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "report", label: "Generate Report", icon: "file-text" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "download", label: "Download Report" },
    { id: "scheduleAudit", label: "Schedule Audit" },
  ],
};
