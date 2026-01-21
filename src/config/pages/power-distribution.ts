import type { PageConfig } from "./types";

export const powerDistributionPageConfig: PageConfig = {
  id: "power-distribution",
  title: "Power Distribution",
  source: {
    entity: "power-distributions",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },
  stats: {
    enabled: true,
    items: [
      { id: "capacity", label: "Total Capacity", field: "totalCapacity" },
      { id: "load", label: "Current Load", field: "totalLoad" },
      { id: "distributions", label: "Distributions", field: "count" },
      { id: "overloads", label: "Overload Warnings", field: "overloadCount" },
    ],
  },
  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search power systems...",
      fields: ["name", "location", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "active" },
            { label: "Standby", value: "standby" },
            { label: "Overload", value: "overload" },
            { label: "Offline", value: "offline" },
          ],
        },
      ],
    },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "location", label: "Location" },
        { field: "eventName", label: "Event" },
        { field: "status", label: "Status", format: { type: "badge", colorMap: { active: "#22c55e", standby: "#3b82f6", overload: "#ef4444", offline: "#6b7280" } } },
        { field: "currentLoad", label: "Load", align: "right" },
        { field: "totalCapacity", label: "Capacity", align: "right" },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    list: {
      titleField: "name",
      subtitleField: "location",
      badgeField: "status",
      metaFields: ["eventName", "currentLoad", "totalCapacity"],
    },
  },
  primaryAction: {
    id: "create",
    label: "Add Distribution",
    icon: "plus",
  },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Configuration" },
    { id: "circuit", label: "Add Circuit" },
    { id: "export", label: "Export Report" },
  ],
};
