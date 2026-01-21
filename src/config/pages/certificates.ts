import type { PageConfig } from "./types";

export const certificatesPageConfig: PageConfig = {
  id: "certificates",
  title: "Certificates",
  description: "Manage SSL/TLS and security certificates",

  source: {
    entity: "certificates",
    defaultSorts: [{ field: "expiresAt", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Certificates", field: "count" },
      { id: "valid", label: "Valid", field: "validCount" },
      { id: "expiring", label: "Expiring Soon", field: "expiringCount" },
      { id: "autoRenewal", label: "Auto-Renewal", field: "autoRenewal" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search certificates...",
      fields: ["name", "domain", "issuer"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "SSL/TLS", value: "ssl" },
            { label: "Code Signing", value: "code_signing" },
            { label: "Client Auth", value: "client" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Valid", value: "valid" },
            { label: "Expiring Soon", value: "expiring" },
            { label: "Expired", value: "expired" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "domain", label: "Domain", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { ssl: "#3b82f6", code_signing: "#a855f7", client: "#6b7280" } } },
        { field: "issuer", label: "Issuer", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { valid: "#22c55e", expiring: "#eab308", expired: "#ef4444" } } },
        { field: "expiresAt", label: "Expires", sortable: true, format: { type: "date" } },
        { field: "daysRemaining", label: "Days Left", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "add", label: "Add Certificate", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "renew", label: "Renew" },
    { id: "download", label: "Download" },
    { id: "downloadChain", label: "Download Chain" },
    { id: "revoke", label: "Revoke", variant: "destructive" },
  ],
};
