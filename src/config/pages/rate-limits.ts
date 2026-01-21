import type { DashboardPageConfig } from "./dashboard-types";

export const rateLimitsPageConfig: DashboardPageConfig = {
  id: "rate-limits",
  title: "Rate Limits",
  description: "Monitor API usage and rate limit status",

  widgets: [
    {
      id: "apiCallsToday",
      type: "stat",
      title: "API Calls Today",
      field: "apiCallsToday",
      format: "number",
    },
    {
      id: "currentRate",
      type: "stat",
      title: "Current Rate",
      field: "currentRate",
    },
    {
      id: "rateLimited",
      type: "stat",
      title: "Rate Limited",
      field: "rateLimited",
      format: "number",
    },
    {
      id: "status",
      type: "stat",
      title: "Status",
      field: "status",
    },
    {
      id: "usage",
      type: "progress",
      title: "Rate Limit Usage",
      items: [],
    },
    {
      id: "alerts",
      type: "alerts",
      title: "Rate Limit Alerts",
      dataSource: "rateLimitAlerts",
      messageField: "message",
      severityField: "severity",
    },
  ],

  refreshInterval: 30000,
};
