import type { PageConfig } from "./types";

export const approvalsPageConfig: PageConfig = {
  id: "approvals",
  title: "Approvals",
  description: "Review and approve pending requests",

  source: {
    entity: "approvals",
    defaultSorts: [{ field: "submittedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "pending", label: "Pending Approvals", field: "pendingCount" },
      { id: "amount", label: "Pending Amount", field: "pendingAmount", format: "currency" },
      { id: "approved", label: "Approved This Week", field: "approvedCount" },
      { id: "urgent", label: "Urgent", field: "urgentCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search approvals...",
      fields: ["title", "description", "requestedBy.name"],
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
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Expense", value: "expense" },
            { label: "Purchase", value: "purchase" },
            { label: "Time Off", value: "timeoff" },
            { label: "Document", value: "document" },
            { label: "Budget", value: "budget" },
            { label: "Contract", value: "contract" },
          ],
        },
        {
          field: "priority",
          label: "Priority",
          type: "select",
          options: [
            { label: "Urgent", value: "urgent" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
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
        { field: "title", label: "Title", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { expense: "#22c55e", purchase: "#3b82f6", timeoff: "#a855f7", document: "#f97316", budget: "#14b8a6", contract: "#ec4899" } } },
        { field: "requestedBy.name", label: "Requested By", sortable: true },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "priority", label: "Priority", sortable: true, format: { type: "badge", colorMap: { urgent: "#ef4444", high: "#f97316", medium: "#3b82f6", low: "#6b7280" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", approved: "#22c55e", rejected: "#ef4444" } } },
        { field: "submittedAt", label: "Submitted", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "approve", label: "Approve" },
    { id: "reject", label: "Reject", variant: "destructive" },
    { id: "history", label: "View History" },
  ],
};
