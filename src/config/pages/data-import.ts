import type { PageConfig } from "./types";

export const dataImportPageConfig: PageConfig = {
  id: "data-import",
  title: "Data Import",
  description: "Import data from external sources",

  source: {
    entity: "importJobs",
    defaultSorts: [{ field: "created_at", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Imports", field: "totalImports" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "failed", label: "Failed", field: "failedCount" },
      { id: "records", label: "Records Imported", field: "totalRecords" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search imports...",
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
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Completed", value: "completed" },
            { label: "Processing", value: "processing" },
            { label: "Validating", value: "validating" },
            { label: "Failed", value: "failed" },
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
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { completed: "#22c55e", processing: "#3b82f6", validating: "#eab308", failed: "#ef4444" } } },
        { field: "created_at", label: "Created", sortable: true, format: { type: "date" } },
        { field: "records", label: "Records", sortable: true, format: { type: "number" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Import", icon: "upload" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "errors", label: "View Errors" },
    { id: "retry", label: "Retry" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
