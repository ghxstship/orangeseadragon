import type { PageConfig } from "./types";

export const apiPlaygroundPageConfig: PageConfig = {
  id: "api-playground",
  title: "API Playground",
  description: "Test API endpoints interactively",

  source: {
    entity: "apiEndpoints",
    defaultSorts: [],
  },

  stats: {
    enabled: false,
    items: [],
  },

  toolbar: {
    search: { enabled: false },
    filters: { enabled: false, fields: [] },
    columns: { enabled: false },
    viewTypes: ["list"],
  },

  views: {
    table: {
      columns: [],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: undefined,
  rowActions: [],
};
