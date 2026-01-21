import type { PageConfig } from "./types";

export const proceduresActivePageConfig: PageConfig = {
  id: "procedures-active",
  title: "Active Procedures",
  description: "Published procedures",
  source: { entity: "active_procedures", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: { enabled: false, items: [] },
  toolbar: {
    search: { enabled: true, placeholder: "Search procedures...", fields: ["name", "category"] },
    filters: { enabled: true, fields: [{ field: "category", label: "Category", type: "select", options: [{ label: "Operations", value: "Operations" }, { label: "Safety", value: "Safety" }, { label: "Admin", value: "Admin" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "version", label: "Version", sortable: true },
        { field: "usageCount", label: "Usage", sortable: true, align: "right" },
        { field: "lastUsed", label: "Last Used", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Procedure", icon: "plus" },
  rowActions: [{ id: "view", label: "View" }, { id: "edit", label: "Edit" }, { id: "start", label: "Start Instance" }],
};
