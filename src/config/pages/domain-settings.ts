import type { PageConfig } from "./types";

export const domainSettingsPageConfig: PageConfig = {
  id: "domain-settings",
  title: "Domain Settings",
  description: "Manage custom domains and SSL certificates",

  source: {
    entity: "domains",
    defaultSorts: [{ field: "domain", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Domains", field: "totalDomains" },
      { id: "verified", label: "Verified", field: "verifiedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "ssl", label: "SSL Certificates", field: "sslCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search domains...",
      fields: ["domain"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Alias", value: "alias" },
            { label: "Custom", value: "custom" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Verified", value: "verified" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
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
        { field: "domain", label: "Domain", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { primary: "#3b82f6", alias: "#a855f7", custom: "#22c55e" } } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { verified: "#22c55e", pending: "#eab308", failed: "#ef4444" } } },
        { field: "sslStatus", label: "SSL", sortable: true },
        { field: "addedAt", label: "Added", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Domain", icon: "plus" },
  rowActions: [
    { id: "verify", label: "Verify Domain" },
    { id: "dns", label: "View DNS Records" },
    { id: "ssl", label: "SSL Settings" },
    { id: "primary", label: "Set as Primary" },
    { id: "remove", label: "Remove Domain", variant: "destructive" },
  ],
};
