import type { PageConfig } from "./types";

export const budgetsPageConfig: PageConfig = {
  id: "budgets",
  title: "Budgets",
  description: "Track and manage project budgets",
  source: { entity: "budgets", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Budget", field: "totalBudget", format: "currency" },
      { id: "spent", label: "Total Spent", field: "totalSpent", format: "currency" },
      { id: "committed", label: "Committed", field: "totalCommitted", format: "currency" },
      { id: "atRisk", label: "At Risk", field: "atRiskCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search budgets...", fields: ["name", "project"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "On Track", value: "on_track" }, { label: "At Risk", value: "at_risk" }, { label: "Over Budget", value: "over_budget" }, { label: "Under Budget", value: "under_budget" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Budget Name", sortable: true },
        { field: "project", label: "Project", sortable: true },
        { field: "totalBudget", label: "Total", sortable: true, align: "right", format: { type: "currency" } },
        { field: "spent", label: "Spent", sortable: true, align: "right", format: { type: "currency" } },
        { field: "remaining", label: "Remaining", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { on_track: "#22c55e", at_risk: "#eab308", over_budget: "#ef4444", under_budget: "#3b82f6" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Create Budget", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "edit", label: "Edit Budget" }, { id: "expense", label: "Add Expense" }, { id: "export", label: "Export Report" }, { id: "archive", label: "Archive", variant: "destructive" }],
};
