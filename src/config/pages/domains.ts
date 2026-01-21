import type { PageConfig } from "./types";

export const domainsPageConfig: PageConfig = {
  id: "domains",
  title: "Domains",
  description: "Manage custom domains",
  source: { entity: "domains", defaultSorts: [{ field: "domain", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Domains", field: "count" },
      { id: "verified", label: "Verified", field: "verifiedCount" },
      { id: "ssl", label: "SSL Enabled", field: "sslCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search domains...", fields: ["domain"] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "domain", label: "Domain", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { verified: "#22c55e", pending: "#eab308" } } },
        { field: "ssl", label: "SSL", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  primaryAction: { id: "create", label: "Add Domain", icon: "plus" },
  rowActions: [{ id: "verify", label: "Verify" }, { id: "ssl", label: "Configure SSL" }, { id: "remove", label: "Remove", variant: "destructive" }],
};
