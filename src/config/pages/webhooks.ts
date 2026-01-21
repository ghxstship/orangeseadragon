import type { PageConfig } from "./types";

export const webhooksPageConfig: PageConfig = {
  id: "webhooks",
  title: "Webhooks",
  description: "Manage webhook endpoints",
  source: { entity: "webhooks", defaultSorts: [{ field: "url", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Webhooks", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "events", label: "Event Types", field: "eventCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search webhooks...", fields: ["url"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] }] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "url", label: "URL", sortable: true },
        { field: "events", label: "Events", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", inactive: "#6b7280" } } },
        { field: "lastTriggered", label: "Last Triggered", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  primaryAction: { id: "create", label: "Add Webhook", icon: "plus" },
  rowActions: [{ id: "edit", label: "Edit" }, { id: "test", label: "Test" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
