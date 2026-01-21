import type { PageConfig } from "./types";

export const affiliatesPageConfig: PageConfig = {
  id: "affiliates",
  title: "Affiliates",
  description: "Affiliate program management",

  source: {
    entity: "affiliates",
    defaultSorts: [{ field: "joinedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Affiliates", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "referrals", label: "Total Referrals", field: "totalReferrals" },
      { id: "earnings", label: "Total Earnings", field: "totalEarnings", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search affiliates...",
      fields: ["name", "email"],
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
            { label: "Inactive", value: "inactive" },
          ],
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "name", label: "Name" },
        { field: "referrals", label: "Referrals" },
        { field: "earnings", label: "Earnings" },
        { field: "conversionRate", label: "Conversion Rate" },
        { field: "joinedAt", label: "Join Date" },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["table", "list", "grid"],
    export: { enabled: true, formats: ["csv", "xlsx"] },
    refresh: { enabled: true },
    bulkActions: [
      { id: "activate", label: "Activate", variant: "default" },
      { id: "deactivate", label: "Deactivate", variant: "default" },
      { id: "delete", label: "Delete", variant: "destructive" },
    ],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true, width: 200 },
        { field: "email", label: "Email", sortable: true },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { active: "#22c55e", pending: "#eab308", inactive: "#6b7280" } } },
        { field: "referrals", label: "Referrals", sortable: true, align: "right", format: { type: "number" } },
        { field: "earnings", label: "Earnings", sortable: true, align: "right", format: { type: "currency" } },
        { field: "conversionRate", label: "Conv. Rate", sortable: true, align: "right", format: { type: "percentage", decimals: 1 } },
        { field: "joinedAt", label: "Joined", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
      selectable: true,
    },
    list: {
      titleField: "name",
      subtitleField: "email",
      badgeField: "status",
      metaFields: ["referrals", "earnings", "conversionRate"],
    },
    grid: {
      titleField: "name",
      subtitleField: "email",
      badgeField: "status",
      cardFields: ["referrals", "earnings", "conversionRate", "joinedAt"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "create",
    label: "Add Affiliate",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "referrals", label: "View Referrals" },
    { id: "payout", label: "Process Payout" },
    { id: "toggle-status", label: "Toggle Status" },
    { id: "delete", label: "Remove", variant: "destructive" },
  ],
};
