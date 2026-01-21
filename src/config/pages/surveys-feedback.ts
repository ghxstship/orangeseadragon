import type { PageConfig } from "./types";

export const surveysFeedbackPageConfig: PageConfig = {
  id: "surveys-feedback",
  title: "Surveys & Feedback",
  source: {
    entity: "surveys",
    defaultSorts: [{ field: "createdDate", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Surveys", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "responses", label: "Total Responses", field: "totalResponses", format: "number" },
      { id: "nps", label: "Avg NPS Score", field: "avgNps" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search surveys...",
      fields: ["name", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Pre-Event", value: "pre_event" },
            { label: "Post-Event", value: "post_event" },
            { label: "NPS", value: "nps" },
            { label: "Satisfaction", value: "satisfaction" },
            { label: "Feedback", value: "feedback" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Active", value: "active" },
            { label: "Closed", value: "closed" },
            { label: "Archived", value: "archived" },
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
        { field: "type", label: "Type", format: { type: "badge", colorMap: { pre_event: "#3b82f6", post_event: "#22c55e", nps: "#8b5cf6", satisfaction: "#f97316", feedback: "#ec4899" } } },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { draft: "#6b7280", active: "#22c55e", closed: "#3b82f6", archived: "#8b5cf6" } } },
        { field: "totalResponses", label: "Responses", align: "right", format: { type: "number" } },
        { field: "npsScore", label: "NPS", align: "right" },
        { field: "completionRate", label: "Completion", align: "right", format: { type: "percentage" } },
        { field: "createdDate", label: "Created", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    grid: {
      titleField: "name",
      subtitleField: "eventName",
      badgeField: "status",
      cardFields: ["type", "totalResponses", "npsScore", "completionRate"],
      columns: 2,
    },
  },
  primaryAction: {
    id: "create",
    label: "Create Survey",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Survey" },
    { id: "results", label: "View Results" },
    { id: "activate", label: "Activate" },
    { id: "close", label: "Close Survey" },
    { id: "export", label: "Export Responses" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
