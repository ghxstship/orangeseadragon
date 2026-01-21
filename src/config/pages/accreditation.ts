import type { PageConfig } from "./types";

export const accreditationPageConfig: PageConfig = {
  id: "accreditation",
  title: "Accreditation",
  description: "Manage event credentials and badges",
  source: { entity: "credentials", defaultSorts: [{ field: "badgeNumber", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Credentials", field: "count" },
      { id: "pending", label: "Pending Approval", field: "pendingCount" },
      { id: "ready", label: "Ready to Print", field: "readyCount" },
      { id: "collected", label: "Collected", field: "collectedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search credentials...", fields: ["badgeNumber", "holderName", "organization"] },
    filters: { enabled: true, fields: [
      { field: "status", label: "Status", type: "select", options: [{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Printed", value: "printed" }, { label: "Collected", value: "collected" }, { label: "Revoked", value: "revoked" }] },
      { field: "credentialType", label: "Type", type: "select", options: [{ label: "Artist", value: "artist" }, { label: "Crew", value: "crew" }, { label: "Vendor", value: "vendor" }, { label: "Media", value: "media" }, { label: "VIP", value: "vip" }, { label: "Staff", value: "staff" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "badgeNumber", label: "Badge #", sortable: true },
        { field: "holderName", label: "Holder", sortable: true },
        { field: "organization", label: "Organization", sortable: true },
        { field: "credentialType", label: "Type", sortable: true, format: { type: "badge", colorMap: { artist: "#ec4899", crew: "#3b82f6", vendor: "#f97316", media: "#a855f7", vip: "#eab308", staff: "#6b7280" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", approved: "#3b82f6", printed: "#a855f7", collected: "#22c55e", revoked: "#ef4444" } } },
        { field: "eventName", label: "Event", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Credential", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "edit", label: "Edit" }, { id: "approve", label: "Approve" }, { id: "print", label: "Print Badge" }, { id: "collect", label: "Mark Collected" }, { id: "revoke", label: "Revoke", variant: "destructive" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
