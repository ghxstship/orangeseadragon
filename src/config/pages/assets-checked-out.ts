import type { PageConfig } from "./types";

export const assetsCheckedOutPageConfig: PageConfig = {
  id: "assets-checked-out",
  title: "Checked Out",
  description: "Equipment currently in use",

  source: {
    entity: "assetsCheckedOut",
    defaultSorts: [{ field: "due_date", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Items Out", field: "totalCount" },
      { id: "onTime", label: "On Time", field: "onTimeCount" },
      { id: "overdue", label: "Overdue", field: "overdueCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search...",
      fields: ["name", "checked_out_by", "event"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "On Time", value: "on_time" },
            { label: "Overdue", value: "overdue" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "quantity", label: "Qty", sortable: true },
        { field: "checked_out_by", label: "Checked Out By", sortable: true },
        { field: "event", label: "Event", sortable: true },
        { field: "due_date", label: "Due Date", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              on_time: "#22c55e",
              overdue: "#ef4444",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "check-in", label: "Check In" },
    { id: "view", label: "View Details" },
    { id: "extend", label: "Extend" },
    { id: "reminder", label: "Send Reminder" },
  ],
};
