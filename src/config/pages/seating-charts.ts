import type { PageConfig } from "./types";

export const seatingChartsPageConfig: PageConfig = {
  id: "seating-charts",
  title: "Seating Charts",
  source: {
    entity: "seating-charts",
    defaultSorts: [{ field: "lastModified", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Charts", field: "count" },
      { id: "seats", label: "Total Seats", field: "totalSeats" },
      { id: "assigned", label: "Assigned", field: "assignedSeats" },
      { id: "rate", label: "Assignment Rate", field: "assignmentRate", format: "percentage" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search seating charts...",
      fields: ["name", "eventName", "venue"],
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
            { label: "In Progress", value: "in_progress" },
            { label: "Finalized", value: "finalized" },
            { label: "Locked", value: "locked" },
          ],
        },
      ],
    },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "eventName", label: "Event" },
        { field: "venue", label: "Venue" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { draft: "#6b7280", in_progress: "#3b82f6", finalized: "#22c55e", locked: "#a855f7" } } },
        { field: "assignedSeats", label: "Assigned", align: "right" },
        { field: "totalSeats", label: "Total Seats", align: "right" },
        { field: "tableCount", label: "Tables", align: "right" },
        { field: "lastModified", label: "Modified", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
    },
    grid: {
      titleField: "name",
      subtitleField: "eventName",
      badgeField: "status",
      cardFields: ["venue", "assignedSeats", "totalSeats"],
      columns: 2,
    },
  },
  primaryAction: {
    id: "create",
    label: "New Seating Chart",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Chart" },
    { id: "edit", label: "Edit Assignments" },
    { id: "export", label: "Export PDF" },
    { id: "place-cards", label: "Export Place Cards" },
    { id: "finalize", label: "Finalize" },
    { id: "lock", label: "Lock Chart" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
