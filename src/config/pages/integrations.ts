import type { PageConfig } from "./types";

export const integrationsPageConfig: PageConfig = {
  id: "integrations",
  title: "Integrations",
  description: "Connect third-party services",
  source: { entity: "integrations", defaultSorts: [{ field: "name", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Integrations", field: "count" },
      { id: "connected", label: "Connected", field: "connectedCount" },
      { id: "disconnected", label: "Disconnected", field: "disconnectedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search integrations...", fields: ["name", "description"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Connected", value: "connected" }, { label: "Disconnected", value: "disconnected" }] }] },
    columns: { enabled: false },
    viewTypes: ["grid"],
  },
  views: {
    grid: {
      titleField: "name",
      subtitleField: "description",
      badgeField: "status",
      cardFields: ["description"],
      columns: 2,
    },
  },
  rowActions: [{ id: "manage", label: "Manage" }, { id: "connect", label: "Connect" }, { id: "disconnect", label: "Disconnect" }],
};
