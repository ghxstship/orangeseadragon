import type { PageConfig } from "./types";

export const vendorsPageConfig: PageConfig = {
  id: "vendors",
  title: "Vendors",
  description: "Manage supplier and vendor relationships",

  source: {
    entity: "vendors",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Vendors", field: "count" },
      { id: "active", label: "Active Vendors", field: "activeCount" },
      { id: "spend", label: "Total Spend", field: "totalSpend", format: "currency" },
      { id: "rating", label: "Avg. Rating", field: "avgRating" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search vendors...",
      fields: ["name", "category", "contactName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Pending", value: "pending" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Audio Equipment", value: "Audio Equipment" },
            { label: "Security", value: "Security" },
            { label: "Catering", value: "Catering" },
            { label: "Stage & Rigging", value: "Stage & Rigging" },
            { label: "Lighting", value: "Lighting" },
            { label: "Transportation", value: "Transportation" },
          ],
        },
      ],
    },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Vendor", sortable: true },
        { field: "category", label: "Category" },
        { field: "contactName", label: "Contact" },
        { field: "location", label: "Location" },
        { field: "rating", label: "Rating", align: "right" },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "totalSpend", label: "Total Spend", align: "right", format: { type: "currency" } },
      ],
    },
    grid: {
      titleField: "name",
      subtitleField: "category",
      badgeField: "status",
      cardFields: ["contactName", "location", "rating", "totalSpend"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Vendor",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "edit", label: "Edit Vendor" },
    { id: "contracts", label: "View Contracts" },
    { id: "invoices", label: "View Invoices" },
    { id: "create-po", label: "Create PO" },
    { id: "deactivate", label: "Deactivate", variant: "destructive" },
  ],
};
