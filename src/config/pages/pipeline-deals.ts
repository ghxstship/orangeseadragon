import type { PageConfig } from "./types";

export const pipelineDealsPageConfig: PageConfig = {
  id: "pipeline-deals",
  title: "Deals",
  description: "Sales pipeline",

  source: {
    entity: "pipeline-deals",
    defaultSorts: [{ field: "value", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "pipeline", label: "Total Pipeline", field: "totalValue", format: "currency" },
      { id: "deals", label: "Active Deals", field: "count" },
      { id: "avg", label: "Avg Deal Size", field: "avgValue", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search deals...",
      fields: ["name", "company"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "stage",
          label: "Stage",
          type: "select",
          options: [
            { label: "Qualification", value: "qualification" },
            { label: "Proposal", value: "proposal" },
            { label: "Negotiation", value: "negotiation" },
            { label: "Closed", value: "closed" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "company", label: "Company" },
        { field: "value", label: "Value", sortable: true, align: "right" },
        { field: "stage", label: "Stage", format: { type: "badge" } },
        { field: "probability", label: "Probability", align: "right" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "company",
      badgeField: "stage",
      metaFields: ["value", "probability"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Deal",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "move-stage", label: "Move Stage" },
  ],
};
