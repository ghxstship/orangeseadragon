import type { PageConfig } from "./types";

export const stagePlotsPageConfig: PageConfig = {
  id: "stage-plots",
  title: "Stage Plots",
  description: "Manage artist stage layouts and input lists",
  source: { entity: "stage_plots", defaultSorts: [{ field: "lastModified", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Plots", field: "count" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "pending", label: "Pending Review", field: "pendingCount" },
      { id: "drafts", label: "Drafts", field: "draftCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search stage plots...", fields: ["name", "artistName", "eventName", "stage"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Submitted", value: "submitted" }, { label: "Approved", value: "approved" }, { label: "Archived", value: "archived" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "artistName", label: "Artist", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "stage", label: "Stage", sortable: true },
        { field: "inputCount", label: "Inputs", sortable: true, align: "right" },
        { field: "monitorCount", label: "Monitors", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", submitted: "#3b82f6", approved: "#22c55e", archived: "#a855f7" } } },
        { field: "lastModified", label: "Modified", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Stage Plot", icon: "plus" },
  rowActions: [{ id: "view", label: "View Plot" }, { id: "edit", label: "Edit" }, { id: "duplicate", label: "Duplicate" }, { id: "download", label: "Download PDF" }, { id: "approve", label: "Approve" }, { id: "submit", label: "Submit for Review" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
