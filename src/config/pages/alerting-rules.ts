import type { PageConfig } from "./types";

export const alertingRulesPageConfig: PageConfig = {
  id: "alerting-rules",
  title: "Alerting Rules",
  description: "Configure alert conditions and notifications",

  source: {
    entity: "alerting-rules",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Rules", field: "count" },
      { id: "enabled", label: "Enabled", field: "enabledCount" },
      { id: "critical", label: "Critical", field: "criticalCount" },
      { id: "triggers", label: "Triggers (30d)", field: "triggerCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search rules...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "severity",
          label: "Severity",
          type: "select",
          options: [
            { label: "Critical", value: "critical" },
            { label: "Warning", value: "warning" },
            { label: "Info", value: "info" },
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
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Rule", sortable: true },
        { field: "description", label: "Description" },
        { field: "condition", label: "Condition" },
        { field: "severity", label: "Severity", format: { type: "badge" } },
        { field: "enabled", label: "Enabled" },
        { field: "triggerCount", label: "Triggers", align: "right" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "severity",
      metaFields: ["condition", "triggerCount"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Rule",
    icon: "plus",
  },

  rowActions: [
    { id: "edit", label: "Edit Rule" },
    { id: "test", label: "Test Rule" },
    { id: "history", label: "View History" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
