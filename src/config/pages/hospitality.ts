import type { PageConfig } from "./types";

export const hospitalityPageConfig: PageConfig = {
  id: "hospitality",
  title: "Hospitality",
  description: "Manage accommodations, transportation, and catering",
  source: { entity: "hospitality_requests", defaultSorts: [{ field: "date", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Requests", field: "count" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "confirmed", label: "Confirmed", field: "confirmedCount" },
      { id: "cost", label: "Total Cost", field: "totalCost", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search requests...", fields: ["details", "eventName", "requestedFor"] },
    filters: { enabled: true, fields: [
      { field: "type", label: "Type", type: "select", options: [{ label: "Accommodation", value: "accommodation" }, { label: "Transportation", value: "transportation" }, { label: "Catering", value: "catering" }] },
      { field: "status", label: "Status", type: "select", options: [{ label: "Pending", value: "pending" }, { label: "Confirmed", value: "confirmed" }, { label: "In Progress", value: "in_progress" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "details", label: "Details", sortable: false },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { accommodation: "#3b82f6", transportation: "#22c55e", catering: "#f97316" } } },
        { field: "eventName", label: "Event", sortable: true },
        { field: "requestedFor", label: "For", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "cost", label: "Cost", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", confirmed: "#22c55e", in_progress: "#3b82f6", completed: "#6b7280", cancelled: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Request", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "edit", label: "Edit Request" }, { id: "confirm", label: "Confirm" }, { id: "notes", label: "Add Notes" }, { id: "cancel", label: "Cancel", variant: "destructive" }],
};
