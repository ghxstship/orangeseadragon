import type { PageConfig } from "./types";

export const loginHistoryPageConfig: PageConfig = {
  id: "login-history",
  title: "Login History",
  description: "Track user login activity and security events",

  source: {
    entity: "loginRecords",
    defaultSorts: [{ field: "timestamp", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Logins", field: "totalLogins" },
      { id: "success", label: "Successful", field: "successCount" },
      { id: "failed", label: "Failed", field: "failedCount" },
      { id: "blocked", label: "Blocked", field: "blockedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search by user or IP...",
      fields: ["user", "email", "ip", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Success", value: "success" },
            { label: "Failed", value: "failed" },
            { label: "Blocked", value: "blocked" },
          ],
        },
        {
          field: "device",
          label: "Device",
          type: "select",
          options: [
            { label: "Desktop", value: "desktop" },
            { label: "Mobile", value: "mobile" },
            { label: "Tablet", value: "tablet" },
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
        { field: "user", label: "User", sortable: true },
        { field: "email", label: "Email", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { success: "#22c55e", failed: "#ef4444", blocked: "#eab308" } } },
        { field: "device", label: "Device", sortable: true },
        { field: "browser", label: "Browser", sortable: false },
        { field: "ip", label: "IP Address", sortable: false },
        { field: "location", label: "Location", sortable: true },
        { field: "timestamp", label: "Time", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "export", label: "Export", icon: "download" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "block-ip", label: "Block IP" },
    { id: "revoke", label: "Revoke Session" },
  ],
};
