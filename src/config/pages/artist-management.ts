import type { PageConfig } from "./types";

export const artistManagementPageConfig: PageConfig = {
  id: "artist-management",
  title: "Artist Management",
  description: "Manage artist bookings and contracts",

  source: {
    entity: "artists",
    defaultSorts: [{ field: "performanceDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Artists", field: "count" },
      { id: "confirmed", label: "Confirmed", field: "confirmedCount" },
      { id: "totalFees", label: "Total Fees", field: "totalFees" },
      { id: "pendingContracts", label: "Pending Contracts", field: "pendingContractCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search artists...",
      fields: ["name", "genre", "eventName", "stage"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Confirmed", value: "confirmed" },
            { label: "Pending", value: "pending" },
            { label: "Cancelled", value: "cancelled" },
            { label: "Completed", value: "completed" },
          ],
        },
        {
          field: "contractStatus",
          label: "Contract",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Pending Review", value: "pending_review" },
            { label: "Pending Signature", value: "pending_signature" },
            { label: "Active", value: "active" },
            { label: "Expired", value: "expired" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Artist", sortable: true },
        { field: "genre", label: "Genre", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "stage", label: "Stage", sortable: true },
        { field: "performanceDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { confirmed: "#22c55e", pending: "#eab308", cancelled: "#ef4444", completed: "#6b7280" } } },
        { field: "fee", label: "Fee", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Artist", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Artist" },
    { id: "viewContract", label: "View Contract" },
    { id: "viewRider", label: "View Rider" },
    { id: "viewStagePlot", label: "View Stage Plot" },
    { id: "sendMessage", label: "Send Message" },
    { id: "cancel", label: "Cancel Booking", variant: "destructive" },
  ],
};
