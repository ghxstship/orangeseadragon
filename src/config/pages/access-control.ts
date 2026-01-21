import type { PageConfig } from "./types";

export const accessControlPageConfig: PageConfig = {
  id: "access-control",
  title: "Access Control",
  description: "Monitor and manage access points",

  source: {
    entity: "access_points",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Access Points", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "scans", label: "Scans Today", field: "totalScans" },
      { id: "denied", label: "Denied Today", field: "totalDenied" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search access points...",
      fields: ["name", "location", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Entry", value: "entry" },
            { label: "Exit", value: "exit" },
            { label: "Checkpoint", value: "checkpoint" },
            { label: "Restricted", value: "restricted" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Alert", value: "alert" },
          ],
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "name", label: "Name" },
        { field: "location", label: "Location" },
        { field: "scansToday", label: "Scans Today" },
        { field: "deniedToday", label: "Denied Today" },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "table"],
    refresh: { enabled: true },
  },

  views: {
    grid: {
      titleField: "name",
      subtitleField: "location",
      badgeField: "status",
      cardFields: ["type", "scansToday", "deniedToday"],
      columns: 3,
    },
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { entry: "#22c55e", exit: "#3b82f6", checkpoint: "#a855f7", restricted: "#ef4444" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", inactive: "#6b7280", alert: "#ef4444" } } },
        { field: "scansToday", label: "Scans Today", sortable: true, align: "right", format: { type: "number" } },
        { field: "deniedToday", label: "Denied Today", sortable: true, align: "right", format: { type: "number" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
      selectable: true,
    },
  },

  primaryAction: {
    id: "create",
    label: "Add Access Point",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "scan-log", label: "View Scan Log" },
    { id: "permissions", label: "Edit Permissions" },
    { id: "toggle-status", label: "Toggle Status" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
