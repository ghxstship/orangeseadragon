import type { PageConfig } from "./types";

export const marketplacePageConfig: PageConfig = {
  id: "marketplace",
  title: "Marketplace",
  description: "Services and product marketplace",

  source: {
    entity: "marketplace",
    defaultSorts: [{ field: "rating", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Listings", field: "count" },
      { id: "featured", label: "Featured", field: "featuredCount" },
      { id: "categories", label: "Categories", field: "categoryCount" },
      { id: "avgRating", label: "Avg Rating", field: "avgRating" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search marketplace...",
      fields: ["title", "provider", "category", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Equipment", value: "Equipment" },
            { label: "Services", value: "Services" },
            { label: "Catering", value: "Catering" },
          ],
        },
        {
          field: "priceType",
          label: "Price Type",
          type: "select",
          options: [
            { label: "Hourly", value: "hourly" },
            { label: "Daily", value: "daily" },
            { label: "Fixed", value: "fixed" },
            { label: "Quote", value: "quote" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["grid", "list"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "provider", label: "Provider", sortable: true },
        { field: "category", label: "Category", sortable: true },
        { field: "price", label: "Price", sortable: true },
        { field: "rating", label: "Rating", sortable: true },
        { field: "location", label: "Location", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },

  primaryAction: { id: "create", label: "Create Listing", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "contact", label: "Contact Provider" },
    { id: "favorite", label: "Add to Favorites" },
  ],
};
