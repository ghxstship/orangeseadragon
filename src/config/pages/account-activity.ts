import type { PageConfig } from "./types";

export const accountActivityPageConfig: PageConfig = {
  id: "account-activity",
  title: "Activity",
  description: "Recent account activity",
  source: { entity: "account_activity", defaultSorts: [{ field: "time", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Activities", field: "count" },
      { id: "events", label: "Events", field: "eventCount" },
      { id: "settings", label: "Settings Changes", field: "settingsCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search activities...", fields: ["action", "item"] },
    filters: { enabled: true, fields: [{ field: "type", label: "Type", type: "select", options: [{ label: "Event", value: "event" }, { label: "Settings", value: "settings" }, { label: "User", value: "user" }, { label: "Document", value: "document" }] }] },
    columns: { enabled: false },
    viewTypes: ["list"],
  },
  views: {
    list: { titleField: "action", subtitleField: "item", metaFields: ["time", "type"] },
  },
};
