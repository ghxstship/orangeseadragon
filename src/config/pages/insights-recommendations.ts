import type { PageConfig } from "./types";

export const insightsRecommendationsPageConfig: PageConfig = {
  id: "insights-recommendations",
  title: "Recommendations",
  description: "AI-powered recommendations",

  source: {
    entity: "insights-recommendations",
    defaultSorts: [{ field: "impact", direction: "desc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search recommendations...",
      fields: ["title", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "impact",
          label: "Impact",
          type: "select",
          options: [
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Marketing", value: "Marketing" },
            { label: "Staffing", value: "Staffing" },
            { label: "Operations", value: "Operations" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Recommendation", sortable: true },
        { field: "description", label: "Description" },
        { field: "impact", label: "Impact", format: { type: "badge" } },
        { field: "category", label: "Category", format: { type: "badge" } },
      ],
    },
    list: {
      titleField: "title",
      subtitleField: "description",
      badgeField: "impact",
      metaFields: ["category"],
    },
  },

  rowActions: [
    { id: "take-action", label: "Take Action" },
    { id: "dismiss", label: "Dismiss" },
  ],
};
