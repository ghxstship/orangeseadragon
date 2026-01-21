import type { PageConfig } from "./types";

export const jobsShiftsPageConfig: PageConfig = {
  id: "jobs-shifts",
  title: "Shifts",
  description: "Shift scheduling",

  source: {
    entity: "jobsShifts",
    defaultSorts: [{ field: "date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Shifts", field: "totalCount" },
      { id: "confirmed", label: "Confirmed", field: "confirmedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search shifts...",
      fields: ["employee", "location"],
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
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "employee", label: "Employee", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "time", label: "Time", sortable: true },
        { field: "location", label: "Location", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              confirmed: "#22c55e",
              pending: "#eab308",
              cancelled: "#ef4444",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-shift", label: "Add Shift", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "swap", label: "Swap" },
    { id: "cancel", label: "Cancel" },
  ],
};
