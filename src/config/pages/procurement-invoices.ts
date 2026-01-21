import type { PageConfig } from "./types";

export const procurementInvoicesPageConfig: PageConfig = {
  id: "procurement-invoices",
  title: "Invoices",
  description: "Vendor invoices",

  source: {
    entity: "procurementInvoices",
    defaultSorts: [{ field: "due_date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Invoices", field: "totalCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "overdue", label: "Overdue", field: "overdueCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search invoices...",
      fields: ["id", "vendor"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Overdue", value: "overdue" },
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
        { field: "id", label: "Invoice ID", sortable: true },
        { field: "vendor", label: "Vendor", sortable: true },
        { field: "amount", label: "Amount", sortable: true },
        { field: "due_date", label: "Due Date", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              pending: "#eab308",
              paid: "#22c55e",
              overdue: "#ef4444",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "mark-paid", label: "Mark Paid" },
    { id: "download", label: "Download" },
  ],
};
