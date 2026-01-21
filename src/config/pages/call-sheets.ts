import type { PageConfig } from "./types";

export const callSheetsPageConfig: PageConfig = {
  id: "call-sheets",
  title: "Call Sheets",
  description: "Create and distribute event call sheets",

  source: {
    entity: "callSheets",
    defaultSorts: [{ field: "eventDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Call Sheets", field: "count" },
      { id: "sent", label: "Sent", field: "sentCount" },
      { id: "pending", label: "Pending Acknowledgment", field: "pendingCount" },
      { id: "drafts", label: "Drafts", field: "draftCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search call sheets...",
      fields: ["eventName", "venue"],
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
            { label: "Acknowledged", value: "acknowledged" },
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
        { field: "eventName", label: "Event", sortable: true },
        { field: "eventDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "venue", label: "Venue", sortable: true },
        { field: "callTime", label: "Call Time", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", sent: "#3b82f6", acknowledged: "#22c55e" } } },
        { field: "recipientCount", label: "Recipients", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "New Call Sheet", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Call Sheet" },
    { id: "download", label: "Download PDF" },
    { id: "send", label: "Send to Crew" },
    { id: "resend", label: "Resend" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
