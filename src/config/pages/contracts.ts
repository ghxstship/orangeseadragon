import type { PageConfig } from "./types";

export const contractsPageConfig: PageConfig = {
  id: "contracts",
  title: "Contracts",
  description: "Manage agreements and legal documents",

  source: {
    entity: "contracts",
    defaultSorts: [{ field: "endDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Contracts", field: "count" },
      { id: "active", label: "Active Contracts", field: "activeCount" },
      { id: "value", label: "Active Contract Value", field: "totalValue", format: "currency" },
      { id: "pending", label: "Pending Signature", field: "pendingCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search contracts...",
      fields: ["title", "counterparty"],
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
            { label: "Pending Review", value: "pending_review" },
            { label: "Pending Signature", value: "pending_signature" },
            { label: "Active", value: "active" },
            { label: "Expired", value: "expired" },
            { label: "Terminated", value: "terminated" },
            { label: "Renewed", value: "renewed" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Client", value: "client" },
            { label: "Vendor", value: "vendor" },
            { label: "Employment", value: "employment" },
            { label: "NDA", value: "nda" },
            { label: "Service", value: "service" },
            { label: "Licensing", value: "licensing" },
            { label: "Rental", value: "rental" },
            { label: "Sponsorship", value: "sponsorship" },
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
        { field: "counterparty", label: "Counterparty", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge" } },
        { field: "value", label: "Value", sortable: true, align: "right", format: { type: "currency" } },
        { field: "startDate", label: "Start", sortable: true, format: { type: "date" } },
        { field: "endDate", label: "End", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", pending_review: "#3b82f6", pending_signature: "#eab308", active: "#22c55e", expired: "#ef4444", terminated: "#b91c1c", renewed: "#a855f7" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Contract", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Contract" },
    { id: "download", label: "Download PDF" },
    { id: "edit", label: "Edit" },
    { id: "send", label: "Send for Signature" },
    { id: "renew", label: "Renew Contract" },
    { id: "terminate", label: "Terminate", variant: "destructive" },
  ],
};
