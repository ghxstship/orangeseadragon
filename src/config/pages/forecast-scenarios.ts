import type { PageConfig } from "./types";

export const forecastScenariosPageConfig: PageConfig = {
  id: "forecast-scenarios",
  title: "Scenarios",
  description: "Forecast scenarios and modeling",

  source: {
    entity: "forecast-scenarios",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search scenarios...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: false,
      fields: [],
    },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Scenario", sortable: true },
        { field: "description", label: "Description" },
        { field: "revenue", label: "Revenue", align: "right" },
        { field: "probability", label: "Probability", align: "right" },
      ],
    },
    grid: {
      titleField: "name",
      subtitleField: "description",
      cardFields: ["revenue", "probability"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "create",
    label: "New Scenario",
    icon: "plus",
  },

  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
