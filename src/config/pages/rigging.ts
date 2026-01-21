import type { PageConfig } from "./types";

export const riggingPageConfig: PageConfig = {
  id: "rigging",
  title: "Rigging",
  source: {
    entity: "rigging-points",
    defaultSorts: [{ field: "pointId", direction: "asc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Points", field: "count" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "pending", label: "Pending Inspection", field: "pendingCount" },
      { id: "warnings", label: "Warnings", field: "warningCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search rigging points...",
      fields: ["pointId", "location", "venue"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Approved", value: "approved" },
            { label: "Pending Inspection", value: "pending_inspection" },
            { label: "Load Warning", value: "warning" },
            { label: "Failed", value: "failed" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "pointId", label: "Point ID", sortable: true },
        { field: "location", label: "Location" },
        { field: "venue", label: "Venue" },
        { field: "eventName", label: "Event" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { approved: "#22c55e", pending_inspection: "#eab308", warning: "#f97316", failed: "#ef4444" } } },
        { field: "currentLoad", label: "Load", align: "right" },
        { field: "capacity", label: "Capacity", align: "right" },
        { field: "nextInspection", label: "Next Inspection", format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "pointId",
      subtitleField: "location",
      badgeField: "status",
      metaFields: ["venue", "currentLoad", "capacity"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Add Rigging Point",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Point" },
    { id: "calculations", label: "View Load Calculations" },
    { id: "certificate", label: "Download Certificate" },
    { id: "inspect", label: "Record Inspection" },
    { id: "delete", label: "Remove", variant: "destructive" },
  ],
};
