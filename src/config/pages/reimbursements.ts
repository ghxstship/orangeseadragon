import type { PageConfig } from "./types";

export const reimbursementsPageConfig: PageConfig = {
  id: "reimbursements",
  title: "Reimbursements",
  description: "Manage expense reimbursement requests",

  source: {
    entity: "reimbursements",
    defaultSorts: [{ field: "submittedDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Requests", field: "totalAmount" },
      { id: "pending", label: "Pending Review", field: "pendingAmount" },
      { id: "approved", label: "Approved", field: "approvedAmount" },
      { id: "paid", label: "Paid", field: "paidAmount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search reimbursements...",
      fields: ["requestNumber", "employeeName", "description", "department"],
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
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Paid", value: "paid" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Travel", value: "travel" },
            { label: "Meals", value: "meals" },
            { label: "Supplies", value: "supplies" },
            { label: "Equipment", value: "equipment" },
            { label: "Other", value: "other" },
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
        { field: "requestNumber", label: "Request #", sortable: true },
        { field: "employeeName", label: "Employee", sortable: true },
        { field: "department", label: "Department", sortable: true },
        {
          field: "category",
          label: "Category",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              travel: "#3b82f6",
              meals: "#22c55e",
              supplies: "#a855f7",
              equipment: "#f97316",
              other: "#6b7280",
            },
          },
        },
        { field: "amount", label: "Amount", sortable: true, format: { type: "currency" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              pending: "#eab308",
              approved: "#3b82f6",
              rejected: "#ef4444",
              paid: "#22c55e",
            },
          },
        },
        { field: "submittedDate", label: "Submitted", sortable: true, format: { type: "date" } },
        { field: "receiptsCount", label: "Receipts", sortable: false },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "new-request", label: "New Request", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "view-receipts", label: "View Receipts" },
    { id: "approve", label: "Approve" },
    { id: "reject", label: "Reject" },
    { id: "process-payment", label: "Process Payment" },
  ],
};
