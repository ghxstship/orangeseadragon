import type { PageConfig } from "./types";

export const dataExportPageConfig: PageConfig = {
  id: "data-export",
  title: "Data Export",
  description: "Export your data in various formats",

  source: {
    entity: "exportJobs",
    defaultSorts: [{ field: "created_at", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Exports", field: "totalExports" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "processing", label: "Processing", field: "processingCount" },
      { id: "queued", label: "Queued", field: "queuedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search exports...",
      fields: ["name", "data_type"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "format",
          label: "Format",
          type: "select",
          options: [
            { label: "CSV", value: "csv" },
            { label: "JSON", value: "json" },
            { label: "Excel", value: "xlsx" },
            { label: "PDF", value: "pdf" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Completed", value: "completed" },
            { label: "Processing", value: "processing" },
            { label: "Queued", value: "queued" },
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
        { field: "format", label: "Format", sortable: true },
        { field: "data_type", label: "Data Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { completed: "#22c55e", processing: "#3b82f6", queued: "#eab308" } } },
        { field: "created_at", label: "Created", sortable: true, format: { type: "date" } },
        { field: "size", label: "Size", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Export", icon: "download" },
  rowActions: [
    { id: "download", label: "Download" },
    { id: "view", label: "View Details" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
