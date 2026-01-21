import type { PageConfig } from "./types";

export const bankAccountsPageConfig: PageConfig = {
  id: "bank-accounts",
  title: "Bank Accounts",
  description: "Manage connected bank accounts",

  source: {
    entity: "bankAccounts",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "totalBalance", label: "Total Balance", field: "totalBalance" },
      { id: "connected", label: "Connected Accounts", field: "count" },
      { id: "active", label: "Active Accounts", field: "activeCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search accounts...",
      fields: ["name", "bankName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "accountType",
          label: "Type",
          type: "select",
          options: [
            { label: "Checking", value: "checking" },
            { label: "Savings", value: "savings" },
            { label: "Credit", value: "credit" },
            { label: "Merchant", value: "merchant" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Pending", value: "pending" },
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
        { field: "bankName", label: "Bank", sortable: true },
        { field: "accountType", label: "Type", sortable: true, format: { type: "badge", colorMap: { checking: "#3b82f6", savings: "#22c55e", credit: "#a855f7", merchant: "#f97316" } } },
        { field: "accountNumber", label: "Account #", sortable: false },
        { field: "balance", label: "Balance", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", inactive: "#6b7280", pending: "#eab308" } } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "connect", label: "Connect Account", icon: "plus" },
  rowActions: [
    { id: "transactions", label: "View Transactions" },
    { id: "sync", label: "Sync Now" },
    { id: "open", label: "Open in Bank" },
    { id: "edit", label: "Edit Account" },
    { id: "primary", label: "Set as Primary" },
    { id: "disconnect", label: "Disconnect", variant: "destructive" },
  ],
};
