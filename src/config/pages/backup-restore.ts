import type { PageConfig } from "./types";

export const backupRestorePageConfig: PageConfig = {
  id: "backup-restore",
  title: "Backup & Restore",
  source: {
    entity: "backups",
    defaultSorts: [{ field: "created_at", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Backups", field: "count" },
      { id: "storage", label: "Storage Used", field: "totalSize" },
      { id: "lastBackup", label: "Last Backup", field: "lastBackupDate" },
      { id: "status", label: "Status", field: "status" },
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
            { label: "Automatic", value: "automatic" },
            { label: "Manual", value: "manual" },
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
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", format: { type: "badge", colorMap: { automatic: "#3b82f6", manual: "#8b5cf6" } } },
        { field: "size", label: "Size", sortable: true },
        { field: "created_at", label: "Created", sortable: true, format: { type: "datetime" } },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { completed: "#22c55e", in_progress: "#3b82f6", failed: "#ef4444" } } },
        { field: "retention", label: "Retention" },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "name",
      subtitleField: "created_at",
      badgeField: "status",
      metaFields: ["type", "size", "retention"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Create Backup",
    icon: "database",
  },
  rowActions: [
    { id: "download", label: "Download" },
    { id: "restore", label: "Restore from Backup" },
    { id: "view", label: "View Details" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
