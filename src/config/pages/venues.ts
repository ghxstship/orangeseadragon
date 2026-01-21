import type { PageConfig } from "./types";

export const venuesPageConfig: PageConfig = {
  id: "venues",
  title: "Venues",
  description: "Manage venue partnerships and bookings",

  source: {
    entity: "venues",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Venues", field: "count" },
      { id: "partners", label: "Partner Venues", field: "partnerCount" },
      { id: "capacity", label: "Total Capacity", field: "totalCapacity" },
      { id: "rating", label: "Avg Rating", field: "avgRating" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search venues...",
      fields: ["name", "city", "address"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "venue_type",
          label: "Type",
          type: "select",
          options: [
            { label: "Indoor", value: "indoor" },
            { label: "Outdoor", value: "outdoor" },
            { label: "Hybrid", value: "hybrid" },
          ],
        },
      ],
    },
    viewTypes: ["grid", "list"],
  },

  views: {
    grid: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "venue_type",
      cardFields: ["city", "capacity", "rating"],
      columns: 3,
    },
    list: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "venue_type",
      metaFields: ["city", "capacity", "rating"],
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Venue",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "availability", label: "Check Availability" },
    { id: "survey", label: "Site Survey" },
    { id: "contracts", label: "View Contracts" },
    { id: "edit", label: "Edit" },
  ],
};
