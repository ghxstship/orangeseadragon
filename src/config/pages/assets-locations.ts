import type { PageConfig } from "./types";

export const assetsLocationsPageConfig: PageConfig = {
  id: "assets-locations",
  title: "Locations",
  description: "Storage locations for equipment",

  source: {
    entity: "assetsLocations",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Locations", field: "totalCount" },
      { id: "items", label: "Total Items", field: "totalItems" },
      { id: "warehouses", label: "Warehouses", field: "warehouseCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search locations...",
      fields: ["name", "address"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Warehouse", value: "Warehouse" },
            { label: "Office", value: "Office" },
            { label: "Venue", value: "Venue" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "address", label: "Address", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "item_count", label: "Items", sortable: true },
        { field: "capacity", label: "Capacity", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-location", label: "Add Location", icon: "plus" },
  rowActions: [
    { id: "view-inventory", label: "View Inventory" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ],
};
