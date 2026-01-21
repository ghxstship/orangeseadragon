import type { PageConfig } from "./types";

export const rolesPageConfig: PageConfig = {
  id: "roles",
  title: "Roles",
  description: "Manage organization roles",
  source: { entity: "roles", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Roles", field: "count" },
      { id: "system", label: "System Roles", field: "systemCount" },
      { id: "custom", label: "Custom Roles", field: "customCount" },
      { id: "members", label: "Total Members", field: "memberCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search roles...", fields: ["name", "description"] },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "members", label: "Members", sortable: true, align: "right" },
        { field: "isSystem", label: "Type", sortable: true, format: { type: "badge" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  primaryAction: { id: "create", label: "Create Role", icon: "plus" },
  rowActions: [{ id: "permissions", label: "Edit Permissions" }, { id: "members", label: "View Members" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
