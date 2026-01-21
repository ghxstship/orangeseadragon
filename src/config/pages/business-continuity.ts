import type { PageConfig } from "./types";

export const businessContinuityPageConfig: PageConfig = {
  id: "business-continuity",
  title: "Business Continuity",
  description: "Business continuity planning and management",

  source: {
    entity: "bcPlans",
    defaultSorts: [{ field: "nextReview", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "readiness", label: "Overall Readiness", field: "overallReadiness" },
      { id: "total", label: "Total Plans", field: "totalPlans" },
      { id: "current", label: "Current", field: "currentPlans" },
      { id: "lastDrill", label: "Last Drill", field: "lastDrill" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search plans...",
      fields: ["name", "category", "owner"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Current", value: "current" },
            { label: "Review Needed", value: "review_needed" },
            { label: "Outdated", value: "outdated" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Technology", value: "Technology" },
            { label: "Communication", value: "Communication" },
            { label: "Data", value: "Data" },
            { label: "Operations", value: "Operations" },
            { label: "Supply Chain", value: "Supply Chain" },
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
        { field: "name", label: "Plan Name", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { current: "#22c55e", review_needed: "#eab308", outdated: "#ef4444" } } },
        { field: "owner", label: "Owner", sortable: true },
        { field: "lastReviewed", label: "Last Reviewed", sortable: true, format: { type: "date" } },
        { field: "nextReview", label: "Next Review", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Plan", icon: "file-text" },
  rowActions: [
    { id: "view", label: "View Plan" },
    { id: "download", label: "Download" },
    { id: "review", label: "Review" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
