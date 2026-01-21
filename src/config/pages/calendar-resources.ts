import type { PageConfig } from "./types";

export const calendarResourcesPageConfig: PageConfig = {
  id: "calendar-resources",
  title: "Resources",
  description: "Manage bookable resources and equipment",

  source: {
    entity: "resources",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Resources", field: "count" },
      { id: "available", label: "Available Now", field: "availableCount" },
      { id: "booked", label: "Currently Booked", field: "bookedCount" },
      { id: "capacity", label: "Total Capacity", field: "totalCapacity" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search resources...",
      fields: ["name", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Rooms", value: "room" },
            { label: "Vehicles", value: "vehicle" },
            { label: "Equipment", value: "equipment" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Available", value: "available" },
            { label: "Booked", value: "booked" },
          ],
        },
      ],
    },
    viewTypes: ["list", "table", "grid"],
  },

  views: {
    list: {
      titleField: "name",
      subtitleField: "location",
      badgeField: "status",
      metaFields: ["type", "capacity"],
    },
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "capacity", label: "Capacity", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { available: "#22c55e", booked: "#eab308" } } },
        { field: "location", label: "Location", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
    grid: {
      titleField: "name",
      subtitleField: "location",
      badgeField: "status",
      cardFields: ["type", "capacity"],
      columns: 3,
    },
  },

  primaryAction: {
    id: "create",
    label: "Add Resource",
    icon: "plus",
  },

  rowActions: [
    { id: "book", label: "Book" },
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit" },
    { id: "schedule", label: "View Schedule" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
