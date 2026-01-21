import type { PageConfig } from "./types";

export const crowdManagementPageConfig: PageConfig = {
  id: "crowd-management",
  title: "Crowd Management",
  description: "Real-time crowd density monitoring",

  source: {
    entity: "crowdZones",
    defaultSorts: [{ field: "currentCount", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "attendance", label: "Total Attendance", field: "totalCurrent" },
      { id: "density", label: "Overall Density", field: "overallPercentage" },
      { id: "zones", label: "Active Zones", field: "totalZones" },
      { id: "crowded", label: "Crowded Zones", field: "crowdedZones" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search zones...",
      fields: ["name", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Busy", value: "busy" },
            { label: "Crowded", value: "crowded" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          field: "trend",
          label: "Trend",
          type: "select",
          options: [
            { label: "Increasing", value: "increasing" },
            { label: "Decreasing", value: "decreasing" },
            { label: "Stable", value: "stable" },
          ],
        },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Zone", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "currentCount", label: "Current", sortable: true, format: { type: "number" } },
        { field: "capacity", label: "Capacity", sortable: true, format: { type: "number" } },
        { field: "trend", label: "Trend", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { normal: "#22c55e", busy: "#eab308", crowded: "#f97316", critical: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "refresh", label: "Refresh Data", icon: "refresh-cw" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "alert", label: "Set Alert" },
    { id: "history", label: "View History" },
  ],
};
