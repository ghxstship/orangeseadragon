import type { PageConfig } from "./types";

export const cashflowPageConfig: PageConfig = {
  id: "cashflow",
  title: "Cash Flow",
  description: "Monitor incoming and outgoing cash",

  source: {
    entity: "cashflowEntries",
    defaultSorts: [{ field: "period", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "inflow", label: "Total Inflow", field: "totalInflow" },
      { id: "outflow", label: "Total Outflow", field: "totalOutflow" },
      { id: "net", label: "Net Cash Flow", field: "netCashflow" },
      { id: "ratio", label: "Inflow/Outflow Ratio", field: "cashflowRatio" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search entries...",
      fields: ["category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Inflow", value: "inflow" },
            { label: "Outflow", value: "outflow" },
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
        { field: "category", label: "Category", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { inflow: "#22c55e", outflow: "#ef4444" } } },
        { field: "amount", label: "Amount", sortable: true, format: { type: "currency" } },
        { field: "period", label: "Period", sortable: true },
        { field: "change", label: "Change %", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "report", label: "Generate Report", icon: "bar-chart-3" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
  ],
};
