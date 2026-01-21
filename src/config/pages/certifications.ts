import type { PageConfig } from "./types";

export const certificationsPageConfig: PageConfig = {
  id: "certifications",
  title: "Certifications",
  description: "Track team certifications and compliance",

  source: {
    entity: "certifications",
    defaultSorts: [{ field: "expiryDate", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Certifications", field: "count" },
      { id: "active", label: "Active", field: "activeCount" },
      { id: "expiringSoon", label: "Expiring Soon", field: "expiringSoonCount" },
      { id: "expired", label: "Expired", field: "expiredCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search certifications...",
      fields: ["employeeName", "certificationName", "certificationBody"],
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
            { label: "Expiring Soon", value: "expiring_soon" },
            { label: "Expired", value: "expired" },
            { label: "Pending", value: "pending" },
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
        { field: "employeeName", label: "Employee", sortable: true },
        { field: "certificationName", label: "Certification", sortable: true },
        { field: "certificationBody", label: "Issuing Body", sortable: true },
        { field: "issueDate", label: "Issued", sortable: true, format: { type: "date" } },
        { field: "expiryDate", label: "Expires", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { active: "#22c55e", expiring_soon: "#eab308", expired: "#ef4444", pending: "#3b82f6" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Certification", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "download", label: "Download Certificate" },
    { id: "edit", label: "Edit" },
    { id: "renew", label: "Schedule Renewal" },
    { id: "remove", label: "Remove", variant: "destructive" },
  ],
};
