import type { PageConfig } from "./types";

export const costCentersPageConfig: PageConfig = {
  id: "cost-centers",
  title: "Cost Centers",
  description: "Manage departmental budgets and spending",

  source: {
    entity: "costCenters",
    defaultSorts: [{ field: "code", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "budget", label: "Total Budget", field: "totalBudget" },
      { id: "spent", label: "Spent / Committed", field: "spentCommitted" },
      { id: "available", label: "Available", field: "totalAvailable" },
      { id: "overBudget", label: "Over Budget", field: "overBudgetCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search cost centers...",
      fields: ["code", "name", "department", "manager"],
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
            { label: "Inactive", value: "inactive" },
            { label: "Over Budget", value: "over_budget" },
          ],
        },
        {
          field: "department",
          label: "Department",
          type: "select",
          options: [
            { label: "Production", value: "Production" },
            { label: "Marketing", value: "Marketing" },
            { label: "Talent", value: "Talent" },
            { label: "Operations", value: "Operations" },
            { label: "IT", value: "IT" },
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
        { field: "code", label: "Code", sortable: true },
        { field: "name", label: "Name", sortable: true },
        { field: "department", label: "Department", sortable: true },
        { field: "manager", label: "Manager", sortable: true },
        { field: "budget", label: "Budget", sortable: true, format: { type: "currency" } },
        { field: "spent", label: "Spent", sortable: true, format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", inactive: "#6b7280", over_budget: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Cost Center", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "transactions", label: "View Transactions" },
    { id: "edit", label: "Edit Budget" },
    { id: "transfer", label: "Transfer Funds" },
    { id: "reports", label: "View Reports" },
  ],
};
