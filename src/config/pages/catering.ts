import type { PageConfig } from "./types";

export const cateringPageConfig: PageConfig = {
  id: "catering",
  title: "Catering",
  description: "Manage food and beverage orders",

  source: {
    entity: "cateringOrders",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Orders", field: "count" },
      { id: "pending", label: "Pending/Confirmed", field: "pendingCount" },
      { id: "headcount", label: "Total Headcount", field: "totalHeadcount" },
      { id: "cost", label: "Total Cost", field: "totalCost" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search catering orders...",
      fields: ["orderNumber", "eventName", "vendor"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "mealType",
          label: "Meal Type",
          type: "select",
          options: [
            { label: "Breakfast", value: "breakfast" },
            { label: "Lunch", value: "lunch" },
            { label: "Dinner", value: "dinner" },
            { label: "Snacks", value: "snacks" },
            { label: "Beverages", value: "beverages" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Preparing", value: "preparing" },
            { label: "Delivered", value: "delivered" },
            { label: "Completed", value: "completed" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "orderNumber", label: "Order #", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "mealType", label: "Meal", sortable: true, format: { type: "badge", colorMap: { breakfast: "#eab308", lunch: "#f97316", dinner: "#a855f7", snacks: "#ec4899", beverages: "#3b82f6" } } },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "serviceTime", label: "Time", sortable: true },
        { field: "headcount", label: "Guests", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", confirmed: "#3b82f6", preparing: "#f97316", delivered: "#22c55e", completed: "#6b7280" } } },
        { field: "totalCost", label: "Cost", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "New Order", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Order" },
    { id: "confirm", label: "Confirm Order" },
    { id: "preparing", label: "Mark Preparing" },
    { id: "delivered", label: "Mark Delivered" },
    { id: "complete", label: "Mark Completed" },
    { id: "contact", label: "Contact Vendor" },
    { id: "cancel", label: "Cancel Order", variant: "destructive" },
  ],
};
