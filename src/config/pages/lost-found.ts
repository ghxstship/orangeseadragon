import type { PageConfig } from "./types";

export const lostFoundPageConfig: PageConfig = {
  id: "lost-found",
  title: "Lost & Found",
  description: "Manage lost and found items",

  source: {
    entity: "lost-found",
    defaultSorts: [{ field: "foundDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Items", field: "count" },
      { id: "unclaimed", label: "Unclaimed", field: "unclaimedCount" },
      { id: "pending", label: "Pending Pickup", field: "pendingCount" },
      { id: "claimed", label: "Claimed", field: "claimedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search items...",
      fields: ["itemDescription", "foundLocation", "eventName", "storageLocation"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Electronics", value: "electronics" },
            { label: "Clothing", value: "clothing" },
            { label: "Accessories", value: "accessories" },
            { label: "Documents", value: "documents" },
            { label: "Keys", value: "keys" },
            { label: "Bags", value: "bags" },
            { label: "Other", value: "other" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Unclaimed", value: "unclaimed" },
            { label: "Claimed", value: "claimed" },
            { label: "Pending Pickup", value: "pending_pickup" },
            { label: "Disposed", value: "disposed" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "itemDescription", label: "Description", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge", colorMap: { electronics: "#3b82f6", clothing: "#a855f7", accessories: "#ec4899", documents: "#eab308", keys: "#f97316", bags: "#22c55e", other: "#6b7280" } } },
        { field: "foundLocation", label: "Found At", sortable: true },
        { field: "foundDate", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { unclaimed: "#eab308", claimed: "#22c55e", pending_pickup: "#3b82f6", disposed: "#6b7280" } } },
        { field: "storageLocation", label: "Storage", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Log Found Item", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Item" },
    { id: "claim", label: "Register Claim" },
    { id: "pickup", label: "Mark as Claimed" },
    { id: "print", label: "Print Label" },
    { id: "dispose", label: "Dispose", variant: "destructive" },
  ],
};
