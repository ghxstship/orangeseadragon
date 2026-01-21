import type { PageConfig } from "./types";

export const accessGroupsPageConfig: PageConfig = {
  id: "access-groups",
  title: "Access Groups",
  description: "Manage permission groups and access levels",
  source: { entity: "access_groups", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Groups", field: "count" },
      { id: "system", label: "System Groups", field: "systemCount" },
      { id: "custom", label: "Custom Groups", field: "customCount" },
      { id: "members", label: "Total Members", field: "totalMembers" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search groups...", fields: ["name", "description"] },
    filters: { enabled: true, fields: [{ field: "type", label: "Type", type: "select", options: [{ label: "System", value: "system" }, { label: "Custom", value: "custom" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { system: "#3b82f6", custom: "#22c55e" } } },
        { field: "memberCount", label: "Members", sortable: true, align: "right" },
        { field: "permissions", label: "Permissions", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Create Group", icon: "plus" },
  rowActions: [{ id: "manage", label: "Manage" }, { id: "edit", label: "Edit Group" }, { id: "members", label: "View Members" }, { id: "permissions", label: "Edit Permissions" }, { id: "duplicate", label: "Duplicate" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
