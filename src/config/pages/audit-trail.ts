import type { PageConfig } from "./types";

export const auditTrailPageConfig: PageConfig = {
  id: "audit-trail",
  title: "Audit Trail",
  description: "Track all system activities and changes",

  source: {
    entity: "auditEntries",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Today's Activities", field: "count" },
      { id: "creates", label: "Creates", field: "createCount" },
      { id: "updates", label: "Updates", field: "updateCount" },
      { id: "deletes", label: "Deletes", field: "deleteCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search audit log...",
      fields: ["user", "resource", "details"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "action",
          label: "Action",
          type: "select",
          options: [
            { label: "Create", value: "create" },
            { label: "Update", value: "update" },
            { label: "Delete", value: "delete" },
            { label: "View", value: "view" },
            { label: "Export", value: "export" },
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
        { field: "timestamp", label: "Time", sortable: true, format: { type: "datetime" } },
        { field: "user", label: "User", sortable: true },
        { field: "action", label: "Action", sortable: true, format: { type: "badge", colorMap: { create: "#22c55e", update: "#3b82f6", delete: "#ef4444", view: "#6b7280", export: "#a855f7" } } },
        { field: "resource", label: "Resource", sortable: true },
        { field: "resourceId", label: "Resource ID", sortable: true },
        { field: "details", label: "Details", sortable: false },
      ],
      defaultPageSize: 20,
      selectable: false,
    },
  },

  primaryAction: { id: "export", label: "Export Log", icon: "download" },
  rowActions: [
    { id: "view", label: "View Details" },
  ],
};
