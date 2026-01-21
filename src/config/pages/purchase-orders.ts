import type { PageConfig } from "./types";

export const purchaseOrdersPageConfig: PageConfig = {
  id: "purchase-orders",
  title: "Purchase Orders",
  description: "Manage procurement and vendor orders",
  source: { entity: "purchase_orders", defaultSorts: [{ field: "createdDate", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total POs", field: "count" },
      { id: "pending", label: "Pending Approval", field: "pendingCount" },
      { id: "value", label: "Total Value", field: "totalValue", format: "currency" },
      { id: "ordered", label: "In Transit", field: "orderedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search purchase orders...", fields: ["poNumber", "vendor", "project"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Pending Approval", value: "pending_approval" }, { label: "Approved", value: "approved" }, { label: "Ordered", value: "ordered" }, { label: "Received", value: "received" }, { label: "Cancelled", value: "cancelled" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "poNumber", label: "PO Number", sortable: true },
        { field: "vendor", label: "Vendor", sortable: true },
        { field: "project", label: "Project", sortable: true },
        { field: "totalAmount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "createdDate", label: "Created", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", pending_approval: "#eab308", approved: "#22c55e", ordered: "#3b82f6", received: "#a855f7", cancelled: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Create PO", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "download", label: "Download PDF" }, { id: "submit", label: "Submit for Approval" }, { id: "approve", label: "Approve" }, { id: "reject", label: "Reject" }, { id: "edit", label: "Edit" }, { id: "cancel", label: "Cancel", variant: "destructive" }],
};
