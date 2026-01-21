import type { PageConfig } from "./types";

export const campaignsPageConfig: PageConfig = {
  id: "campaigns",
  title: "Campaigns",
  description: "Manage marketing campaigns and promotions",

  source: {
    entity: "campaigns",
    defaultSorts: [{ field: "startDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Campaigns", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "reach", label: "Total Reach", field: "totalReach" },
      { id: "conversions", label: "Conversions", field: "totalConversions" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search campaigns...",
      fields: ["name", "event"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Planning", value: "planning" },
            { label: "Active", value: "active" },
            { label: "Paused", value: "paused" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Launch", value: "launch" },
            { label: "Awareness", value: "awareness" },
            { label: "Engagement", value: "engagement" },
            { label: "Conversion", value: "conversion" },
            { label: "Retention", value: "retention" },
            { label: "Event", value: "event" },
            { label: "Seasonal", value: "seasonal" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "event", label: "Event", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { planning: "#6b7280", active: "#22c55e", paused: "#eab308", completed: "#a855f7", cancelled: "#ef4444" } } },
        { field: "startDate", label: "Start", sortable: true, format: { type: "date" } },
        { field: "endDate", label: "End", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Campaign", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Campaign" },
    { id: "pause", label: "Pause" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
