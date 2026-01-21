import type { PageConfig } from "./types";

export const knowledgeBasePageConfig: PageConfig = {
  id: "knowledge-base",
  title: "Knowledge Base",
  description: "Search help articles and find answers to common questions",

  source: {
    entity: "knowledge_articles",
    defaultSorts: [{ field: "views", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "articles", label: "Total Articles", field: "count" },
      { id: "views", label: "Total Views", field: "totalViews" },
      { id: "helpful", label: "Helpful Votes", field: "totalHelpful" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search articles...",
      fields: ["title", "excerpt", "category"],
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
            { label: "Video", value: "video" },
            { label: "FAQ", value: "faq" },
            { label: "Tip", value: "tip" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Basics", value: "Basics" },
            { label: "Events", value: "Events" },
            { label: "Billing", value: "Billing" },
            { label: "Developer", value: "Developer" },
            { label: "Tutorials", value: "Tutorials" },
            { label: "Tips", value: "Tips" },
          ],
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "views", label: "Most Viewed" },
        { field: "helpful", label: "Most Helpful" },
        { field: "updated", label: "Recently Updated" },
        { field: "title", label: "Title" },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["list", "grid"],
  },

  views: {
    list: {
      titleField: "title",
      subtitleField: "excerpt",
      badgeField: "type",
      metaFields: ["views", "helpful", "category"],
    },
    grid: {
      titleField: "title",
      subtitleField: "excerpt",
      badgeField: "type",
      cardFields: ["category", "views", "helpful"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "contact",
    label: "Contact Support",
    icon: "message",
    variant: "outline",
  },

  rowActions: [
    { id: "view", label: "Read Article" },
    { id: "helpful", label: "Mark as Helpful" },
    { id: "share", label: "Share" },
  ],
};
