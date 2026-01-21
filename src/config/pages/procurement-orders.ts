import type { PageConfig } from "./types";

export const procurementOrdersPageConfig: PageConfig = {
  id: "procurement-orders",
  title: "Purchase Orders",
  description: "Manage purchase orders",

  source: {
    entity: "procurementOrders",
    defaultSorts: [{ field: "order_date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Orders", field: "totalCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "delivered", label: "Delivered", field: "deliveredCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search orders...",
      fields: ["id", "vendor"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
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
        { field: "id", label: "Order ID", sortable: true },
        { field: "vendor", label: "Vendor", sortable: true },
        { field: "items", label: "Items", sortable: true },
        { field: "total", label: "Total", sortable: true },
        { field: "order_date", label: "Order Date", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              pending: "#eab308",
              shipped: "#3b82f6",
              delivered: "#22c55e",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "new-order", label: "New Order", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "track", label: "Track" },
    { id: "receive", label: "Receive" },
  ],
};
