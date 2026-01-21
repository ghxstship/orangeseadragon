import type { SettingsPageConfig } from "./settings-types";

export const accountProfilePageConfig: SettingsPageConfig = {
  id: "account-profile",
  title: "Profile",
  description: "Manage your personal profile",

  sections: [
    {
      id: "personal",
      title: "Personal Information",
      description: "Update your profile details",
      columns: 2,
      fields: [
        { id: "firstName", label: "First Name", type: "text", defaultValue: "Sarah" },
        { id: "lastName", label: "Last Name", type: "text", defaultValue: "Chen" },
        { id: "email", label: "Email", type: "email", defaultValue: "sarah@example.com" },
        { id: "phone", label: "Phone", type: "tel", defaultValue: "+1 555-0101" },
        { id: "jobTitle", label: "Job Title", type: "text", defaultValue: "Event Director", columns: 2 },
      ],
    },
  ],

  actions: {
    save: { label: "Save Changes", enabled: true },
    cancel: { enabled: false },
  },
};
