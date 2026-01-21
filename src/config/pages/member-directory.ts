import type { PageConfig } from "./types";

export const memberDirectoryPageConfig: PageConfig = {
  id: "member-directory",
  title: "Member Directory",
  description: "View and manage workspace members",

  source: {
    entity: "members",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Members", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "admins", label: "Admins", field: "adminCount" },
      { id: "pending", label: "Pending Invites", field: "pendingCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search members...",
      fields: ["name", "email", "department"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "role",
          label: "Role",
          type: "select",
          options: [
            { label: "Owner", value: "owner" },
            { label: "Admin", value: "admin" },
            { label: "Member", value: "member" },
            { label: "Viewer", value: "viewer" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Invited", value: "invited" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "email", label: "Email", sortable: true },
        { field: "role", label: "Role", sortable: true, format: { type: "badge", colorMap: { owner: "#a855f7", admin: "#3b82f6", member: "#22c55e", viewer: "#6b7280" } } },
        { field: "department", label: "Department", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", invited: "#eab308", inactive: "#6b7280" } } },
        { field: "joinedAt", label: "Joined", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "invite", label: "Invite Member", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "message", label: "Send Message" },
    { id: "role", label: "Change Role" },
    { id: "resend", label: "Resend Invite" },
    { id: "remove", label: "Remove", variant: "destructive" },
  ],
};
