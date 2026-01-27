import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const productionSettingsConfig: SettingsLayoutConfig = {
  title: "Production Settings",
  description: "Configure production management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic production settings",
      icon: "settings",
    },
    {
      key: "events",
      title: "Events",
      description: "Event configuration",
      icon: "calendar",
    },
    {
      key: "shows",
      title: "Shows",
      description: "Show management",
      icon: "music",
    },
    {
      key: "advancing",
      title: "Advancing",
      description: "Advancing workflow",
      icon: "check-square",
    },
    {
      key: "techSpecs",
      title: "Tech Specs",
      description: "Technical specifications",
      icon: "file-code",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const productionSettingsDefaults = {
  general: {
    defaultEventType: "concert",
    enableEventTemplates: true,
    requireEventApproval: false,
  },
  events: {
    eventPrefix: "EVT",
    defaultDuration: 4,
    enableMultiDay: true,
    requireVenue: true,
  },
  shows: {
    defaultShowDuration: 90,
    enableSetlist: true,
    trackSoundcheck: true,
    defaultSoundcheckDuration: 60,
  },
  advancing: {
    advancingDeadlineDays: 14,
    requireTechRider: true,
    requireHospitalityRider: true,
    autoSendReminders: true,
  },
  techSpecs: {
    requireApproval: true,
    versionControl: true,
    enablePdfExport: true,
  },
};
