import type { PageConfig } from "./types";

export const proceduresDraftsPageConfig: PageConfig = {
  id: "procedures-drafts",
  title: "Draft Procedures",
  description: "Work in progress",
  source: { entity: "procedure_drafts", defaultSorts: [{ field: "lastEdited", direction: "desc" }] },
  stats: { enabled: false, items: [] },
  toolbar: {
    search: { enabled: true, placeholder: "Search drafts...", fields: ["name", "category"] },
    filters: { enabled: true, fields: [{ field: "category", label: "Category", type: "select", options: [{ label: "Admin", value: "Admin" }, { label: "Safety", value: "Safety" }, { label: "Operations", value: "Operations" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "lastEdited", label: "Last Edited", sortable: true },
        { field: "editedBy", label: "Edited By", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Procedure", icon: "plus" },
  rowActions: [{ id: "edit", label: "Edit" }, { id: "preview", label: "Preview" }, { id: "publish", label: "Publish" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
