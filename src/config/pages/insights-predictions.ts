import type { PageConfig } from "./types";

export const insightsPredictionsPageConfig: PageConfig = {
  id: "insights-predictions",
  title: "Predictions",
  description: "AI-powered predictions",

  source: {
    entity: "insights-predictions",
    defaultSorts: [{ field: "confidence", direction: "desc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search predictions...",
      fields: ["prediction"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "confidence",
          label: "Confidence",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
        {
          field: "impact",
          label: "Impact",
          type: "select",
          options: [
            { label: "Positive", value: "positive" },
            { label: "Negative", value: "negative" },
            { label: "Neutral", value: "neutral" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "prediction", label: "Prediction", sortable: true },
        { field: "confidence", label: "Confidence", format: { type: "badge" } },
        { field: "impact", label: "Impact", format: { type: "badge" } },
        { field: "timeframe", label: "Timeframe" },
      ],
    },
    list: {
      titleField: "prediction",
      subtitleField: "timeframe",
      badgeField: "confidence",
      metaFields: ["impact"],
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "dismiss", label: "Dismiss" },
  ],
};
