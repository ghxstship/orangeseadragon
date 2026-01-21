import type { PageConfig } from "./types";

export const proposalsPageConfig: PageConfig = {
  id: "proposals",
  title: "Proposals",
  description: "Create and manage client proposals",

  source: {
    entity: "proposals",
    defaultSorts: [{ field: "createdDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Proposals", field: "count" },
      { id: "pending", label: "Pending Response", field: "pendingCount" },
      { id: "accepted", label: "Accepted", field: "acceptedCount" },
      { id: "value", label: "Won Value", field: "totalValue", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search proposals...",
      fields: ["title", "client", "createdBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Sent", value: "sent" },
            { label: "Viewed", value: "viewed" },
            { label: "Accepted", value: "accepted" },
            { label: "Rejected", value: "rejected" },
            { label: "Expired", value: "expired" },
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
        { field: "client", label: "Client", sortable: true },
        { field: "value", label: "Value", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", sent: "#3b82f6", viewed: "#a855f7", accepted: "#22c55e", rejected: "#ef4444", expired: "#f97316" } } },
        { field: "createdDate", label: "Created", sortable: true, format: { type: "date" } },
        { field: "createdBy", label: "Created By", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Proposal", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Proposal" },
    { id: "download", label: "Download PDF" },
    { id: "edit", label: "Edit" },
    { id: "send", label: "Send to Client" },
    { id: "duplicate", label: "Duplicate" },
    { id: "convert", label: "Convert to Project" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
