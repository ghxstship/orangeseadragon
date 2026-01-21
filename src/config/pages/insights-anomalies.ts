import type { PageConfig } from "./types";

export const insightsAnomaliesPageConfig: PageConfig = {
  id: "insights-anomalies",
  title: "Anomalies",
  description: "Detected data anomalies",
  source: { entity: "anomalies", defaultSorts: [{ field: "detected", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Anomalies", field: "count" },
      { id: "high", label: "High Severity", field: "highCount" },
      { id: "resolved", label: "Resolved", field: "resolvedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search anomalies...", fields: ["metric"] },
    filters: { enabled: true, fields: [{ field: "severity", label: "Severity", type: "select", options: [{ label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "metric", label: "Metric", sortable: true },
        { field: "change", label: "Change", sortable: true },
        { field: "expected", label: "Expected", sortable: false },
        { field: "severity", label: "Severity", sortable: true, format: { type: "badge", colorMap: { high: "#ef4444", medium: "#eab308", low: "#6b7280" } } },
        { field: "detected", label: "Detected", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  rowActions: [{ id: "investigate", label: "Investigate" }, { id: "dismiss", label: "Dismiss" }, { id: "resolve", label: "Mark Resolved" }],
};
