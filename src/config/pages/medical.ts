import type { PageConfig } from "./types";

export const medicalPageConfig: PageConfig = {
  id: "medical",
  title: "Medical",
  description: "Track medical incidents and responses",

  source: {
    entity: "medical",
    defaultSorts: [{ field: "reportedTime", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Incidents", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
      { id: "transported", label: "Transported", field: "transportedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search incidents...",
      fields: ["description", "location", "eventName", "responder"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Minor", value: "minor" },
            { label: "Moderate", value: "moderate" },
            { label: "Serious", value: "serious" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Treating", value: "treating" },
            { label: "Resolved", value: "resolved" },
            { label: "Transported", value: "transported" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "description", label: "Description", sortable: true },
        { field: "severity", label: "Severity", sortable: true, format: { type: "badge", colorMap: { minor: "#22c55e", moderate: "#eab308", serious: "#f97316", critical: "#ef4444" } } },
        { field: "location", label: "Location", sortable: true },
        { field: "reportedTime", label: "Time", sortable: true, format: { type: "datetime" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#ef4444", treating: "#3b82f6", resolved: "#22c55e", transported: "#a855f7" } } },
        { field: "responder", label: "Responder", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Report Incident", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "status", label: "Update Status" },
    { id: "notes", label: "Add Notes" },
    { id: "resolve", label: "Mark Resolved" },
    { id: "transport", label: "Transport Patient" },
    { id: "report", label: "Generate Report" },
  ],
};
