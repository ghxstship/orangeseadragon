import type { PageConfig } from "./types";

export const checkInPageConfig: PageConfig = {
  id: "check-in",
  title: "Check-In",
  description: "Manage guest check-ins and access control",

  source: {
    entity: "checkInEntries",
    defaultSorts: [{ field: "checkInTime", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Guests", field: "count" },
      { id: "checkedIn", label: "Checked In", field: "checkedInCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "denied", label: "Denied", field: "deniedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search by name or ticket...",
      fields: ["guestName", "ticketNumber"],
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
            { label: "Checked In", value: "checked_in" },
            { label: "Denied", value: "denied" },
            { label: "No Show", value: "no_show" },
          ],
        },
        {
          field: "ticketType",
          label: "Ticket Type",
          type: "select",
          options: [
            { label: "VIP Pass", value: "VIP Pass" },
            { label: "General Admission", value: "General Admission" },
            { label: "Weekend Pass", value: "Weekend Pass" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "guestName", label: "Guest", sortable: true },
        { field: "ticketType", label: "Ticket Type", sortable: true },
        { field: "ticketNumber", label: "Ticket #", sortable: false },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#6b7280", checked_in: "#22c55e", denied: "#ef4444", no_show: "#eab308" } } },
        { field: "checkInTime", label: "Check-In Time", sortable: true, format: { type: "datetime" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "scan", label: "Scan Ticket", icon: "qr-code" },
  rowActions: [
    { id: "checkIn", label: "Check In" },
    { id: "deny", label: "Deny", variant: "destructive" },
    { id: "viewDetails", label: "View Details" },
  ],
};
