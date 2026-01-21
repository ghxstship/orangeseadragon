import type { PageConfig } from "./types";

export const dataRetentionPageConfig: PageConfig = {
  id: "data-retention",
  title: "Data Retention",
  description: "Configure data lifecycle and retention policies",

  source: {
    entity: "retentionPolicies",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Policies", field: "totalPolicies" },
      { id: "active", label: "Active Policies", field: "activePolicies" },
      { id: "records", label: "Records Managed", field: "totalRecords" },
      { id: "nextRun", label: "Next Run", field: "nextRun" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search policies...",
      fields: ["name", "dataType"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "action",
          label: "Action",
          type: "select",
          options: [
            { label: "Archive", value: "archive" },
            { label: "Delete", value: "delete" },
            { label: "Anonymize", value: "anonymize" },
          ],
        },
        {
          field: "enabled",
          label: "Status",
          type: "select",
          options: [
            { label: "Enabled", value: "true" },
            { label: "Disabled", value: "false" },
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
        { field: "name", label: "Policy", sortable: true },
        { field: "dataType", label: "Data Type", sortable: true },
        { field: "retentionPeriod", label: "Retention", sortable: true },
        { field: "action", label: "Action", sortable: true, format: { type: "badge", colorMap: { archive: "#3b82f6", delete: "#ef4444", anonymize: "#a855f7" } } },
        { field: "enabled", label: "Enabled", sortable: true, format: { type: "boolean" } },
        { field: "recordsAffected", label: "Records", sortable: true, format: { type: "number" } },
        { field: "nextRun", label: "Next Run", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "run", label: "Run All Policies", icon: "clock" },
  rowActions: [
    { id: "edit", label: "Edit Policy" },
    { id: "run", label: "Run Now" },
    { id: "history", label: "View History" },
    { id: "preview", label: "Preview Affected Records" },
    { id: "delete", label: "Delete Policy", variant: "destructive" },
  ],
};
