import type { PageConfig } from "./types";

export const pressPageConfig: PageConfig = {
  id: "press",
  title: "Press",
  description: "Media coverage and press releases",

  source: {
    entity: "press",
    defaultSorts: [{ field: "publishedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Coverage", field: "count" },
      { id: "featured", label: "Featured", field: "featuredCount" },
      { id: "articles", label: "Articles", field: "articleCount" },
      { id: "thisYear", label: "This Year", field: "yearCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search press...",
      fields: ["title", "publication", "summary"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Article", value: "article" },
            { label: "Press Release", value: "press_release" },
            { label: "Interview", value: "interview" },
            { label: "Mention", value: "mention" },
          ],
        },
        {
          field: "featured",
          label: "Featured",
          type: "select",
          options: [
            { label: "Featured", value: "true" },
            { label: "Not Featured", value: "false" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "publication", label: "Publication", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { article: "#3b82f6", press_release: "#a855f7", interview: "#22c55e", mention: "#f97316" } } },
        { field: "publishedAt", label: "Published", sortable: true, format: { type: "date" } },
        { field: "featured", label: "Featured", sortable: true, format: { type: "boolean" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Add Press Item", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "feature", label: "Feature" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
