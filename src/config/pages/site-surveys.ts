import type { PageConfig } from "./types";

export const siteSurveysPageConfig: PageConfig = {
  id: "site-surveys",
  title: "Site Surveys",
  source: {
    entity: "site-surveys",
    defaultSorts: [{ field: "surveyDate", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Surveys", field: "count" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "followup", label: "Needs Follow-up", field: "followupCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search surveys...",
      fields: ["venueName", "eventName", "surveyedBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Needs Follow-up", value: "needs_followup" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "venueName", label: "Venue", sortable: true },
        { field: "eventName", label: "Event" },
        { field: "surveyDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "surveyedBy", label: "Surveyed By" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { scheduled: "#3b82f6", in_progress: "#eab308", completed: "#22c55e", needs_followup: "#f97316" } } },
        { field: "findings", label: "Findings", align: "right" },
        { field: "photos", label: "Photos", align: "right" },
      ],
      defaultPageSize: 10,
    },
    list: {
      titleField: "venueName",
      subtitleField: "venueAddress",
      badgeField: "status",
      metaFields: ["eventName", "surveyDate", "surveyedBy"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Schedule Survey",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Survey" },
    { id: "photos", label: "View Photos" },
    { id: "download", label: "Download Report" },
    { id: "start", label: "Start Survey" },
    { id: "complete", label: "Complete Survey" },
    { id: "followup", label: "Schedule Follow-up" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
