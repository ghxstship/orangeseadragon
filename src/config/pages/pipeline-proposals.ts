import type { PageConfig } from "./types";

export const pipelineProposalsPageConfig: PageConfig = {
  id: "pipeline-proposals",
  title: "Proposals",
  description: "Sales proposals",

  source: {
    entity: "pipeline-proposals",
    defaultSorts: [{ field: "sentAt", direction: "desc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search proposals...",
      fields: ["name", "company"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Sent", value: "sent" },
            { label: "Viewed", value: "viewed" },
            { label: "Accepted", value: "accepted" },
            { label: "Declined", value: "declined" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Proposal", sortable: true },
        { field: "company", label: "Company" },
        { field: "value", label: "Value", align: "right" },
        { field: "status", label: "Status", format: { type: "badge" } },
        { field: "sentAt", label: "Sent" },
        { field: "expiresAt", label: "Expires" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "company",
      badgeField: "status",
      metaFields: ["value", "sentAt"],
    },
  },

  primaryAction: {
    id: "create",
    label: "Create Proposal",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "send", label: "Send" },
    { id: "duplicate", label: "Duplicate" },
  ],
};
