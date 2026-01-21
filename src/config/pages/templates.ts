import type { PageConfig } from "./types";

export const templatesPageConfig: PageConfig = {
  id: "templates",
  title: "Templates",
  description: "Ready-to-use templates",
  source: { entity: "templates", defaultSorts: [{ field: "downloads", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Templates", field: "count" },
      { id: "downloads", label: "Total Downloads", field: "downloadCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search templates...", fields: ["name"] },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "format", label: "Format", sortable: true, format: { type: "badge" } },
        { field: "downloads", label: "Downloads", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  rowActions: [{ id: "download", label: "Download" }, { id: "preview", label: "Preview" }],
};
