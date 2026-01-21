import type { PageConfig } from "./types";

export const ticketsPageConfig: PageConfig = {
  id: "tickets",
  title: "Tickets",
  description: "Manage ticket types and sales",

  source: {
    entity: "tickets",
    defaultSorts: [{ field: "eventName", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "revenue", label: "Total Revenue", field: "totalRevenue", format: "currency" },
      { id: "sold", label: "Tickets Sold", field: "totalSold" },
      { id: "capacity", label: "Total Capacity", field: "totalCapacity" },
      { id: "rate", label: "Sell-Through Rate", field: "sellThroughRate", format: "percentage" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search tickets...",
      fields: ["name", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "On Sale", value: "on_sale" },
            { label: "Sold Out", value: "sold_out" },
            { label: "Paused", value: "paused" },
            { label: "Scheduled", value: "scheduled" },
          ],
        },
      ],
    },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Ticket Type", sortable: true },
        { field: "eventName", label: "Event" },
        { field: "price", label: "Price", align: "right", format: { type: "currency" } },
        { field: "sold", label: "Sold", align: "right" },
        { field: "quantity", label: "Capacity", align: "right" },
        { field: "status", label: "Status", format: { type: "badge" } },
      ],
    },
    grid: {
      titleField: "name",
      subtitleField: "eventName",
      badgeField: "status",
      cardFields: ["price", "sold", "quantity"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Ticket Type",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Ticket" },
    { id: "orders", label: "View Orders" },
    { id: "pause", label: "Pause Sales" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
