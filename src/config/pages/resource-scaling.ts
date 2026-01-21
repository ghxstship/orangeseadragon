import type { SettingsPageConfig } from "./settings-types";

export const resourceScalingPageConfig: SettingsPageConfig = {
  id: "resource-scaling",
  title: "Resource Scaling",
  description: "Manage auto-scaling and resource allocation",

  sections: [
    {
      id: "settings",
      title: "Scaling Settings",
      description: "Global auto-scaling configuration",
      columns: 1,
      fields: [
        { id: "enableAutoScaling", label: "Enable Auto-Scaling", type: "toggle", description: "Automatically adjust resources based on demand", defaultValue: true },
        { id: "predictiveScaling", label: "Predictive Scaling", type: "toggle", description: "Use ML to predict and pre-scale resources", defaultValue: false },
        { id: "scaleInProtection", label: "Scale-in Protection", type: "toggle", description: "Prevent scaling down during deployments", defaultValue: true },
        { id: "scalingNotifications", label: "Scaling Notifications", type: "toggle", description: "Send alerts when scaling events occur", defaultValue: true },
      ],
    },
  ],

  layout: "single",
  actions: {
    save: { label: "Save Changes", enabled: true },
    cancel: { enabled: false },
  },
};
