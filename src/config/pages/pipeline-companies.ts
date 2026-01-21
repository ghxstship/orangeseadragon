import type { PageConfig } from "./types";

export const pipelineCompaniesPageConfig: PageConfig = {
  id: "pipeline-companies",
  title: "Companies",
  description: "Company accounts",

  source: {
    entity: "pipeline-companies",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search companies...",
      fields: ["name", "industry"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "industry",
          label: "Industry",
          type: "select",
          options: [
            { label: "Technology", value: "Technology" },
            { label: "Manufacturing", value: "Manufacturing" },
            { label: "Retail", value: "Retail" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Company", sortable: true },
        { field: "industry", label: "Industry", format: { type: "badge" } },
        { field: "size", label: "Size" },
        { field: "deals", label: "Deals", align: "right" },
        { field: "value", label: "Value", align: "right" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "industry",
      metaFields: ["size", "deals", "value"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Company",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "add-deal", label: "Add Deal" },
  ],
};
