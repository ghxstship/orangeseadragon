import type { PageConfig } from "./types";

export const invoicesPageConfig: PageConfig = {
  id: "invoices",
  title: "Invoices",
  description: "View and download invoices",

  source: {
    entity: "invoices",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Invoices", field: "count" },
      { id: "paid", label: "Paid", field: "paidCount" },
      { id: "billed", label: "Total Billed", field: "totalBilled", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search invoices...",
      fields: ["id", "date"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Paid", value: "paid" },
            { label: "Pending", value: "pending" },
            { label: "Overdue", value: "overdue" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table"],
    export: { enabled: true, formats: ["csv"] },
  },

  views: {
    table: {
      columns: [
        { field: "id", label: "Invoice", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { paid: "#22c55e", pending: "#eab308", overdue: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
      selectable: false,
    },
  },

  rowActions: [
    { id: "download", label: "Download PDF" },
    { id: "view", label: "View Details" },
  ],
};
