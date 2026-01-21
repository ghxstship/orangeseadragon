import type { PageConfig } from "./types";

export const floorPlansPageConfig: PageConfig = {
  id: "floor-plans",
  title: "Floor Plans",
  description: "Manage venue layouts and seating arrangements",

  source: {
    entity: "floor-plans",
    defaultSorts: [{ field: "lastModified", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Plans", field: "count" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "review", label: "In Review", field: "reviewCount" },
      { id: "drafts", label: "Drafts", field: "draftCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search floor plans...",
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
            { label: "In Review", value: "review" },
            { label: "Approved", value: "approved" },
            { label: "Archived", value: "archived" },
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
        { field: "eventName", label: "Event", sortable: true },
        { field: "venue", label: "Venue", sortable: true },
        { field: "area", label: "Area", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", review: "#eab308", approved: "#22c55e", archived: "#a855f7" } } },
        { field: "capacity", label: "Capacity", sortable: true, align: "right" },
        { field: "lastModified", label: "Modified", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Floor Plan", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Plan" },
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "download", label: "Download PDF" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
