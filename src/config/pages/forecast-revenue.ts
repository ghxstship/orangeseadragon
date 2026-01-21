import type { PageConfig } from "./types";

export const forecastRevenuePageConfig: PageConfig = {
  id: "forecast-revenue",
  title: "Revenue Forecast",
  description: "Projected revenue",
  source: { entity: "revenue_forecasts", defaultSorts: [{ field: "month", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "q3", label: "Q3 Forecast", field: "q3Forecast", format: "currency" },
      { id: "ytd", label: "YTD Actual", field: "ytdActual", format: "currency" },
      { id: "annual", label: "Annual Target", field: "annualTarget", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search months...", fields: ["month"] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "month", label: "Month", sortable: true },
        { field: "projected", label: "Projected", sortable: true, align: "right", format: { type: "currency" } },
        { field: "confidence", label: "Confidence", sortable: true, format: { type: "badge", colorMap: { high: "#22c55e", medium: "#eab308", low: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
};
