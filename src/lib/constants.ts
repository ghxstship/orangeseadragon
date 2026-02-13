/**
 * ATLVS Platform - Application Constants
 * Re-exports from centralized enums and config for backward compatibility
 */

// Re-export all enums from centralized source
export * from "./enums";

// Re-export config values (excluding DATE_FORMATS and PAGINATION which are redefined below)
export {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  formatCurrency,
  getCurrencySymbol,
} from "./config";

// Application metadata
export const APP_NAME = "ATLVS";
export const APP_DESCRIPTION = "Unified Operations Platform";

// Legacy aliases for backward compatibility
// These re-export from enums.ts with old names
export {
  SUBSCRIPTION_TIER as SUBSCRIPTION_TIERS,
  PROJECT_STATUS as PROJECT_STATUSES,
  TASK_STATUS as TASK_STATUSES,
  TASK_PRIORITY as TASK_PRIORITIES,
  EVENT_PHASE as EVENT_PHASES,
  ASSET_STATUS as ASSET_STATUSES,
  INVOICE_STATUS as INVOICE_STATUSES,
  DEAL_STAGE as DEAL_STAGES,
} from "./enums";

// Status & priority color resolution — delegates to SSOT semantic tokens
export {
  getStatusSolidClass,
  getStatusBadgeClasses,
  getStatusTextClass,
  getPrioritySolidClass,
  getPriorityBadgeClasses,
  STATUS_INTENT_MAP,
  PRIORITY_INTENT_MAP,
} from "./tokens/semantic-colors";

export const DATE_FORMATS = {
  SHORT: "MMM d, yyyy",
  LONG: "MMMM d, yyyy",
  WITH_TIME: "MMM d, yyyy h:mm a",
  TIME_ONLY: "h:mm a",
  ISO: "yyyy-MM-dd",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
