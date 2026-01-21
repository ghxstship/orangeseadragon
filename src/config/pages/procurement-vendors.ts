import type { PageConfig } from "./types";

export const procurementVendorsPageConfig: PageConfig = {
  id: "procurement-vendors",
  title: "Vendors",
  description: "Vendor directory",

  source: {
    entity: "procurementVendors",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Vendors", field: "totalCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search vendors...",
      fields: ["name", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Approved", value: "approved" },
            { label: "Pending", value: "pending" },
            { label: "Inactive", value: "inactive" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Equipment", value: "equipment" },
            { label: "Services", value: "services" },
            { label: "Supplies", value: "supplies" },
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
        { field: "category", label: "Category", sortable: true },
        { field: "rating", label: "Rating", sortable: true },
        { field: "orders", label: "Orders", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              approved: "#22c55e",
              pending: "#eab308",
              inactive: "#6b7280",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-vendor", label: "Add Vendor", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "create-order", label: "Create Order" },
  ],
};
