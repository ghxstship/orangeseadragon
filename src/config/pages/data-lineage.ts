import type { PageConfig } from "./types";

export const dataLineagePageConfig: PageConfig = {
  id: "data-lineage",
  title: "Data Lineage",
  description: "Track data flow and transformations",

  source: {
    entity: "lineageNodes",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Nodes", field: "totalNodes" },
      { id: "sources", label: "Sources", field: "sourceCount" },
      { id: "transforms", label: "Transformations", field: "transformCount" },
      { id: "destinations", label: "Destinations", field: "destinationCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search lineage...",
      fields: ["name", "system"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Source", value: "source" },
            { label: "Transformation", value: "transformation" },
            { label: "Destination", value: "destination" },
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
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { source: "#3b82f6", transformation: "#a855f7", destination: "#22c55e" } } },
        { field: "system", label: "System", sortable: true },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "add", label: "Add Node", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "upstream", label: "View Upstream" },
    { id: "downstream", label: "View Downstream" },
  ],
};
