import type { PageConfig } from "./types";

export const savedViewsPageConfig: PageConfig = {
  id: "saved-views",
  title: "Saved Views",
  source: {
    entity: "saved-views",
    defaultSorts: [{ field: "lastUsed", direction: "desc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Views", field: "count" },
      { id: "events", label: "Events", field: "eventsCount" },
      { id: "contacts", label: "Contacts", field: "contactsCount" },
      { id: "financial", label: "Financial", field: "financialCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search views...",
      fields: ["name", "description"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "module",
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
        { field: "module", label: "Module", format: { type: "badge", colorMap: { events: "#3b82f6", contacts: "#22c55e", invoices: "#f97316", vendors: "#8b5cf6" } } },
        { field: "filters", label: "Filters", align: "center" },
        { field: "columns", label: "Columns", align: "center" },
        { field: "isDefault", label: "Default", format: { type: "boolean" } },
        { field: "lastUsed", label: "Last Used", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "module",
      metaFields: ["filters", "columns", "lastUsed"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Create View",
    icon: "plus",
  },
  rowActions: [
    { id: "open", label: "Open" },
    { id: "edit", label: "Edit View" },
    { id: "duplicate", label: "Duplicate" },
    { id: "set-default", label: "Set as Default" },
    { id: "share", label: "Share" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
