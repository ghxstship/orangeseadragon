import type { PageConfig } from "./types";

export const loginsPageConfig: PageConfig = {
  id: "logins",
  title: "Login History",
  description: "Recent login sessions",
  source: { entity: "logins", defaultSorts: [{ field: "time", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Sessions", field: "count" },
      { id: "active", label: "Active Sessions", field: "activeCount" },
      { id: "locations", label: "Locations", field: "locationCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search sessions...", fields: ["device", "location"] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "device", label: "Device", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "ip", label: "IP Address", sortable: true },
        { field: "time", label: "Time", sortable: true, format: { type: "datetime" } },
        { field: "current", label: "Status", sortable: false, format: { type: "badge" } },
      ],
      defaultPageSize: 10,
      selectable: false,
    },
  },
  rowActions: [{ id: "revoke", label: "Revoke Session", variant: "destructive" }],
};
