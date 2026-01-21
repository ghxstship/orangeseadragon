import type { SettingsPageConfig } from "./settings-types";

export const rateLimitsSettingsPageConfig: SettingsPageConfig = {
  id: "rate-limits-settings",
  title: "Rate Limits",
  description: "Monitor API usage and rate limit status",

  sections: [
    {
      id: "settings",
      title: "Rate Limit Settings",
      description: "Configure rate limit behavior",
      columns: 1,
      fields: [
        { id: "rateLimitAlerts", label: "Rate Limit Alerts", type: "toggle", description: "Get notified when approaching limits", defaultValue: true },
        {
          id: "alertThreshold",
          label: "Alert Threshold",
          type: "select",
          description: "Notify when usage exceeds this percentage",
          defaultValue: "80",
          options: [
            { label: "70%", value: "70" },
            { label: "80%", value: "80" },
            { label: "90%", value: "90" },
          ],
        },
        { id: "retryAfterHeaders", label: "Retry-After Headers", type: "toggle", description: "Include retry timing in rate limit responses", defaultValue: true },
      ],
    },
  ],

  layout: "single",
  actions: {
    save: { label: "Save Changes", enabled: true },
    cancel: { enabled: false },
  },
};
