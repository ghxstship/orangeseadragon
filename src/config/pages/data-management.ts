import type { PageConfig } from "./types";

export const dataManagementPageConfig: PageConfig = {
  id: "data-management",
  title: "Data Management",
  description: "Manage your organization's data",

  source: {
    entity: "dataCategories",
    defaultSorts: [{ field: "size", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "storage", label: "Storage Used", field: "totalSize" },
      { id: "records", label: "Total Records", field: "totalRecords" },
      { id: "archived", label: "Archived", field: "archivedSize" },
      { id: "trash", label: "Trash", field: "trashSize" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search categories...",
      fields: ["name"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "retentionPolicy",
          label: "Retention",
          type: "select",
          options: [
            { label: "3 years", value: "3 years" },
            { label: "5 years", value: "5 years" },
            { label: "7 years", value: "7 years" },
            { label: "10 years", value: "10 years" },
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
        { field: "name", label: "Category", sortable: true },
        { field: "size", label: "Size (GB)", sortable: true, format: { type: "number" } },
        { field: "records", label: "Records", sortable: true, format: { type: "number" } },
        { field: "lastUpdated", label: "Updated", sortable: true, format: { type: "date" } },
        { field: "retentionPolicy", label: "Retention", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "import", label: "Import", icon: "upload" },
  rowActions: [
    { id: "manage", label: "Manage" },
    { id: "archive", label: "Archive" },
    { id: "export", label: "Export" },
  ],
};
