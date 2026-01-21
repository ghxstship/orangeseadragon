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

export const STATUS_COLORS: Record<string, string> = {
  // Project statuses
  draft: "bg-gray-500",
  planning: "bg-blue-500",
  active: "bg-green-500",
  on_hold: "bg-yellow-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
  archived: "bg-gray-400",

  // Task statuses
  backlog: "bg-gray-500",
  todo: "bg-blue-500",
  in_progress: "bg-yellow-500",
  in_review: "bg-purple-500",
  blocked: "bg-red-500",
  done: "bg-green-500",

  // Asset statuses
  available: "bg-green-500",
  in_use: "bg-blue-500",
  maintenance: "bg-yellow-500",
  reserved: "bg-purple-500",
  retired: "bg-gray-500",
  lost: "bg-red-500",
  damaged: "bg-orange-500",

  // Invoice statuses
  sent: "bg-blue-500",
  viewed: "bg-cyan-500",
  partially_paid: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  disputed: "bg-orange-500",
};

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500",
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  none: "bg-gray-500",
};

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
