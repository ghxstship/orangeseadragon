import type { PageConfig } from "./types";

export const archivePageConfig: PageConfig = {
  id: "archive",
  title: "Archive",
  description: "View and manage archived items",

  source: {
    entity: "archivedItems",
    defaultSorts: [{ field: "archivedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Archived", field: "count" },
      { id: "events", label: "Events", field: "eventCount" },
      { id: "contacts", label: "Contacts", field: "contactCount" },
      { id: "vendorsDocs", label: "Vendors & Docs", field: "vendorDocCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search archived items...",
      fields: ["name", "archivedBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Event", value: "event" },
            { label: "Contact", value: "contact" },
            { label: "Vendor", value: "vendor" },
            { label: "Invoice", value: "invoice" },
            { label: "Document", value: "document" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { event: "#3b82f6", contact: "#22c55e", vendor: "#a855f7", invoice: "#f97316", document: "#6b7280" } } },
        { field: "archivedAt", label: "Archived", sortable: true, format: { type: "date" } },
        { field: "archivedBy", label: "By", sortable: true },
        { field: "originalCreatedAt", label: "Created", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: undefined,
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "restore", label: "Restore" },
    { id: "download", label: "Download" },
    { id: "delete", label: "Delete Permanently", variant: "destructive" },
  ],
};
