import type { PageConfig } from "./types";

export const ridersPageConfig: PageConfig = {
  id: "riders",
  title: "Riders",
  source: {
    entity: "riders",
    defaultSorts: [{ field: "eventDate", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Riders", field: "count" },
      { id: "pending", label: "Pending Review", field: "pendingCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "fulfilled", label: "Fulfilled", field: "fulfilledCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search riders...",
      fields: ["artistName", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Technical", value: "technical" },
            { label: "Hospitality", value: "hospitality" },
            { label: "Full Rider", value: "both" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "In Review", value: "in_review" },
            { label: "Approved", value: "approved" },
            { label: "Fulfilled", value: "fulfilled" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "artistName", label: "Artist", sortable: true },
        { field: "eventName", label: "Event" },
        { field: "eventDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "type", label: "Type", format: { type: "badge", colorMap: { technical: "#8b5cf6", hospitality: "#f97316", both: "#3b82f6" } } },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { pending: "#6b7280", in_review: "#eab308", approved: "#22c55e", fulfilled: "#3b82f6" } } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "artistName",
      subtitleField: "eventName",
      badgeField: "status",
      metaFields: ["type", "eventDate"],
    },
  },
  primaryAction: {
    id: "create",
    label: "New Rider",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Full Rider" },
    { id: "edit", label: "Edit" },
    { id: "download", label: "Download PDF" },
    { id: "send", label: "Send to Vendor" },
    { id: "approve", label: "Approve" },
  ],
};
