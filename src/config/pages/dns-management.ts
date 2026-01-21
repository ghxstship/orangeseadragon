import type { PageConfig } from "./types";

export const dnsManagementPageConfig: PageConfig = {
  id: "dns-management",
  title: "DNS Management",
  description: "Manage DNS records and domains",

  source: {
    entity: "dnsRecords",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Records", field: "totalRecords" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "types", label: "Record Types", field: "typeCount" },
      { id: "status", label: "DNS Status", field: "dnsStatus" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search records...",
      fields: ["name", "value"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "A", value: "A" },
            { label: "AAAA", value: "AAAA" },
            { label: "CNAME", value: "CNAME" },
            { label: "MX", value: "MX" },
            { label: "TXT", value: "TXT" },
            { label: "NS", value: "NS" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Pending", value: "pending" },
            { label: "Error", value: "error" },
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
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { A: "#3b82f6", AAAA: "#a855f7", CNAME: "#22c55e", MX: "#f97316", TXT: "#eab308", NS: "#ef4444" } } },
        { field: "name", label: "Name", sortable: true },
        { field: "value", label: "Value", sortable: true },
        { field: "ttl", label: "TTL", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", pending: "#eab308", error: "#ef4444" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Record", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
