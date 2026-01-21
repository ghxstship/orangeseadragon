import type { PageConfig } from "./types";

export const receiptsPageConfig: PageConfig = {
  id: "receipts",
  title: "Receipts",
  description: "Track and manage expense receipts",
  source: { entity: "receipts", defaultSorts: [{ field: "date", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Receipts", field: "count" },
      { id: "amount", label: "Total Amount", field: "totalAmount", format: "currency" },
      { id: "pending", label: "Pending Review", field: "pendingAmount", format: "currency" },
      { id: "approved", label: "Approved", field: "approvedAmount", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search receipts...", fields: ["receiptNumber", "vendorName", "description"] },
    filters: { enabled: true, fields: [
      { field: "status", label: "Status", type: "select", options: [{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }, { label: "Reimbursed", value: "reimbursed" }] },
      { field: "category", label: "Category", type: "select", options: [{ label: "Equipment", value: "equipment" }, { label: "Supplies", value: "supplies" }, { label: "Services", value: "services" }, { label: "Travel", value: "travel" }, { label: "Catering", value: "catering" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "receiptNumber", label: "Receipt #", sortable: true },
        { field: "vendorName", label: "Vendor", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", approved: "#3b82f6", rejected: "#ef4444", reimbursed: "#22c55e" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "upload", label: "Upload Receipt", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "download", label: "Download Attachment" }, { id: "edit", label: "Edit Receipt" }, { id: "approve", label: "Approve" }, { id: "reject", label: "Reject" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
