import type { PageConfig } from "./types";

export const pipelineContactsPageConfig: PageConfig = {
  id: "pipeline-contacts",
  title: "Contacts",
  description: "Sales contacts",

  source: {
    entity: "pipeline-contacts",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search contacts...",
      fields: ["name", "company", "email"],
    },
    filters: {
      enabled: false,
      fields: [],
    },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "company", label: "Company" },
        { field: "role", label: "Role" },
        { field: "email", label: "Email" },
        { field: "phone", label: "Phone" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "company",
      metaFields: ["email", "phone"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Contact",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "add-to-deal", label: "Add to Deal" },
  ],
};
