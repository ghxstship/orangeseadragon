import type { PageConfig } from "./types";

export const proceduresChecklistsPageConfig: PageConfig = {
  id: "procedures-checklists",
  title: "Checklists",
  description: "Reusable checklists",
  source: { entity: "checklists", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: { enabled: false, items: [] },
  toolbar: {
    search: { enabled: true, placeholder: "Search checklists...", fields: ["name", "category"] },
    filters: { enabled: true, fields: [{ field: "category", label: "Category", type: "select", options: [{ label: "Events", value: "Events" }, { label: "Assets", value: "Assets" }, { label: "Venues", value: "Venues" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "items", label: "Items", sortable: true, align: "right" },
        { field: "usageCount", label: "Usage", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Create Checklist", icon: "plus" },
  rowActions: [{ id: "view", label: "View" }, { id: "edit", label: "Edit" }, { id: "start", label: "Start Checklist" }, { id: "duplicate", label: "Duplicate" }],
};
