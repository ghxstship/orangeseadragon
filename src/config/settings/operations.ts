import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const operationsSettingsConfig: SettingsLayoutConfig = {
  title: "Operations Settings",
  description: "Configure operations management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic operations settings",
      icon: "settings",
    },
    {
      key: "venues",
      title: "Venues",
      description: "Venue operations",
      icon: "map-pin",
    },
    {
      key: "zones",
      title: "Zones",
      description: "Zone management",
      icon: "layout",
    },
    {
      key: "incidents",
      title: "Incidents",
      description: "Incident reporting",
      icon: "alert-triangle",
    },
    {
      key: "communications",
      title: "Communications",
      description: "Radio and comms",
      icon: "radio",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const operationsSettingsDefaults = {
  general: {
    enableRealTimeTracking: true,
    defaultTimezone: "America/Los_Angeles",
  },
  venues: {
    requireFloorPlan: true,
    enableCapacityTracking: true,
    capacityWarningThreshold: 90,
  },
  zones: {
    enableZoneColors: true,
    trackZoneOccupancy: true,
    enableZoneAlerts: true,
  },
  incidents: {
    requireIncidentReport: true,
    incidentCategories: ["medical", "security", "weather", "technical", "other"],
    autoNotifyManagement: true,
    escalationThresholdMinutes: 15,
  },
  communications: {
    enableRadioChannels: true,
    defaultChannelCount: 10,
    enableChannelLogging: false,
  },
};
