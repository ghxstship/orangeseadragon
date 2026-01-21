import type { PageConfig } from "./types";

export const proceduresTrainingPageConfig: PageConfig = {
  id: "procedures-training",
  title: "Procedure Training",
  description: "Training materials for procedures",
  source: { entity: "procedure_trainings", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: { enabled: false, items: [] },
  toolbar: {
    search: { enabled: true, placeholder: "Search training...", fields: ["name"] },
    filters: { enabled: true, fields: [{ field: "required", label: "Required", type: "select", options: [{ label: "Required", value: "true" }, { label: "Optional", value: "false" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "duration", label: "Duration", sortable: true },
        { field: "completions", label: "Completions", sortable: true, align: "right" },
        { field: "required", label: "Required", sortable: true, format: { type: "badge" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Add Training", icon: "plus" },
  rowActions: [{ id: "start", label: "Start Training" }, { id: "view", label: "View Details" }, { id: "assign", label: "Assign" }],
};
