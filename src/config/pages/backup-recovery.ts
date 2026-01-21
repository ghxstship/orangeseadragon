import type { PageConfig } from "./types";

export const backupRecoveryPageConfig: PageConfig = {
  id: "backup-recovery",
  title: "Backup & Recovery",
  description: "Manage data backups and recovery points",

  source: {
    entity: "backups",
    defaultSorts: [{ field: "createdAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Backups", field: "count" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "totalSize", label: "Total Size", field: "totalSize" },
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
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { full: "#a855f7", incremental: "#3b82f6", differential: "#f97316" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { completed: "#22c55e", in_progress: "#3b82f6", failed: "#ef4444" } } },
        { field: "size", label: "Size", sortable: true },
        { field: "createdAt", label: "Created", sortable: true, format: { type: "datetime" } },
        { field: "duration", label: "Duration", sortable: true },
        { field: "retention", label: "Retention", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "Create Backup", icon: "hard-drive" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "restore", label: "Restore" },
    { id: "download", label: "Download" },
    { id: "verify", label: "Verify Integrity" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
