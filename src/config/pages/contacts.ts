import type { PageConfig } from "./types";

export const contactsPageConfig: PageConfig = {
  id: "contacts",
  title: "Contacts",
  description: "Manage your contact directory",

  source: {
    entity: "contacts",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Contacts", field: "count" },
      { id: "favorites", label: "Favorites", field: "favoritesCount" },
      { id: "vendors", label: "Vendors", field: "vendorsCount" },
      { id: "artists", label: "Artists", field: "artistsCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search contacts...",
      fields: ["name", "company", "email"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Vendor", value: "vendor" },
            { label: "Client", value: "client" },
            { label: "Artist", value: "artist" },
            { label: "Venue", value: "venue" },
            { label: "Sponsor", value: "sponsor" },
            { label: "Media", value: "media" },
            { label: "Government", value: "government" },
            { label: "Internal", value: "internal" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "company", label: "Company" },
        { field: "role", label: "Role" },
        { field: "category", label: "Category", format: { type: "badge" } },
        { field: "email", label: "Email" },
        { field: "phone", label: "Phone" },
      ],
    },
    list: {
      titleField: "name",
      subtitleField: "role",
      badgeField: "category",
      metaFields: ["company", "email", "phone"],
    },
    grid: {
      titleField: "name",
      subtitleField: "role",
      badgeField: "category",
      cardFields: ["company", "email", "phone", "location"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "add",
    label: "Add Contact",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Profile" },
    { id: "edit", label: "Edit Contact" },
    { id: "email", label: "Send Email" },
    { id: "call", label: "Call" },
    { id: "favorite", label: "Toggle Favorite" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
