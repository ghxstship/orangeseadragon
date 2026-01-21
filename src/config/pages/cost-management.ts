import type { PageConfig } from "./types";

export const costManagementPageConfig: PageConfig = {
  id: "cost-management",
  title: "Cost Management",
  description: "Monitor and optimize infrastructure costs",

  source: {
    entity: "costItems",
    defaultSorts: [{ field: "currentMonth", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "current", label: "Current Month", field: "totalCurrent" },
      { id: "budget", label: "Monthly Budget", field: "totalBudget" },
      { id: "used", label: "Budget Used", field: "budgetUsed" },
      { id: "annual", label: "Projected Annual", field: "projectedAnnual" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search services...",
      fields: ["service", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Compute", value: "compute" },
            { label: "Database", value: "database" },
            { label: "Storage", value: "storage" },
            { label: "Network", value: "network" },
            { label: "Other", value: "other" },
          ],
        },
        {
          field: "trend",
          label: "Trend",
          type: "select",
          options: [
            { label: "Up", value: "up" },
            { label: "Down", value: "down" },
            { label: "Stable", value: "stable" },
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
        { field: "service", label: "Service", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "currentMonth", label: "Current Month", sortable: true, format: { type: "currency" } },
        { field: "lastMonth", label: "Last Month", sortable: true, format: { type: "currency" } },
        { field: "budget", label: "Budget", sortable: true, format: { type: "currency" } },
        { field: "trend", label: "Trend", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "export", label: "Export Report", icon: "download" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "optimize", label: "Optimization Tips" },
    { id: "alert", label: "Set Alert" },
  ],
};
