import type { PageConfig } from "./types";

export const dataCatalogPageConfig: PageConfig = {
  id: "data-catalog",
  title: "Data Catalog",
  description: "Discover and explore your data assets",

  source: {
    entity: "catalogEntries",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Assets", field: "totalAssets" },
      { id: "tables", label: "Tables", field: "tableCount" },
      { id: "views", label: "Views", field: "viewCount" },
      { id: "rows", label: "Total Rows", field: "totalRows" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search catalog...",
      fields: ["name", "schema", "description", "tags"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Table", value: "table" },
            { label: "View", value: "view" },
            { label: "Dataset", value: "dataset" },
          ],
        },
        {
          field: "schema",
          label: "Schema",
          type: "select",
          options: [
            { label: "Public", value: "public" },
            { label: "Finance", value: "finance" },
            { label: "Analytics", value: "analytics" },
            { label: "Marketing", value: "marketing" },
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
        { field: "type", label: "Type", sortable: true },
        { field: "schema", label: "Schema", sortable: true },
        { field: "columns", label: "Columns", sortable: true, format: { type: "number" } },
        { field: "rows", label: "Rows", sortable: true, format: { type: "number" } },
        { field: "lastUpdated", label: "Updated", sortable: true, format: { type: "date" } },
        { field: "owner", label: "Owner", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Asset", icon: "plus" },
  rowActions: [
    { id: "schema", label: "View Schema" },
    { id: "preview", label: "Preview Data" },
    { id: "lineage", label: "View Lineage" },
    { id: "edit", label: "Edit Metadata" },
    { id: "star", label: "Star" },
  ],
};
