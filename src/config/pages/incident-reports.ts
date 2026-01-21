import type { PageConfig } from "./types";

export const incidentReportsPageConfig: PageConfig = {
  id: "incident-reports",
  title: "Incident Reports",
  description: "Document and track event incidents",

  source: {
    entity: "incident-reports",
    defaultSorts: [{ field: "incidentDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Incidents", field: "count" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
      { id: "followup", label: "Requires Follow-up", field: "followUpCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search incidents...",
      fields: ["title", "description", "eventName", "location"],
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
            { label: "Major", value: "major" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Safety", value: "safety" },
            { label: "Security", value: "security" },
            { label: "Medical", value: "medical" },
            { label: "Property", value: "property" },
            { label: "Weather", value: "weather" },
            { label: "Other", value: "other" },
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
            { label: "Closed", value: "closed" },
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
        { field: "title", label: "Title", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "severity", label: "Severity", sortable: true, format: { type: "badge", colorMap: { minor: "#22c55e", moderate: "#eab308", major: "#f97316", critical: "#ef4444" } } },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { reported: "#eab308", investigating: "#3b82f6", resolved: "#22c55e", closed: "#6b7280" } } },
        { field: "location", label: "Location", sortable: true },
        { field: "incidentDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "reportedBy", label: "Reported By", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Report Incident", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Full Report" },
    { id: "edit", label: "Edit Report" },
    { id: "notes", label: "Add Notes" },
    { id: "download", label: "Download PDF" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
