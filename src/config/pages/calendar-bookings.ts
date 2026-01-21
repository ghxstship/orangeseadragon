import type { PageConfig } from "./types";

export const calendarBookingsPageConfig: PageConfig = {
  id: "calendar-bookings",
  title: "Bookings",
  description: "View and manage resource bookings",

  source: {
    entity: "bookings",
    defaultSorts: [{ field: "date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Bookings", field: "count" },
      { id: "confirmed", label: "Confirmed", field: "confirmedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "attendees", label: "Total Attendees", field: "totalAttendees" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search bookings...",
      fields: ["title", "resource", "bookedBy"],
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
          ],
        },
      ],
    },
    viewTypes: ["list", "table"],
  },

  views: {
    list: {
      titleField: "title",
      subtitleField: "resource",
      badgeField: "status",
      metaFields: ["date", "time", "bookedBy"],
    },
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "resource", label: "Resource", sortable: true },
        { field: "date", label: "Date", sortable: true },
        { field: "time", label: "Time", sortable: false },
        { field: "bookedBy", label: "Booked By", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { confirmed: "#22c55e", pending: "#eab308", cancelled: "#6b7280" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: {
    id: "create",
    label: "New Booking",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "reschedule", label: "Reschedule" },
    { id: "duplicate", label: "Duplicate" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
