import type { PageConfig } from "./types";

export const videosPageConfig: PageConfig = {
  id: "videos",
  title: "Video Tutorials",
  description: "Step-by-step video guides",
  source: { entity: "videos", defaultSorts: [{ field: "views", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Videos", field: "count" },
      { id: "views", label: "Total Views", field: "viewCount" },
      { id: "duration", label: "Avg Duration", field: "avgDuration" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search videos...", fields: ["title"] },
    columns: { enabled: false },
    viewTypes: ["grid"],
  },
  views: {
    grid: {
      titleField: "title",
      subtitleField: "duration",
      cardFields: ["views"],
      columns: 3,
    },
  },
  rowActions: [{ id: "play", label: "Play" }, { id: "share", label: "Share" }],
};
