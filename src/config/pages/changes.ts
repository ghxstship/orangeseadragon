import type { PageConfig } from "./types";

export const changesPageConfig: PageConfig = {
  id: "changes",
  title: "Changes",
  description: "Account setting changes",
  source: { entity: "changes", defaultSorts: [{ field: "changedAt", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Changes", field: "count" },
      { id: "users", label: "Users", field: "userCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search changes...", fields: ["field", "changedBy"] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "field", label: "Field", sortable: true },
        { field: "oldValue", label: "Old Value", sortable: false },
        { field: "newValue", label: "New Value", sortable: false },
        { field: "changedAt", label: "Changed At", sortable: true, format: { type: "date" } },
        { field: "changedBy", label: "Changed By", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
};
