import type { SettingsPageConfig } from "./settings-types";

export const organizationSettingsPageConfig: SettingsPageConfig = {
  id: "organization-settings",
  title: "Organization Settings",
  description: "Configure general organization settings and preferences",

  sections: [
    {
      id: "general",
      title: "General Information",
      description: "Basic organization details",
      columns: 2,
      fields: [
        { id: "orgName", label: "Organization Name", type: "text", defaultValue: "Events Pro Inc" },
        { id: "orgSlug", label: "Organization Slug", type: "text", defaultValue: "events-pro-inc" },
        { id: "description", label: "Description", type: "textarea", defaultValue: "Leading event management and production company", columns: 2 },
        { id: "website", label: "Website", type: "url", defaultValue: "https://eventspro.com" },
        { id: "contactEmail", label: "Contact Email", type: "email", defaultValue: "contact@eventspro.com" },
      ],
    },
    {
      id: "regional",
      title: "Regional Settings",
      description: "Timezone and localization preferences",
      columns: 2,
      fields: [
        {
          id: "timezone",
          label: "Timezone",
          type: "select",
          defaultValue: "america-los-angeles",
          options: [
            { label: "America/Los_Angeles (PST)", value: "america-los-angeles" },
            { label: "America/New_York (EST)", value: "america-new-york" },
            { label: "America/Chicago (CST)", value: "america-chicago" },
            { label: "Europe/London (GMT)", value: "europe-london" },
            { label: "Asia/Tokyo (JST)", value: "asia-tokyo" },
          ],
        },
        {
          id: "dateFormat",
          label: "Date Format",
          type: "select",
          defaultValue: "mdy",
          options: [
            { label: "MM/DD/YYYY", value: "mdy" },
            { label: "DD/MM/YYYY", value: "dmy" },
            { label: "YYYY-MM-DD", value: "ymd" },
          ],
        },
        {
          id: "currency",
          label: "Default Currency",
          type: "select",
          defaultValue: "usd",
          options: [
            { label: "USD - US Dollar", value: "usd" },
            { label: "EUR - Euro", value: "eur" },
            { label: "GBP - British Pound", value: "gbp" },
            { label: "CAD - Canadian Dollar", value: "cad" },
            { label: "AUD - Australian Dollar", value: "aud" },
          ],
        },
        {
          id: "language",
          label: "Language",
          type: "select",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Spanish", value: "es" },
            { label: "French", value: "fr" },
            { label: "German", value: "de" },
          ],
        },
      ],
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      description: "Configure organization-wide notification settings",
      fields: [
        { id: "emailNotifications", label: "Email Notifications", type: "toggle", description: "Receive email updates for important events", defaultValue: true },
        { id: "weeklyDigest", label: "Weekly Digest", type: "toggle", description: "Receive a weekly summary of activity", defaultValue: true },
        { id: "marketingComms", label: "Marketing Communications", type: "toggle", description: "Receive product updates and announcements", defaultValue: false },
      ],
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Organization security preferences",
      fields: [
        { id: "require2fa", label: "Require Two-Factor Authentication", type: "toggle", description: "Require 2FA for all team members", defaultValue: false },
        {
          id: "sessionTimeout",
          label: "Session Timeout",
          type: "select",
          description: "Automatically log out inactive users",
          defaultValue: "24h",
          options: [
            { label: "1 hour", value: "1h" },
            { label: "8 hours", value: "8h" },
            { label: "24 hours", value: "24h" },
            { label: "7 days", value: "7d" },
          ],
        },
      ],
    },
  ],

  actions: {
    save: { label: "Save All Changes", enabled: true },
    cancel: { enabled: false },
  },
};
