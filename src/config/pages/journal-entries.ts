import type { PageConfig } from "./types";

export const journalEntriesPageConfig: PageConfig = {
  id: "journal-entries",
  title: "Journal Entries",
  source: {
    entity: "journal-entries",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Entries", field: "count" },
      { id: "posted", label: "Posted", field: "postedCount" },
      { id: "pending", label: "Pending Review", field: "pendingCount" },
      { id: "postedTotal", label: "Posted Total", field: "postedTotal", format: "currency" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search entries...",
      fields: ["entryNumber", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Standard", value: "standard" },
            { label: "Adjusting", value: "adjusting" },
            { label: "Closing", value: "closing" },
            { label: "Reversing", value: "reversing" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Pending", value: "pending" },
            { label: "Posted", value: "posted" },
            { label: "Reversed", value: "reversed" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "entryNumber", label: "Entry #", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "description", label: "Description" },
        { field: "type", label: "Type", format: { type: "badge", colorMap: { standard: "#3b82f6", adjusting: "#8b5cf6", closing: "#f97316", reversing: "#ef4444" } } },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { draft: "#6b7280", pending: "#eab308", posted: "#22c55e", reversed: "#ef4444" } } },
        { field: "debitTotal", label: "Debit", align: "right", format: { type: "currency" } },
        { field: "creditTotal", label: "Credit", align: "right", format: { type: "currency" } },
        { field: "createdBy", label: "Created By" },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "entryNumber",
      subtitleField: "description",
      badgeField: "status",
      metaFields: ["date", "type", "debitTotal"],
    },
  },
  primaryAction: {
    id: "create",
    label: "New Entry",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Entry" },
    { id: "submit", label: "Submit for Review" },
    { id: "post", label: "Post Entry" },
    { id: "reverse", label: "Reverse Entry" },
    { id: "duplicate", label: "Duplicate" },
  ],
};
