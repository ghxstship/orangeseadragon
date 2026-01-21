import type { PageConfig } from "./types";

export const parkingPageConfig: PageConfig = {
  id: "parking",
  title: "Parking Passes",
  description: "Manage event parking credentials",

  source: {
    entity: "parkingPasses",
    defaultSorts: [{ field: "validFrom", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Passes", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "expired", label: "Expired", field: "expiredCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search passes...",
      fields: ["passNumber", "holderName", "vehicleInfo", "licensePlate", "eventName"],
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
            { label: "Pending", value: "pending" },
            { label: "Expired", value: "expired" },
            { label: "Revoked", value: "revoked" },
          ],
        },
        {
          field: "lotAssignment",
          label: "Lot",
          type: "select",
          options: [
            { label: "VIP Lot A", value: "VIP Lot A" },
            { label: "Crew Lot B", value: "Crew Lot B" },
            { label: "Vendor Lot C", value: "Vendor Lot C" },
            { label: "Artist Lot", value: "Artist Lot" },
            { label: "Staff Parking", value: "Staff Parking" },
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
        { field: "passNumber", label: "Pass #", sortable: true },
        { field: "holderName", label: "Holder", sortable: true },
        { field: "vehicleInfo", label: "Vehicle", sortable: true },
        { field: "licensePlate", label: "Plate", sortable: true },
        { field: "lotAssignment", label: "Lot", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", pending: "#eab308", expired: "#6b7280", revoked: "#ef4444" } } },
        { field: "validFrom", label: "Valid From", sortable: true, format: { type: "date" } },
        { field: "validTo", label: "Valid To", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Issue Pass", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "print", label: "Print Pass" },
    { id: "edit", label: "Edit" },
    { id: "activate", label: "Activate" },
    { id: "revoke", label: "Revoke" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
