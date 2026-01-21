import type { SettingsPageConfig } from "./settings-types";

export const passwordPolicyPageConfig: SettingsPageConfig = {
  id: "password-policy",
  title: "Password Policy",
  description: "Configure password requirements and security",

  sections: [
    {
      id: "requirements",
      title: "Password Requirements",
      description: "Minimum password complexity rules",
      columns: 1,
      fields: [
        { id: "minLength", label: "Minimum Length", type: "number", defaultValue: 12, description: "Minimum 8 characters recommended" },
        { id: "requireUppercase", label: "Require Uppercase", type: "toggle", description: "At least one uppercase letter (A-Z)", defaultValue: true },
        { id: "requireLowercase", label: "Require Lowercase", type: "toggle", description: "At least one lowercase letter (a-z)", defaultValue: true },
        { id: "requireNumbers", label: "Require Numbers", type: "toggle", description: "At least one number (0-9)", defaultValue: true },
        { id: "requireSpecial", label: "Require Special Characters", type: "toggle", description: "At least one special character (!@#$%^&*)", defaultValue: true },
      ],
    },
    {
      id: "expiration",
      title: "Password Expiration",
      description: "Password rotation and history settings",
      columns: 1,
      fields: [
        { id: "enableExpiration", label: "Enable Password Expiration", type: "toggle", description: "Force periodic password changes", defaultValue: true },
        {
          id: "expirationPeriod",
          label: "Expiration Period",
          type: "select",
          defaultValue: "90",
          options: [
            { label: "30 days", value: "30" },
            { label: "60 days", value: "60" },
            { label: "90 days", value: "90" },
            { label: "180 days", value: "180" },
            { label: "1 year", value: "365" },
          ],
        },
        { id: "passwordHistory", label: "Password History", type: "number", defaultValue: 5, description: "Number of previous passwords that cannot be reused" },
        {
          id: "minPasswordAge",
          label: "Minimum Password Age",
          type: "select",
          description: "Minimum time before password can be changed again",
          defaultValue: "0",
          options: [
            { label: "No minimum", value: "0" },
            { label: "1 day", value: "1" },
            { label: "7 days", value: "7" },
          ],
        },
      ],
    },
    {
      id: "lockout",
      title: "Account Lockout",
      description: "Failed login attempt protection",
      columns: 1,
      fields: [
        { id: "enableLockout", label: "Enable Account Lockout", type: "toggle", description: "Lock account after failed attempts", defaultValue: true },
        { id: "failedAttempts", label: "Failed Attempts Before Lockout", type: "number", defaultValue: 5 },
        {
          id: "lockoutDuration",
          label: "Lockout Duration",
          type: "select",
          defaultValue: "15",
          options: [
            { label: "5 minutes", value: "5" },
            { label: "15 minutes", value: "15" },
            { label: "30 minutes", value: "30" },
            { label: "1 hour", value: "60" },
            { label: "Until admin unlock", value: "0" },
          ],
        },
        {
          id: "resetCounterAfter",
          label: "Reset Counter After",
          type: "select",
          description: "Time after which failed attempt counter resets",
          defaultValue: "15",
          options: [
            { label: "5 minutes", value: "5" },
            { label: "15 minutes", value: "15" },
            { label: "30 minutes", value: "30" },
            { label: "1 hour", value: "60" },
          ],
        },
      ],
    },
    {
      id: "additional",
      title: "Additional Security",
      description: "Extra password security options",
      columns: 1,
      fields: [
        { id: "checkBreached", label: "Check Against Breached Passwords", type: "toggle", description: "Prevent use of known compromised passwords", defaultValue: true },
        { id: "blockCommon", label: "Block Common Passwords", type: "toggle", description: "Prevent easily guessable passwords", defaultValue: true },
        { id: "blockUsername", label: "Block Username in Password", type: "toggle", description: "Prevent password containing username", defaultValue: true },
        { id: "require2faReset", label: "Require 2FA for Password Reset", type: "toggle", description: "Extra verification for password changes", defaultValue: false },
      ],
    },
  ],

  layout: "single",
  actions: {
    save: { label: "Save Changes", enabled: true },
    cancel: { enabled: false },
  },
};
