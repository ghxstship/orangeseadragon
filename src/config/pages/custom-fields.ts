import type { PageConfig } from "./types";

export const customFieldsPageConfig: PageConfig = {
  id: "custom-fields",
  title: "Custom Fields",
  description: "Define custom data fields for your entities",

  source: {
    entity: "customFields",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Fields", field: "totalFields" },
      { id: "required", label: "Required", field: "requiredFields" },
      { id: "entities", label: "Entities", field: "entityCount" },
      { id: "types", label: "Field Types", field: "typeCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search fields...",
      fields: ["name", "key", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Date", value: "date" },
            { label: "Boolean", value: "boolean" },
            { label: "Select", value: "select" },
            { label: "Multi-Select", value: "multiselect" },
          ],
        },
        {
          field: "entity",
          label: "Entity",
          type: "select",
          options: [
            { label: "Event", value: "event" },
            { label: "Contact", value: "contact" },
            { label: "Vendor", value: "vendor" },
            { label: "Venue", value: "venue" },
            { label: "Task", value: "task" },
          ],
        },
        {
          field: "required",
          label: "Required",
          type: "select",
          options: [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "key", label: "Key", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "entity", label: "Entity", sortable: true },
        { field: "required", label: "Required", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Field", icon: "plus" },
  rowActions: [
    { id: "edit", label: "Edit Field" },
    { id: "duplicate", label: "Duplicate" },
    { id: "usage", label: "View Usage" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
