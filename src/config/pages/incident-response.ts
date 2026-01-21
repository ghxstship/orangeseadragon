import type { PageConfig } from "./types";

export const incidentResponsePageConfig: PageConfig = {
  id: "incident-response",
  title: "Incident Response",
  description: "Track and manage security incidents",

  source: {
    entity: "incidents",
    defaultSorts: [{ field: "reportedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Incidents", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "resolved", label: "Resolved This Week", field: "resolvedCount" },
      { id: "avgTime", label: "Avg Resolution Time", field: "avgResolutionTime" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search incidents...",
      fields: ["title", "description", "assignee"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Open", value: "open" },
            { label: "Investigating", value: "investigating" },
            { label: "Contained", value: "contained" },
            { label: "Resolved", value: "resolved" },
          ],
        },
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "id", label: "ID" },
        { field: "title", label: "Title", sortable: true },
        { field: "severity", label: "Severity", format: { type: "badge" } },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "assignee", label: "Assignee" },
        { field: "reportedAt", label: "Reported", sortable: true, format: { type: "date" } },
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "description",
      badgeField: "severity",
      metaFields: ["status", "assignee", "reportedAt"],
    },
  },

  primaryAction: {
    id: "report",
    label: "Report Incident",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "update-status", label: "Update Status" },
    { id: "assign", label: "Assign" },
    { id: "add-note", label: "Add Note" },
    { id: "resolve", label: "Mark Resolved" },
  ],
};
