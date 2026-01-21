import type { PageConfig } from "./types";

export const feedbackPageConfig: PageConfig = {
  id: "feedback",
  title: "Feedback",
  description: "Submit and track feedback",

  source: {
    entity: "feedback",
    defaultSorts: [{ field: "submittedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Feedback", field: "count" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
      { id: "votes", label: "Total Votes", field: "totalVotes" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search feedback...",
      fields: ["title", "description", "submittedBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Bug", value: "bug" },
            { label: "Feature", value: "feature" },
            { label: "Improvement", value: "improvement" },
            { label: "Question", value: "question" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Open", value: "open" },
            { label: "In Progress", value: "in_progress" },
            { label: "Resolved", value: "resolved" },
            { label: "Closed", value: "closed" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { bug: "#ef4444", feature: "#3b82f6", improvement: "#a855f7", question: "#eab308" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { open: "#6b7280", in_progress: "#3b82f6", resolved: "#22c55e", closed: "#6b7280" } } },
        { field: "submittedBy", label: "Submitted By", sortable: true },
        { field: "submittedAt", label: "Date", sortable: true, format: { type: "date" } },
        { field: "votes", label: "Votes", sortable: true, align: "right" },
        { field: "comments", label: "Comments", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Submit Feedback", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "comment", label: "Add Comment" },
    { id: "status", label: "Change Status" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
