import type { SettingsLayoutConfig } from "@/lib/layouts/types";

export const financeSettingsConfig: SettingsLayoutConfig = {
  title: "Finance Settings",
  description: "Configure financial management settings",
  defaultSection: "general",
  navigation: {
    position: "left",
    sticky: true,
  },
  sections: [
    {
      key: "general",
      title: "General",
      description: "Basic financial settings",
      icon: "settings",
    },
    {
      key: "invoicing",
      title: "Invoicing",
      description: "Invoice configuration",
      icon: "file-text",
    },
    {
      key: "expenses",
      title: "Expenses",
      description: "Expense management",
      icon: "receipt",
    },
    {
      key: "payments",
      title: "Payments",
      description: "Payment processing",
      icon: "credit-card",
    },
    {
      key: "taxes",
      title: "Taxes",
      description: "Tax configuration",
      icon: "percent",
    },
  ],
  actions: {
    save: { id: "save", label: "Save Changes", icon: "save" },
    reset: { id: "reset", label: "Reset", icon: "rotate-ccw" },
  },
};

export const financeSettingsDefaults = {
  general: {
    defaultCurrency: "USD",
    fiscalYearStart: "january",
    decimalPlaces: 2,
    thousandsSeparator: ",",
  },
  invoicing: {
    invoicePrefix: "INV",
    invoiceStartNumber: "001",
    paymentTermsDays: 30,
    autoSendReminders: true,
    reminderDaysBeforeDue: 7,
  },
  expenses: {
    requireApproval: true,
    approvalThreshold: 500,
    allowReceipts: true,
    requireReceipts: false,
  },
  payments: {
    acceptedMethods: ["credit_card", "bank_transfer", "check"],
    defaultMethod: "bank_transfer",
    autoReconcile: false,
  },
  taxes: {
    enableTaxCalculation: true,
    defaultTaxRate: 0,
    taxIdLabel: "Tax ID",
  },
};
