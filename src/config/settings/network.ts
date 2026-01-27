import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const networkSettingsConfig: SettingsLayoutConfig = {
  title: "Network Settings",
  description: "Configure network and contacts settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic network settings",
      icon: "settings",
    },
    {
      key: "contacts",
      title: "Contacts",
      description: "Contact management",
      icon: "users",
    },
    {
      key: "vendors",
      title: "Vendors",
      description: "Vendor settings",
      icon: "building",
    },
    {
      key: "agencies",
      title: "Agencies",
      description: "Agency management",
      icon: "briefcase",
    },
    {
      key: "venues",
      title: "Venues",
      description: "Venue settings",
      icon: "map-pin",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const networkSettingsDefaults = {
  general: {
    enableDuplicateDetection: true,
    mergeStrategy: "manual",
  },
  contacts: {
    requireEmail: false,
    requirePhone: false,
    enableContactSync: false,
    syncProvider: null,
  },
  vendors: {
    requireW9: true,
    requireInsurance: true,
    insuranceMinimum: 1000000,
    vendorApprovalRequired: true,
  },
  agencies: {
    defaultCommissionRate: 10,
    trackBookings: true,
    enableAgencyPortal: false,
  },
  venues: {
    trackCapacity: true,
    requireFloorPlan: false,
    enableVenueSearch: true,
  },
};
