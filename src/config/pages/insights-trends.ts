import type { PageConfig } from "./types";

export const insightsTrendsPageConfig: PageConfig = {
  id: "insights-trends",
  title: "Trends",
  description: "Key metric trends and performance indicators",

  source: {
    entity: "insights-trends",
    defaultSorts: [{ field: "metric", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Metrics", field: "count" },
      { id: "improving", label: "Improving", field: "improvingCount" },
      { id: "declining", label: "Declining", field: "decliningCount" },
      { id: "stable", label: "Stable", field: "stableCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search trends...",
      fields: ["metric"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "direction",
          label: "Direction",
          type: "select",
          options: [
            { label: "Up", value: "up" },
            { label: "Down", value: "down" },
            { label: "Stable", value: "stable" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Events", value: "Events" },
            { label: "Quality", value: "Quality" },
            { label: "Operations", value: "Operations" },
            { label: "Financial", value: "Financial" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "metric", label: "Metric", sortable: true },
        { field: "change", label: "Change" },
        { field: "currentValue", label: "Current" },
        { field: "previousValue", label: "Previous" },
        { field: "category", label: "Category", format: { type: "badge" } },
      ],
    },
    list: {
      titleField: "metric",
      subtitleField: "period",
      badgeField: "category",
      metaFields: ["change", "currentValue"],
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "export", label: "Export" },
  ],
};
