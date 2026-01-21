import type { PageConfig } from "./types";

export const achievementsPageConfig: PageConfig = {
  id: "achievements",
  title: "Achievements",
  description: "Track your accomplishments",

  source: {
    entity: "achievements",
    defaultSorts: [{ field: "unlockedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Achievements", field: "count" },
      { id: "unlocked", label: "Unlocked", field: "unlockedCount" },
      { id: "completion", label: "Completion", field: "completionPercent" },
      { id: "categories", label: "Categories", field: "categoryCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search achievements...",
      fields: ["name", "description", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "rarity",
          label: "Rarity",
          type: "select",
          options: [
            { label: "Common", value: "common" },
            { label: "Rare", value: "rare" },
            { label: "Epic", value: "epic" },
            { label: "Legendary", value: "legendary" },
          ],
        },
        {
          field: "unlocked",
          label: "Status",
          type: "select",
          options: [
            { label: "Unlocked", value: "true" },
            { label: "Locked", value: "false" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "category", label: "Category", sortable: true },
        { field: "rarity", label: "Rarity", sortable: true, format: { type: "badge", colorMap: { common: "#6b7280", rare: "#3b82f6", epic: "#a855f7", legendary: "#eab308" } } },
        { field: "progress", label: "Progress", sortable: true },
        { field: "unlocked", label: "Status", sortable: true },
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
