import type { PageConfig } from "./types";

export const savedFiltersPageConfig: PageConfig = {
  id: "saved-filters",
  title: "Saved Filters",
  description: "Reusable filter presets for quick data access",

  source: {
    entity: "saved-filters",
    defaultSorts: [{ field: "lastUsed", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Filters", field: "count" },
      { id: "uses", label: "Total Uses", field: "totalUses" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search filters...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "targetModule",
          label: "Module",
          type: "select",
          options: [
            { label: "Events", value: "events" },
            { label: "Contacts", value: "contacts" },
            { label: "Invoices", value: "invoices" },
            { label: "Vendors", value: "vendors" },
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
        { field: "description", label: "Description" },
        { field: "targetModule", label: "Module", format: { type: "badge" } },
        { field: "conditions", label: "Conditions", align: "right" },
        { field: "usageCount", label: "Uses", sortable: true, align: "right" },
        { field: "lastUsed", label: "Last Used", format: { type: "date" } },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "targetModule",
      metaFields: ["usageCount", "lastUsed"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Filter",
    icon: "plus",
  },

  rowActions: [
    { id: "apply", label: "Apply" },
    { id: "edit", label: "Edit Filter" },
    { id: "duplicate", label: "Duplicate" },
    { id: "share", label: "Share" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
