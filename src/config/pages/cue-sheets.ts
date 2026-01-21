import type { PageConfig } from "./types";

export const cueSheetsPageConfig: PageConfig = {
  id: "cue-sheets",
  title: "Cue Sheets",
  description: "Technical cue management for shows",

  source: {
    entity: "cueSheets",
    defaultSorts: [{ field: "eventDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "sheets", label: "Total Sheets", field: "totalSheets" },
      { id: "cues", label: "Total Cues", field: "totalCues" },
      { id: "rehearsal", label: "In Rehearsal", field: "inRehearsal" },
      { id: "live", label: "Live Now", field: "liveCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search cue sheets...",
      fields: ["name", "eventName", "stage"],
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
            { label: "Rehearsal", value: "rehearsal" },
            { label: "Live", value: "live" },
            { label: "Completed", value: "completed" },
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
        { field: "eventName", label: "Event", sortable: true },
        { field: "eventDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "stage", label: "Stage", sortable: true },
        { field: "cueCount", label: "Cues", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", rehearsal: "#eab308", live: "#ef4444", completed: "#22c55e" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Cue Sheet", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Cue Sheet" },
    { id: "duplicate", label: "Duplicate" },
    { id: "export", label: "Export PDF" },
    { id: "rehearsal", label: "Start Rehearsal" },
    { id: "live", label: "Go Live" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
