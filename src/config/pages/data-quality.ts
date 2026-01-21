import type { PageConfig } from "./types";

export const dataQualityPageConfig: PageConfig = {
  id: "data-quality",
  title: "Data Quality",
  description: "Monitor and improve data quality",

  source: {
    entity: "qualityRules",
    defaultSorts: [{ field: "score", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "score", label: "Overall Score", field: "avgScore" },
      { id: "passing", label: "Rules Passing", field: "passingCount" },
      { id: "issues", label: "Total Issues", field: "totalIssues" },
      { id: "lastCheck", label: "Last Check", field: "lastCheck" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search rules...",
      fields: ["name", "table"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Passing", value: "passing" },
            { label: "Warning", value: "warning" },
            { label: "Failing", value: "failing" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Completeness", value: "completeness" },
            { label: "Accuracy", value: "accuracy" },
            { label: "Consistency", value: "consistency" },
            { label: "Uniqueness", value: "uniqueness" },
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
        { field: "name", label: "Rule", sortable: true },
        { field: "table", label: "Table", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { passing: "#22c55e", warning: "#eab308", failing: "#ef4444" } } },
        { field: "score", label: "Score", sortable: true, format: { type: "number" } },
        { field: "issues", label: "Issues", sortable: true, format: { type: "number" } },
        { field: "lastChecked", label: "Last Checked", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "run", label: "Run All Checks", icon: "refresh-cw" },
  rowActions: [
    { id: "run", label: "Run Check" },
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Rule" },
    { id: "issues", label: "View Issues" },
  ],
};
