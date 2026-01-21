import type { PageConfig } from "./types";

export const trashPageConfig: PageConfig = {
  id: "trash",
  title: "Trash",
  description: "Items are permanently deleted after 30 days",

  source: {
    entity: "trash",
    defaultSorts: [{ field: "deletedDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Items in Trash", field: "totalItems" },
      { id: "expiring", label: "Expiring Soon", field: "expiringCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search trash...",
      fields: ["name", "originalLocation", "deletedBy"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Document", value: "document" },
            { label: "Event", value: "event" },
            { label: "Project", value: "project" },
            { label: "Contact", value: "contact" },
            { label: "Note", value: "note" },
            { label: "Template", value: "template" },
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
        {
          field: "type",
          label: "Type",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              document: "#3b82f6",
              event: "#a855f7",
              project: "#22c55e",
              contact: "#f97316",
              note: "#eab308",
              template: "#ec4899",
            },
          },
        },
        { field: "originalLocation", label: "Original Location", sortable: true },
        { field: "deletedDate", label: "Deleted", sortable: true, format: { type: "date" } },
        { field: "deletedBy", label: "Deleted By", sortable: true },
        { field: "expiresIn", label: "Expires In", sortable: true },
        { field: "size", label: "Size", sortable: false },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "empty-trash", label: "Empty Trash", icon: "trash" },
  rowActions: [
    { id: "restore", label: "Restore" },
    { id: "restore-to", label: "Restore to Different Location" },
    { id: "delete-permanently", label: "Delete Permanently" },
  ],
};
