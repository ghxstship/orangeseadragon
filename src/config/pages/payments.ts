import type { PageConfig } from "./types";

export const paymentsPageConfig: PageConfig = {
  id: "payments",
  title: "Payments",
  description: "Track incoming and outgoing payments",

  source: {
    entity: "payments",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Transactions", field: "count" },
      { id: "incoming", label: "Incoming", field: "incomingTotal", format: "currency" },
      { id: "outgoing", label: "Outgoing", field: "outgoingTotal", format: "currency" },
      { id: "pending", label: "Pending", field: "pendingTotal", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search payments...",
      fields: ["transactionId", "partyName", "partyCompany", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Incoming", value: "incoming" },
            { label: "Outgoing", value: "outgoing" },
            { label: "Refund", value: "refund" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Completed", value: "completed" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
          ],
        },
        {
          field: "method",
          label: "Method",
          type: "select",
          options: [
            { label: "Credit Card", value: "credit_card" },
            { label: "Bank Transfer", value: "bank_transfer" },
            { label: "Check", value: "check" },
            { label: "Cash", value: "cash" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "transactionId", label: "Transaction ID", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { incoming: "#22c55e", outgoing: "#3b82f6", refund: "#f97316" } } },
        { field: "partyCompany", label: "Party", sortable: true },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { completed: "#22c55e", pending: "#eab308", failed: "#ef4444", refunded: "#6b7280" } } },
        { field: "method", label: "Method", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "datetime" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "record", label: "Record Payment", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "download", label: "Download Receipt" },
    { id: "retry", label: "Retry Payment" },
    { id: "refund", label: "Issue Refund" },
  ],
};
