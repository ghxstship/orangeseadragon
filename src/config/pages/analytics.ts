import type { PageConfig } from "./types";

export const analyticsPageConfig: PageConfig = {
  id: "analytics",
  title: "Analytics",
  description: "Business insights and performance metrics",

  source: {
    entity: "analyticsMetrics",
    defaultSorts: [],
  },

  stats: {
    enabled: true,
    items: [
      { id: "revenue", label: "Total Revenue", field: "totalRevenue" },
      { id: "projects", label: "Active Projects", field: "activeProjects" },
      { id: "team", label: "Team Members", field: "teamMembers" },
      { id: "events", label: "Events This Month", field: "eventsThisMonth" },
    ],
  },

  toolbar: {
    search: { enabled: false },
    filters: { enabled: false, fields: [] },
    columns: { enabled: false },
    viewTypes: ["list"],
  },

  views: {
    table: {
      columns: [],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "export", label: "Export", icon: "download" },
  rowActions: [],
};
