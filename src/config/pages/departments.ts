import type { PageConfig } from "./types";

export const departmentsPageConfig: PageConfig = {
  id: "departments",
  title: "Departments",
  description: "Manage organization departments",
  source: { entity: "departments", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Departments", field: "count" },
      { id: "members", label: "Total Members", field: "memberCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search departments...", fields: ["name", "head"] },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "head", label: "Head", sortable: true },
        { field: "members", label: "Members", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  primaryAction: { id: "create", label: "Add Department", icon: "plus" },
  rowActions: [{ id: "edit", label: "Edit" }, { id: "members", label: "Manage Members" }, { id: "delete", label: "Delete", variant: "destructive" }],
};
