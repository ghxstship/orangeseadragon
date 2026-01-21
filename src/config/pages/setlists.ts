import type { PageConfig } from "./types";

export const setlistsPageConfig: PageConfig = {
  id: "setlists",
  title: "Setlists",
  source: {
    entity: "setlists",
    defaultSorts: [{ field: "eventDate", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Setlists", field: "count" },
      { id: "confirmed", label: "Confirmed", field: "confirmedCount" },
      { id: "songs", label: "Total Songs", field: "totalSongs" },
      { id: "duration", label: "Total Duration", field: "totalDuration" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search setlists...",
      fields: ["artistName", "eventName"],
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
            { label: "Submitted", value: "submitted" },
            { label: "Approved", value: "approved" },
            { label: "Performed", value: "performed" },
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
        { field: "stage", label: "Stage" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { draft: "#6b7280", submitted: "#eab308", approved: "#22c55e", performed: "#3b82f6" } } },
        { field: "setDuration", label: "Duration", align: "right" },
        { field: "songCount", label: "Songs", align: "right" },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "artistName",
      subtitleField: "eventName",
      badgeField: "status",
      metaFields: ["stage", "setDuration"],
    },
  },
  primaryAction: {
    id: "create",
    label: "New Setlist",
    icon: "plus",
  },
  rowActions: [
    { id: "edit", label: "Edit Setlist" },
    { id: "duplicate", label: "Duplicate" },
    { id: "export", label: "Export PDF" },
    { id: "share", label: "Share with Artist" },
    { id: "confirm", label: "Confirm" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
