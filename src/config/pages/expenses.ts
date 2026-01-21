import type { PageConfig } from "./types";

export const expensesPageConfig: PageConfig = {
  id: "expenses",
  title: "Expenses",
  description: "Track and manage expense reports",
  source: { entity: "expenses", defaultSorts: [{ field: "date", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Expenses", field: "count" },
      { id: "pending", label: "Pending Approval", field: "pendingCount" },
      { id: "amount", label: "Total Amount", field: "totalAmount", format: "currency" },
      { id: "reimbursement", label: "Pending Reimbursement", field: "pendingReimbursement", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search expenses...", fields: ["description", "submittedBy", "category"] },
    filters: { enabled: true, fields: [
      { field: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Submitted", value: "submitted" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }, { label: "Reimbursed", value: "reimbursed" }] },
      { field: "category", label: "Category", type: "select", options: [{ label: "Travel", value: "Travel" }, { label: "Equipment", value: "Equipment" }, { label: "Meals & Entertainment", value: "Meals & Entertainment" }, { label: "Supplies", value: "Supplies" }, { label: "Software", value: "Software" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "description", label: "Description", sortable: false },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "submittedBy", label: "Submitted By", sortable: true },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", submitted: "#3b82f6", pending_approval: "#eab308", approved: "#22c55e", rejected: "#ef4444", reimbursed: "#a855f7" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Expense", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "receipt", label: "View Receipt" }, { id: "edit", label: "Edit" }, { id: "submit", label: "Submit" }, { id: "approve", label: "Approve" }, { id: "reject", label: "Reject" }, { id: "reimburse", label: "Mark Reimbursed" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
