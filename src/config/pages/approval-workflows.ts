import type { PageConfig } from "./types";

export const approvalWorkflowsPageConfig: PageConfig = {
  id: "approval-workflows",
  title: "Approval Workflows",
  description: "Configure multi-step approval processes",

  source: {
    entity: "approvalWorkflows",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Workflows", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "pending", label: "Pending Approvals", field: "pendingCount" },
      { id: "entityTypes", label: "Entity Types", field: "entityTypeCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search workflows...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "entityType",
          label: "Entity Type",
          type: "select",
          options: [
            { label: "Expense", value: "expense" },
            { label: "Purchase Order", value: "purchase_order" },
            { label: "Contract", value: "contract" },
            { label: "Budget", value: "budget" },
            { label: "Event", value: "event" },
          ],
        },
        {
          field: "enabled",
          label: "Status",
          type: "select",
          options: [
            { label: "Enabled", value: "true" },
            { label: "Disabled", value: "false" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "entityType", label: "Entity Type", sortable: true, format: { type: "badge", colorMap: { expense: "#22c55e", purchase_order: "#3b82f6", contract: "#a855f7", budget: "#f97316", event: "#ec4899" } } },
        { field: "description", label: "Description", sortable: false },
        { field: "pendingCount", label: "Pending", sortable: true, align: "right" },
        { field: "enabled", label: "Status", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "Create Workflow", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Workflow" },
    { id: "viewPending", label: "View Pending" },
    { id: "viewHistory", label: "View History" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
