import type { PageConfig } from "./types";

export const forecastResourcesPageConfig: PageConfig = {
  id: "forecast-resources",
  title: "Resource Forecast",
  description: "Projected resource utilization",

  source: {
    entity: "forecast-resources",
    defaultSorts: [{ field: "resource", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "staff", label: "Staff", field: "staffProjected" },
      { id: "equipment", label: "Equipment", field: "equipmentProjected" },
      { id: "venues", label: "Venues", field: "venuesProjected" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search resources...",
      fields: ["resource"],
    },
    filters: {
      enabled: false,
      fields: [],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "resource", label: "Resource", sortable: true },
        { field: "current", label: "Current", align: "right" },
        { field: "projected", label: "Projected", align: "right" },
        { field: "capacity", label: "Capacity", align: "right" },
        { field: "utilization", label: "Utilization", align: "right", format: { type: "percentage" } },
      ],
    },
    list: {
      titleField: "resource",
      subtitleField: "utilization",
      metaFields: ["current", "projected", "capacity"],
    },
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Forecast" },
  ],
};
