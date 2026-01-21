import type { PageConfig } from "./types";

export const videoTutorialsPageConfig: PageConfig = {
  id: "video-tutorials",
  title: "Video Tutorials",
  description: "Learn how to use ATLVS with step-by-step videos",

  source: {
    entity: "tutorials",
    defaultSorts: [{ field: "category", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Tutorials", field: "count" },
      { id: "completed", label: "Completed", field: "completedCount" },
      { id: "inProgress", label: "In Progress", field: "inProgressCount" },
      { id: "duration", label: "Total Duration", field: "totalDuration" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search tutorials...",
      fields: ["title", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Getting Started", value: "Getting Started" },
            { label: "Events", value: "Events" },
            { label: "Vendors", value: "Vendors" },
            { label: "Finance", value: "Finance" },
            { label: "Administration", value: "Administration" },
            { label: "Integrations", value: "Integrations" },
          ],
        },
        {
          field: "level",
          label: "Level",
          type: "select",
          options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
          ],
        },
      ],
    },
    viewTypes: ["grid", "list"],
  },

  views: {
    grid: {
      titleField: "title",
      subtitleField: "description",
      badgeField: "level",
      cardFields: ["category", "duration"],
      columns: 3,
    },
    list: {
      titleField: "title",
      subtitleField: "description",
      badgeField: "level",
      metaFields: ["category", "duration", "progress"],
    },
  },

  rowActions: [
    { id: "play", label: "Play Tutorial" },
    { id: "bookmark", label: "Bookmark" },
    { id: "share", label: "Share" },
  ],
};
