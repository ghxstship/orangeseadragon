import type { PageConfig } from "./types";

export const quotesPageConfig: PageConfig = {
  id: "quotes",
  title: "Quotes",
  description: "Create and manage client quotes",

  source: {
    entity: "quotes",
    defaultSorts: [{ field: "createdDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "totalAmount", label: "Total Quoted", field: "totalAmount", format: "currency" },
      { id: "accepted", label: "Accepted", field: "acceptedAmount", format: "currency" },
      { id: "pending", label: "Pending", field: "pendingAmount", format: "currency" },
      { id: "total", label: "Total Quotes", field: "count" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search quotes...",
      fields: ["quoteNumber", "clientName", "clientCompany", "eventName"],
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
            { label: "Accepted", value: "accepted" },
            { label: "Declined", value: "declined" },
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
        { field: "quoteNumber", label: "Quote #", sortable: true },
        { field: "clientCompany", label: "Client", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", sent: "#3b82f6", accepted: "#22c55e", declined: "#ef4444", expired: "#9ca3af" } } },
        { field: "createdDate", label: "Created", sortable: true, format: { type: "date" } },
        { field: "validUntil", label: "Valid Until", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Quote", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Quote" },
    { id: "edit", label: "Edit Quote" },
    { id: "download", label: "Download PDF" },
    { id: "send", label: "Send Quote" },
    { id: "convert", label: "Convert to Invoice" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
