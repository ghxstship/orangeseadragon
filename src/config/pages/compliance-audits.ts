import type { PageConfig } from "./types";

export const complianceAuditsPageConfig: PageConfig = {
  id: "compliance-audits",
  title: "Audits",
  description: "Compliance audits and inspections",

  source: {
    entity: "complianceAudits",
    defaultSorts: [{ field: "scheduled_date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Audits", field: "totalCount" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search audits...",
      fields: ["name", "type", "auditor"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
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
        { field: "type", label: "Type", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              scheduled: "#3b82f6",
              in_progress: "#eab308",
              completed: "#22c55e",
            },
          },
        },
        { field: "scheduled_date", label: "Scheduled Date", sortable: true, format: { type: "date" } },
        { field: "auditor", label: "Auditor", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "schedule-audit", label: "Schedule Audit", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "report", label: "View Report" },
  ],
};
