import type { PageConfig } from "./types";

export const featureRequestsPageConfig: PageConfig = {
  id: "feature-requests",
  title: "Feature Requests",
  description: "Submit and vote on feature ideas",

  source: {
    entity: "featureRequests",
    defaultSorts: [{ field: "votes", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Requests", field: "totalRequests" },
      { id: "inProgress", label: "In Progress", field: "inProgressRequests" },
      { id: "completed", label: "Completed", field: "completedRequests" },
      { id: "votes", label: "Total Votes", field: "totalVotes" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search requests...",
      fields: ["title", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Submitted", value: "submitted" },
            { label: "Under Review", value: "under_review" },
            { label: "Planned", value: "planned" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Declined", value: "declined" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Mobile", value: "Mobile" },
            { label: "Reporting", value: "Reporting" },
            { label: "Integrations", value: "Integrations" },
            { label: "Dashboard", value: "Dashboard" },
            { label: "Notifications", value: "Notifications" },
            { label: "Events", value: "Events" },
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
        { field: "title", label: "Title", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { submitted: "#6b7280", under_review: "#eab308", planned: "#a855f7", in_progress: "#3b82f6", completed: "#22c55e", declined: "#ef4444" } } },
        { field: "category", label: "Category", sortable: true },
        { field: "votes", label: "Votes", sortable: true, format: { type: "number" } },
        { field: "comments", label: "Comments", sortable: true, format: { type: "number" } },
        { field: "submittedAt", label: "Submitted", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "submit", label: "Submit Request", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "vote", label: "Vote" },
    { id: "comment", label: "Add Comment" },
  ],
};
