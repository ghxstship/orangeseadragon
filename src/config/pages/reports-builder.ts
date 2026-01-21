import type { BuilderPageConfig } from "./builder-types";

export const reportsBuilderPageConfig: BuilderPageConfig = {
  id: "reports-builder",
  title: "Report Builder",
  description: "Create custom reports",
  builderType: "report",

  sidebar: {
    tools: [
      { id: "bar-chart", label: "Bar Chart", icon: "bar-chart", category: "Charts" },
      { id: "line-chart", label: "Line Chart", icon: "line-chart", category: "Charts" },
      { id: "pie-chart", label: "Pie Chart", icon: "pie-chart", category: "Charts" },
      { id: "table", label: "Table", icon: "table", category: "Data" },
      { id: "metric", label: "Metric Card", icon: "hash", category: "Data" },
      { id: "text", label: "Text Block", icon: "type", category: "Layout" },
    ],
    schema: [
      { id: "events", label: "Events", type: "table", children: [
        { id: "events.name", label: "name", type: "string" },
        { id: "events.date", label: "date", type: "date" },
        { id: "events.revenue", label: "revenue", type: "number" },
      ]},
      { id: "bookings", label: "Bookings", type: "table", children: [
        { id: "bookings.id", label: "id", type: "string" },
        { id: "bookings.amount", label: "amount", type: "number" },
        { id: "bookings.status", label: "status", type: "string" },
      ]},
      { id: "attendees", label: "Attendees", type: "table" },
      { id: "tasks", label: "Tasks", type: "table" },
      { id: "projects", label: "Projects", type: "table" },
    ],
  },

  canvas: {
    type: "report",
    gridEnabled: true,
    snapToGrid: true,
    zoomEnabled: true,
    minZoom: 50,
    maxZoom: 200,
  },

  toolbar: {
    undo: true,
    redo: true,
    preview: true,
    save: true,
    export: true,
  },

  properties: {
    enabled: true,
    position: "right",
  },

  actions: {
    save: { label: "Save Report" },
    preview: { label: "Preview" },
    export: { label: "Export", formats: ["pdf", "xlsx", "csv"] },
  },
};
