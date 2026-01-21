import type { PageConfig } from "./types";

export const encryptionPageConfig: PageConfig = {
  id: "encryption",
  title: "Encryption",
  description: "Manage encryption keys and security settings",

  source: {
    entity: "encryptionKeys",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "status", label: "Encryption Status", field: "encryptionStatus" },
      { id: "active", label: "Active Keys", field: "activeKeys" },
      { id: "algorithm", label: "Algorithm", field: "algorithm" },
      { id: "lastRotation", label: "Last Rotation", field: "lastRotation" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search keys...",
      fields: ["name", "type"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Rotating", value: "rotating" },
            { label: "Expired", value: "expired" },
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
        { field: "name", label: "Key Name", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "algorithm", label: "Algorithm", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", rotating: "#eab308", expired: "#ef4444" } } },
        { field: "createdAt", label: "Created", sortable: true, format: { type: "date" } },
        { field: "expiresAt", label: "Expires", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Key", icon: "plus" },
  rowActions: [
    { id: "rotate", label: "Rotate" },
    { id: "view", label: "View Details" },
    { id: "revoke", label: "Revoke", variant: "destructive" },
  ],
};
