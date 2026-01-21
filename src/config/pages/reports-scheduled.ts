import type { PageConfig } from "./types";

export const reportsScheduledPageConfig: PageConfig = {
  id: "reports-scheduled",
  title: "Scheduled Reports",
  description: "Automated report delivery",

  source: {
    entity: "reportsScheduled",
    defaultSorts: [{ field: "next_run", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Scheduled", field: "totalCount" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "recipients", label: "Total Recipients", field: "totalRecipients" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search scheduled reports...",
      fields: ["name"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Paused", value: "paused" },
          ],
        },
        {
          field: "frequency",
          label: "Frequency",
          type: "select",
          options: [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
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
        { field: "frequency", label: "Frequency", sortable: true },
        { field: "next_run", label: "Next Run", sortable: true, format: { type: "date" } },
        { field: "recipients", label: "Recipients", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              active: "#22c55e",
              paused: "#6b7280",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  rowActions: [
    { id: "run-now", label: "Run Now" },
    { id: "edit", label: "Edit Schedule" },
    { id: "recipients", label: "Manage Recipients" },
    { id: "pause", label: "Pause" },
    { id: "delete", label: "Delete" },
  ],
};
