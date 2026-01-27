import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const assetsSettingsConfig: SettingsLayoutConfig = {
  title: "Assets Settings",
  description: "Configure asset management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic asset settings",
      icon: "settings",
    },
    {
      key: "categories",
      title: "Categories",
      description: "Asset categorization",
      icon: "folder",
    },
    {
      key: "tracking",
      title: "Tracking",
      description: "Asset tracking options",
      icon: "map-pin",
    },
    {
      key: "maintenance",
      title: "Maintenance",
      description: "Maintenance scheduling",
      icon: "wrench",
    },
    {
      key: "depreciation",
      title: "Depreciation",
      description: "Depreciation settings",
      icon: "trending-down",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const assetsSettingsDefaults = {
  general: {
    assetTagPrefix: "AST",
    assetTagStartNumber: "0001",
    enableBarcodes: true,
    barcodeFormat: "qr",
  },
  categories: {
    enableSubcategories: true,
    requireCategory: true,
    defaultCategory: null,
  },
  tracking: {
    enableLocationTracking: true,
    enableGPS: false,
    trackCheckouts: true,
    requireCheckoutApproval: false,
  },
  maintenance: {
    enableScheduledMaintenance: true,
    defaultMaintenanceInterval: 90,
    sendMaintenanceReminders: true,
    reminderDaysBefore: 7,
  },
  depreciation: {
    enableDepreciation: true,
    defaultMethod: "straight_line",
    defaultLifespan: 60,
  },
};
