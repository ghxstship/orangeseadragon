import type { PageConfig } from "./types";

export const archivesPageConfig: PageConfig = {
  id: "archives",
  title: "Archives",
  description: "Access archived events, projects, and documents",

  source: {
    entity: "archivedItems",
    defaultSorts: [{ field: "archivedDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Archived", field: "count" },
      { id: "events", label: "Events", field: "eventCount" },
      { id: "documents", label: "Documents", field: "documentCount" },
      { id: "storage", label: "Storage Used", field: "storageUsed" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search archives...",
      fields: ["name", "originalLocation", "archivedBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Event", value: "event" },
            { label: "Project", value: "project" },
            { label: "Document", value: "document" },
            { label: "Contract", value: "contract" },
            { label: "Report", value: "report" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { event: "#a855f7", project: "#3b82f6", document: "#22c55e", contract: "#f97316", report: "#ec4899" } } },
        { field: "originalLocation", label: "Location", sortable: true },
        { field: "archivedDate", label: "Archived", sortable: true, format: { type: "date" } },
        { field: "size", label: "Size", sortable: true },
        { field: "retentionPeriod", label: "Retention", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: undefined,
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "download", label: "Download" },
    { id: "restore", label: "Restore" },
    { id: "auditLog", label: "View Audit Log" },
    { id: "delete", label: "Delete Permanently", variant: "destructive" },
  ],
};
