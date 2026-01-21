import type { PageConfig } from "./types";

export const reportsExportsPageConfig: PageConfig = {
  id: "reports-exports",
  title: "Exports",
  description: "Downloaded report exports",

  source: {
    entity: "reportsExports",
    defaultSorts: [{ field: "exported_at", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Exports", field: "totalCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search exports...",
      fields: ["name", "exported_by"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "format",
          label: "Format",
          type: "select",
          options: [
            { label: "PDF", value: "pdf" },
            { label: "CSV", value: "csv" },
            { label: "Excel", value: "xlsx" },
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
        { field: "size", label: "Size", sortable: true },
        { field: "exported_at", label: "Exported", sortable: true, format: { type: "date" } },
        { field: "exported_by", label: "Exported By", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "download", label: "Download" },
    { id: "share", label: "Share" },
    { id: "delete", label: "Delete" },
  ],
};
