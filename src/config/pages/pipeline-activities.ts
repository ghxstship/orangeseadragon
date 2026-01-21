import type { PageConfig } from "./types";

export const pipelineActivitiesPageConfig: PageConfig = {
  id: "pipeline-activities",
  title: "Activities",
  description: "Sales activities and interactions",

  source: {
    entity: "pipeline-activities",
    defaultSorts: [{ field: "time", direction: "desc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search activities...",
      fields: ["description", "contact"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Call", value: "call" },
            { label: "Email", value: "email" },
            { label: "Meeting", value: "meeting" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "description", label: "Description", sortable: true },
        { field: "type", label: "Type", format: { type: "badge" } },
        { field: "contact", label: "Contact" },
        { field: "time", label: "Time" },
      ],
    },
    list: {
      titleField: "description",
      subtitleField: "contact",
      badgeField: "type",
      metaFields: ["time"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Activity",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
  ],
};
