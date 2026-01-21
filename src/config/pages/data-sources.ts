import type { PageConfig } from "./types";

export const dataSourcesPageConfig: PageConfig = {
  id: "data-sources",
  title: "Data Sources",
  description: "Manage external data connections",

  source: {
    entity: "dataSources",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Sources", field: "totalSources" },
      { id: "connected", label: "Connected", field: "connectedCount" },
      { id: "errors", label: "Errors", field: "errorCount" },
      { id: "records", label: "Total Records", field: "totalRecords" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search sources...",
      fields: ["name", "provider"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Database", value: "database" },
            { label: "API", value: "api" },
            { label: "File", value: "file" },
            { label: "Stream", value: "stream" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Connected", value: "connected" },
            { label: "Error", value: "error" },
            { label: "Syncing", value: "syncing" },
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
        { field: "provider", label: "Provider", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { connected: "#22c55e", error: "#ef4444", syncing: "#3b82f6" } } },
        { field: "records", label: "Records", sortable: true, format: { type: "number" } },
        { field: "lastSync", label: "Last Sync", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Source", icon: "plus" },
  rowActions: [
    { id: "sync", label: "Sync" },
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Connection" },
    { id: "logs", label: "View Logs" },
    { id: "test", label: "Test Connection" },
    { id: "disconnect", label: "Disconnect", variant: "destructive" },
  ],
};
