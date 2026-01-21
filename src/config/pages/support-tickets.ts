import type { PageConfig } from "./types";

export const supportTicketsPageConfig: PageConfig = {
  id: "support-tickets",
  title: "Support Tickets",
  description: "Manage support requests",
  source: { entity: "tickets", defaultSorts: [{ field: "createdAt", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Tickets", field: "count" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search tickets...", fields: ["id", "subject"] },
    filters: {
      enabled: true,
      fields: [
        { field: "status", label: "Status", type: "select", options: [{ label: "Open", value: "open" }, { label: "In Progress", value: "in_progress" }, { label: "Resolved", value: "resolved" }] },
        { field: "priority", label: "Priority", type: "select", options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }] },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "id", label: "ID", sortable: true },
        { field: "subject", label: "Subject", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { open: "#eab308", in_progress: "#3b82f6", resolved: "#22c55e" } } },
        { field: "priority", label: "Priority", sortable: true, format: { type: "badge", colorMap: { low: "#6b7280", medium: "#eab308", high: "#ef4444" } } },
        { field: "createdAt", label: "Created", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Ticket", icon: "plus" },
  rowActions: [{ id: "view", label: "View" }, { id: "reply", label: "Reply" }, { id: "close", label: "Close" }],
};
