import type { PageConfig } from "./types";

export const changelogPageConfig: PageConfig = {
  id: "changelog",
  title: "Changelog",
  description: "Latest updates and improvements to the platform",

  source: {
    entity: "changelogEntries",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: false,
    items: [],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search changelog...",
      fields: ["version", "title"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Change Type",
          type: "select",
          options: [
            { label: "Feature", value: "feature" },
            { label: "Improvement", value: "improvement" },
            { label: "Bug Fix", value: "bugfix" },
            { label: "Security", value: "security" },
            { label: "Breaking", value: "breaking" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list"],
  },

  views: {
    table: {
      columns: [
        { field: "version", label: "Version", sortable: true },
        { field: "title", label: "Title", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: undefined,
  rowActions: [
    { id: "view", label: "View Details" },
  ],
};
