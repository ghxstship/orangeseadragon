import type { PageConfig } from "./types";

export const merchandisePageConfig: PageConfig = {
  id: "merchandise",
  title: "Merchandise",
  description: "Manage event merchandise and inventory",

  source: {
    entity: "merchandise",
    defaultSorts: [{ field: "soldQuantity", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Products", field: "count" },
      { id: "revenue", label: "Total Revenue", field: "totalRevenue" },
      { id: "profit", label: "Total Profit", field: "totalProfit" },
      { id: "lowStock", label: "Low Stock Alerts", field: "lowStockCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search merchandise...",
      fields: ["name", "sku", "category", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Apparel", value: "apparel" },
            { label: "Accessories", value: "accessories" },
            { label: "Collectibles", value: "collectibles" },
            { label: "Media", value: "media" },
            { label: "Other", value: "other" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Low Stock", value: "low_stock" },
            { label: "Out of Stock", value: "out_of_stock" },
            { label: "Discontinued", value: "discontinued" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "sku", label: "SKU", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge", colorMap: { apparel: "#3b82f6", accessories: "#a855f7", collectibles: "#ec4899", media: "#f97316", other: "#6b7280" } } },
        { field: "price", label: "Price", sortable: true, align: "right", format: { type: "currency" } },
        { field: "stockQuantity", label: "Stock", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", low_stock: "#eab308", out_of_stock: "#ef4444", discontinued: "#6b7280" } } },
        { field: "soldQuantity", label: "Sold", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Product", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Product" },
    { id: "inventory", label: "Adjust Inventory" },
    { id: "history", label: "View Sales History" },
    { id: "discontinue", label: "Discontinue" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
