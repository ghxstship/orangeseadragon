import type { PageConfig } from "./types";

export const inventoryPageConfig: PageConfig = {
  id: "inventory",
  title: "Inventory",
  description: "Track consumables and stock levels",

  source: {
    entity: "inventory",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "skus", label: "Total SKUs", field: "count" },
      { id: "items", label: "Total Items", field: "totalItems" },
      { id: "value", label: "Inventory Value", field: "totalValue", format: "currency" },
      { id: "lowStock", label: "Low Stock Items", field: "lowStockCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search inventory...",
      fields: ["sku", "name", "category", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Cables", value: "Cables" },
            { label: "Consumables", value: "Consumables" },
            { label: "Lighting", value: "Lighting" },
            { label: "Audio", value: "Audio" },
          ],
        },
        {
          field: "location",
          label: "Location",
          type: "select",
          options: [
            { label: "Warehouse A", value: "Warehouse A" },
            { label: "Warehouse B", value: "Warehouse B" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table"],
  },

  views: {
    table: {
      columns: [
        { field: "sku", label: "SKU", sortable: true },
        { field: "name", label: "Item", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "quantity", label: "Quantity", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge" } },
        { field: "value", label: "Value", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Item", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "adjust", label: "Adjust Stock" },
    { id: "reorder", label: "Reorder" },
    { id: "history", label: "View History" },
    { id: "edit", label: "Edit" },
  ],
};
