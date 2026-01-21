import type { PageConfig } from "./types";

export const caseStudiesPageConfig: PageConfig = {
  id: "case-studies",
  title: "Case Studies",
  description: "Success stories and customer outcomes",

  source: {
    entity: "caseStudies",
    defaultSorts: [{ field: "publishedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total", field: "totalStudies" },
      { id: "featured", label: "Featured", field: "featuredCount" },
      { id: "views", label: "Total Views", field: "totalViews" },
      { id: "downloads", label: "Downloads", field: "totalDownloads" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search case studies...",
      fields: ["title", "client", "industry"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "industry",
          label: "Industry",
          type: "select",
          options: [
            { label: "Entertainment", value: "Entertainment" },
            { label: "Technology", value: "Technology" },
            { label: "Hospitality", value: "Hospitality" },
            { label: "Non-Profit", value: "Non-Profit" },
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
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "client", label: "Client", sortable: true },
        { field: "industry", label: "Industry", sortable: true },
        { field: "views", label: "Views", sortable: true, format: { type: "number" } },
        { field: "downloads", label: "Downloads", sortable: true, format: { type: "number" } },
        { field: "publishedAt", label: "Published", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Case Study", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "download", label: "Download PDF" },
    { id: "feature", label: "Toggle Featured" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
