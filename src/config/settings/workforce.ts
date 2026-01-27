import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const workforceSettingsConfig: SettingsLayoutConfig = {
  title: "Workforce Settings",
  description: "Configure workforce management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic workforce settings",
      icon: "settings",
    },
    {
      key: "scheduling",
      title: "Scheduling",
      description: "Shift scheduling options",
      icon: "calendar",
    },
    {
      key: "timekeeping",
      title: "Timekeeping",
      description: "Time tracking settings",
      icon: "clock",
    },
    {
      key: "certifications",
      title: "Certifications",
      description: "Credential management",
      icon: "award",
    },
    {
      key: "payroll",
      title: "Payroll",
      description: "Payroll integration",
      icon: "dollar-sign",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const workforceSettingsDefaults = {
  general: {
    defaultRole: null,
    requireEmergencyContact: true,
    enableSelfService: true,
  },
  scheduling: {
    defaultShiftDuration: 8,
    minRestBetweenShifts: 8,
    allowOvertimeScheduling: true,
    requireShiftConfirmation: true,
  },
  timekeeping: {
    enableClockInOut: true,
    allowMobileClockIn: true,
    requireGeolocation: false,
    roundingInterval: 15,
    roundingMethod: "nearest",
  },
  certifications: {
    trackExpirations: true,
    expirationWarningDays: 30,
    requireDocumentUpload: true,
    autoNotifyExpiring: true,
  },
  payroll: {
    defaultPayPeriod: "biweekly",
    overtimeThreshold: 40,
    overtimeMultiplier: 1.5,
    enablePayrollExport: true,
  },
};
