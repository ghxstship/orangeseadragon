import type { PageConfig } from "./types";

export const pipelinePageConfig: PageConfig = {
  id: "pipeline",
  title: "Pipeline",
  description: "Sales and opportunity pipeline",

  source: {
    entity: "deals",
    defaultSorts: [{ field: "expectedClose", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Pipeline", field: "totalValue", format: "currency" },
      { id: "weighted", label: "Weighted Value", field: "weightedValue", format: "currency" },
      { id: "active", label: "Active Deals", field: "activeCount" },
      { id: "won", label: "Won This Month", field: "wonValue", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search deals...",
      fields: ["name", "company", "owner"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "stage",
          label: "Stage",
          type: "select",
          options: [
            { label: "Lead", value: "lead" },
            { label: "Qualified", value: "qualified" },
            { label: "Proposal", value: "proposal" },
            { label: "Negotiation", value: "negotiation" },
            { label: "Closed Won", value: "closed_won" },
            { label: "Closed Lost", value: "closed_lost" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Deal", sortable: true },
        { field: "company", label: "Company" },
        { field: "value", label: "Value", sortable: true, align: "right", format: { type: "currency" } },
        { field: "stage", label: "Stage", format: { type: "badge" } },
        { field: "probability", label: "Probability", align: "right" },
        { field: "expectedClose", label: "Expected Close", sortable: true, format: { type: "date" } },
        { field: "owner", label: "Owner" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "company",
      badgeField: "stage",
      metaFields: ["value", "probability", "expectedClose", "owner"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Deal",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "activity", label: "Add Activity" },
    { id: "move-stage", label: "Move Stage" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
