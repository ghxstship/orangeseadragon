import type { PageConfig } from "./types";

export const apiKeysPageConfig: PageConfig = {
  id: "api-keys",
  title: "API Keys",
  description: "Manage API access keys",
  source: { entity: "api_keys", defaultSorts: [{ field: "created", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Keys", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "inactive", label: "Inactive", field: "inactiveCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search keys...", fields: ["name"] },
    filters: {
      enabled: true,
      fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }],
    },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "key", label: "Key", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", inactive: "#6b7280" } } },
        { field: "created", label: "Created", sortable: true, format: { type: "date" } },
        { field: "lastUsed", label: "Last Used", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  primaryAction: { id: "create", label: "Create Key", icon: "plus" },
  rowActions: [{ id: "regenerate", label: "Regenerate" }, { id: "edit", label: "Edit" }, { id: "revoke", label: "Revoke", variant: "destructive" }],
};
