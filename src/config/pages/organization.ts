import type { SettingsPageConfig } from "./settings-types";

export const organizationPageConfig: SettingsPageConfig = {
  id: "organization",
  title: "Organization",
  description: "Manage your organization settings",

  sections: [
    {
      id: "details",
      title: "Organization Details",
      description: "Basic organization information",
      columns: 1,
      fields: [
        { id: "orgName", label: "Organization Name", type: "text", defaultValue: "ATLVS Productions" },
        { id: "legalName", label: "Legal Name", type: "text", defaultValue: "ATLVS Productions LLC" },
        {
          id: "industry",
          label: "Industry",
          type: "select",
          defaultValue: "events",
          options: [
            { label: "Events & Entertainment", value: "events" },
            { label: "Hospitality", value: "hospitality" },
            { label: "Sports", value: "sports" },
            { label: "Corporate", value: "corporate" },
          ],
        },
        {
          id: "orgSize",
          label: "Organization Size",
          type: "select",
          defaultValue: "11-50",
          options: [
            { label: "1-10 employees", value: "1-10" },
            { label: "11-50 employees", value: "11-50" },
            { label: "51-200 employees", value: "51-200" },
            { label: "201-500 employees", value: "201-500" },
            { label: "500+ employees", value: "500+" },
          ],
        },
      ],
    },
    {
      id: "address",
      title: "Address",
      description: "Organization address",
      columns: 2,
      fields: [
        { id: "streetAddress", label: "Street Address", type: "text", defaultValue: "123 Event Plaza" },
        { id: "city", label: "City", type: "text", defaultValue: "Los Angeles" },
        { id: "state", label: "State/Province", type: "text", defaultValue: "CA" },
        { id: "zip", label: "ZIP/Postal Code", type: "text", defaultValue: "90001" },
        {
          id: "country",
          label: "Country",
          type: "select",
          defaultValue: "US",
          options: [
            { label: "United States", value: "US" },
            { label: "Canada", value: "CA" },
            { label: "United Kingdom", value: "UK" },
            { label: "Australia", value: "AU" },
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How to reach your organization",
      columns: 1,
      fields: [
        { id: "email", label: "Email", type: "email", defaultValue: "contact@atlvs.com" },
        { id: "phone", label: "Phone", type: "text", defaultValue: "+1 555-0100" },
        { id: "website", label: "Website", type: "url", defaultValue: "https://atlvs.com" },
      ],
    },
  ],

  layout: "single",
  actions: {
    save: { label: "Save Changes", enabled: true },
    cancel: { enabled: false },
  },
};
