import type { PageConfig } from "./types";

export const loadInOutPageConfig: PageConfig = {
  id: "load-in-out",
  title: "Load In / Load Out",
  source: {
    entity: "load-schedules",
    defaultSorts: [{ field: "scheduledDate", direction: "asc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "loadIns", label: "Load Ins", field: "loadInCount" },
      { id: "loadOuts", label: "Load Outs", field: "loadOutCount" },
      { id: "inProgress", label: "In Progress", field: "inProgressCount" },
      { id: "trucks", label: "Trucks Scheduled", field: "totalTrucks" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search schedules...",
      fields: ["eventName", "venue"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Load In", value: "load_in" },
            { label: "Load Out", value: "load_out" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Scheduled", value: "scheduled" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Delayed", value: "delayed" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "eventName", label: "Event", sortable: true },
        { field: "venue", label: "Venue" },
        { field: "type", label: "Type", format: { type: "badge", colorMap: { load_in: "#22c55e", load_out: "#f97316" } } },
        { field: "scheduledDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "scheduledTime", label: "Time" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { scheduled: "#3b82f6", in_progress: "#eab308", completed: "#22c55e", delayed: "#ef4444" } } },
        { field: "trucks", label: "Trucks", align: "right" },
        { field: "crewCount", label: "Crew", align: "right" },
      ],
      defaultPageSize: 10,
    },
    list: {
      titleField: "eventName",
      subtitleField: "venue",
      badgeField: "type",
      metaFields: ["scheduledDate", "scheduledTime", "trucks"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Schedule Load",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Schedule" },
    { id: "checklist", label: "View Checklist" },
    { id: "crew", label: "Assign Crew" },
    { id: "start", label: "Start Load" },
    { id: "complete", label: "Mark Complete" },
    { id: "cancel", label: "Cancel", variant: "destructive" },
  ],
};
