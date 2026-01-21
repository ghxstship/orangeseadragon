import type { PageConfig } from "./types";

export const backupsPageConfig: PageConfig = {
  id: "backups",
  title: "Backups",
  description: "Manage system backups and recovery",

  source: {
    entity: "backups",
    defaultSorts: [{ field: "createdAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Backups", field: "count" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "totalSize", label: "Total Storage", field: "totalSize" },
      { id: "lastBackup", label: "Last Backup", field: "lastBackup" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search backups...",
      fields: ["name"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Full", value: "full" },
            { label: "Incremental", value: "incremental" },
            { label: "Differential", value: "differential" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Completed", value: "completed" },
            { label: "In Progress", value: "in_progress" },
            { label: "Failed", value: "failed" },
            { label: "Scheduled", value: "scheduled" },
          ],
        },
        {
          field: "location",
          label: "Location",
          type: "select",
          options: [
            { label: "Local", value: "local" },
            { label: "Cloud", value: "cloud" },
            { label: "Offsite", value: "offsite" },
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
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { full: "#3b82f6", incremental: "#22c55e", differential: "#a855f7" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { completed: "#22c55e", in_progress: "#3b82f6", failed: "#ef4444", scheduled: "#6b7280" } } },
        { field: "location", label: "Location", sortable: true, format: { type: "badge", colorMap: { local: "#6b7280", cloud: "#3b82f6", offsite: "#a855f7" } } },
        { field: "size", label: "Size", sortable: true },
        { field: "createdAt", label: "Created", sortable: true, format: { type: "datetime" } },
        { field: "retention", label: "Retention", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "Create Backup", icon: "database" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "download", label: "Download" },
    { id: "restore", label: "Restore" },
    { id: "verify", label: "Verify Integrity" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
