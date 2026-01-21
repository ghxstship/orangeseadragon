import type { PageConfig } from "./types";

export const signagePageConfig: PageConfig = {
  id: "signage",
  title: "Signage",
  description: "Manage event signage and wayfinding",

  source: {
    entity: "signage",
    defaultSorts: [{ field: "dueDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Items", field: "totalItems" },
      { id: "quantity", label: "Total Quantity", field: "totalQuantity" },
      { id: "installed", label: "Installed", field: "installedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search signage...",
      fields: ["name", "location", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Directional", value: "directional" },
            { label: "Informational", value: "informational" },
            { label: "Branding", value: "branding" },
            { label: "Safety", value: "safety" },
            { label: "Sponsor", value: "sponsor" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "In Design", value: "design" },
            { label: "Approved", value: "approved" },
            { label: "Printing", value: "printing" },
            { label: "Installed", value: "installed" },
            { label: "Removed", value: "removed" },
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
        {
          field: "type",
          label: "Type",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              directional: "#3b82f6",
              informational: "#22c55e",
              branding: "#a855f7",
              safety: "#ef4444",
              sponsor: "#f97316",
            },
          },
        },
        { field: "location", label: "Location", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "size", label: "Size", sortable: false },
        { field: "quantity", label: "Qty", sortable: true },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              design: "#6b7280",
              approved: "#3b82f6",
              printing: "#eab308",
              installed: "#22c55e",
              removed: "#a855f7",
            },
          },
        },
        { field: "dueDate", label: "Due Date", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add-signage", label: "Add Signage", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "download", label: "Download Artwork" },
    { id: "approve", label: "Approve Design" },
    { id: "print", label: "Send to Print" },
    { id: "install", label: "Mark Installed" },
    { id: "delete", label: "Delete" },
  ],
};
