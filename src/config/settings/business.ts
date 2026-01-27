import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const businessSettingsConfig: SettingsLayoutConfig = {
  title: "Business Settings",
  description: "Configure business and CRM settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic business settings",
      icon: "settings",
    },
    {
      key: "pipeline",
      title: "Pipeline",
      description: "Sales pipeline stages",
      icon: "git-branch",
    },
    {
      key: "leads",
      title: "Leads",
      description: "Lead management",
      icon: "user-plus",
    },
    {
      key: "proposals",
      title: "Proposals",
      description: "Proposal templates",
      icon: "file-text",
    },
    {
      key: "contracts",
      title: "Contracts",
      description: "Contract settings",
      icon: "file-signature",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const businessSettingsDefaults = {
  general: {
    companyName: "",
    defaultCurrency: "USD",
    fiscalYearStart: "january",
  },
  pipeline: {
    stages: ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"],
    defaultStage: "lead",
    enableProbability: true,
  },
  leads: {
    autoAssignment: false,
    leadSources: ["website", "referral", "cold_call", "event", "other"],
    requireSource: true,
    leadScoring: false,
  },
  proposals: {
    proposalPrefix: "PROP",
    defaultValidityDays: 30,
    requireApproval: false,
    enableESignature: true,
  },
  contracts: {
    contractPrefix: "CON",
    defaultTermMonths: 12,
    autoRenewal: false,
    renewalNoticeDays: 30,
  },
};
