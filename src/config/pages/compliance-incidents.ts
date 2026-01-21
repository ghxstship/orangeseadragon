import type { PageConfig } from "./types";

export const complianceIncidentsPageConfig: PageConfig = {
  id: "compliance-incidents",
  title: "Incidents",
  description: "Incident reports and tracking",

  source: {
    entity: "complianceIncidents",
    defaultSorts: [{ field: "reportedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Incidents", field: "totalCount" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search incidents...",
      fields: ["title"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Reported", value: "reported" },
            { label: "Investigating", value: "investigating" },
            { label: "Resolved", value: "resolved" },
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
        { field: "title", label: "Title", sortable: true },
        {
          field: "severity",
          label: "Severity",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              low: "#6b7280",
              medium: "#eab308",
              high: "#ef4444",
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
              reported: "#3b82f6",
              investigating: "#eab308",
              resolved: "#22c55e",
            },
          },
        },
        { field: "reportedAt", label: "Reported", sortable: true, format: { type: "date" } },
        { field: "resolvedAt", label: "Resolved", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "report-incident", label: "Report Incident", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "update-status", label: "Update Status" },
    { id: "add-notes", label: "Add Notes" },
  ],
};
