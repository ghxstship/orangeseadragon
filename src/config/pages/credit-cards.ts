import type { PageConfig } from "./types";

export const creditCardsPageConfig: PageConfig = {
  id: "credit-cards",
  title: "Credit Cards",
  description: "Manage corporate credit cards",

  source: {
    entity: "creditCards",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "limit", label: "Total Credit Limit", field: "totalLimit" },
      { id: "balance", label: "Current Balance", field: "totalBalance" },
      { id: "available", label: "Available Credit", field: "totalAvailable" },
      { id: "utilization", label: "Utilization Rate", field: "utilizationRate" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search cards...",
      fields: ["name", "lastFour", "assignedTo"],
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
            { label: "Locked", value: "locked" },
            { label: "Expired", value: "expired" },
          ],
        },
        {
          field: "cardType",
          label: "Card Type",
          type: "select",
          options: [
            { label: "Visa", value: "visa" },
            { label: "Mastercard", value: "mastercard" },
            { label: "Amex", value: "amex" },
            { label: "Discover", value: "discover" },
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
        { field: "name", label: "Card Name", sortable: true },
        { field: "cardType", label: "Type", sortable: true },
        { field: "lastFour", label: "Last 4", sortable: false },
        { field: "creditLimit", label: "Limit", sortable: true, format: { type: "currency" } },
        { field: "currentBalance", label: "Balance", sortable: true, format: { type: "currency" } },
        { field: "availableCredit", label: "Available", sortable: true, format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", locked: "#ef4444", expired: "#6b7280" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Card", icon: "plus" },
  rowActions: [
    { id: "transactions", label: "View Transactions" },
    { id: "statement", label: "View Statement" },
    { id: "pay", label: "Make Payment" },
    { id: "lock", label: "Lock/Unlock Card" },
    { id: "edit", label: "Edit Card" },
  ],
};
