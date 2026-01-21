import type { PageConfig } from "./types";

export const notificationRulesPageConfig: PageConfig = {
  id: "notification-rules",
  title: "Notification Rules",
  source: {
    entity: "notification-rules",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Rules", field: "count" },
      { id: "enabled", label: "Enabled", field: "enabledCount" },
      { id: "triggers", label: "Total Triggers", field: "totalTriggers", format: "number" },
      { id: "channels", label: "Channels", field: "channelCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search rules...",
      fields: ["name", "trigger"],
    },
    filters: {
      enabled: true,
      fields: [
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
        { field: "name", label: "Name", sortable: true },
        { field: "trigger", label: "Trigger" },
        { field: "recipients", label: "Recipients" },
        { field: "enabled", label: "Enabled", format: { type: "boolean" } },
        { field: "triggerCount", label: "Triggers", align: "right", format: { type: "number" } },
        { field: "lastTriggered", label: "Last Triggered", format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "name",
      subtitleField: "trigger",
      badgeField: "enabled",
      metaFields: ["recipients", "triggerCount"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Create Rule",
    icon: "plus",
  },
  rowActions: [
    { id: "edit", label: "Edit Rule" },
    { id: "history", label: "View History" },
    { id: "test", label: "Test Rule" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
