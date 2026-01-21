import type { PageConfig } from "./types";

export const forecastCostsPageConfig: PageConfig = {
  id: "forecast-costs",
  title: "Cost Forecast",
  description: "Projected costs and expenses",
  source: { entity: "cost_forecasts", defaultSorts: [{ field: "category", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "current", label: "Current Costs", field: "currentCosts", format: "currency" },
      { id: "projected", label: "Projected (Q3)", field: "projectedCosts", format: "currency" },
      { id: "change", label: "Change", field: "changePercent" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search categories...", fields: ["category"] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "category", label: "Category", sortable: true },
        { field: "current", label: "Current", sortable: true, align: "right", format: { type: "currency" } },
        { field: "projected", label: "Projected", sortable: true, align: "right", format: { type: "currency" } },
        { field: "change", label: "Change %", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
};
