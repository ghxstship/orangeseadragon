/**
 * SEMANTIC COLOR TOKENS — Single Source of Truth
 *
 * All status, priority, and categorical color mappings live here.
 * Components MUST import from this module rather than defining local color maps.
 *
 * These tokens resolve to CSS custom properties defined in globals.css and
 * emitted by the white-label theme engine, making them fully overridable
 * per tenant without code changes.
 *
 * Architecture:
 *   globals.css  →  defines --semantic-* CSS variables (defaults)
 *   tailwind.config.ts  →  maps CSS vars to Tailwind utilities
 *   white-label.ts  →  emits overrides per tenant
 *   THIS FILE  →  maps status/priority strings to Tailwind class sets
 */

// ─────────────────────────────────────────────────────────────
// SEMANTIC INTENT → CSS VARIABLE MAPPING
// Each "intent" maps to a CSS variable defined in globals.css.
// The Tailwind classes below reference these via the tailwind config.
// ─────────────────────────────────────────────────────────────

export type SemanticIntent =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent"
  | "purple"
  | "cyan"
  | "orange"
  | "indigo";

/**
 * Badge-style class set: translucent bg, solid text, subtle border + glow.
 * Used by StatusBadge, PriorityBadge, and any inline status indicator.
 */
export const SEMANTIC_BADGE_CLASSES: Record<SemanticIntent, string> = {
  success:
    "bg-semantic-success/10 text-semantic-success border-semantic-success/20 shadow-[0_0_10px_hsl(var(--semantic-success)/0.2)]",
  warning:
    "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20 shadow-[0_0_10px_hsl(var(--semantic-warning)/0.2)]",
  danger:
    "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_hsl(var(--destructive)/0.2)]",
  info:
    "bg-semantic-info/10 text-semantic-info border-semantic-info/20 shadow-[0_0_10px_hsl(var(--semantic-info)/0.2)]",
  neutral: "bg-muted text-muted-foreground border-border",
  accent:
    "bg-semantic-accent/10 text-semantic-accent border-semantic-accent/20",
  purple:
    "bg-semantic-purple/10 text-semantic-purple border-semantic-purple/20",
  cyan:
    "bg-semantic-cyan/10 text-semantic-cyan border-semantic-cyan/20 shadow-[0_0_10px_hsl(var(--semantic-cyan)/0.2)]",
  orange:
    "bg-semantic-orange/10 text-semantic-orange border-semantic-orange/20",
  indigo:
    "bg-semantic-indigo/10 text-semantic-indigo border-semantic-indigo/20",
};

/**
 * Solid background class (for dots, progress bars, calendar chips).
 */
export const SEMANTIC_SOLID_CLASSES: Record<SemanticIntent, string> = {
  success: "bg-semantic-success",
  warning: "bg-semantic-warning",
  danger: "bg-destructive",
  info: "bg-semantic-info",
  neutral: "bg-muted-foreground",
  accent: "bg-semantic-accent",
  purple: "bg-semantic-purple",
  cyan: "bg-semantic-cyan",
  orange: "bg-semantic-orange",
  indigo: "bg-semantic-indigo",
};

/**
 * Text-only class (for inline colored text without background).
 */
export const SEMANTIC_TEXT_CLASSES: Record<SemanticIntent, string> = {
  success: "text-semantic-success",
  warning: "text-semantic-warning",
  danger: "text-destructive",
  info: "text-semantic-info",
  neutral: "text-muted-foreground",
  accent: "text-semantic-accent",
  purple: "text-semantic-purple",
  cyan: "text-semantic-cyan",
  orange: "text-semantic-orange",
  indigo: "text-semantic-indigo",
};

// ─────────────────────────────────────────────────────────────
// STATUS → INTENT MAPPING
// Maps every known status string to a semantic intent.
// ─────────────────────────────────────────────────────────────

export const STATUS_INTENT_MAP: Record<string, SemanticIntent> = {
  // General lifecycle
  draft: "neutral",
  pending: "warning",
  active: "success",
  completed: "info",
  cancelled: "danger",
  archived: "neutral",

  // Project
  planning: "cyan",
  on_hold: "warning",

  // Task
  backlog: "neutral",
  todo: "info",
  in_progress: "warning",
  in_review: "purple",
  blocked: "danger",
  done: "success",

  // Asset
  available: "success",
  in_use: "info",
  maintenance: "warning",
  reserved: "purple",
  retired: "neutral",
  lost: "danger",
  damaged: "orange",

  // Invoice
  sent: "info",
  viewed: "cyan",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
  disputed: "orange",

  // Event phases
  concept: "neutral",
  pre_production: "warning",
  setup: "orange",
  live: "danger",
  teardown: "purple",
  post_mortem: "indigo",

  // Deal stages
  lead: "neutral",
  qualified: "info",
  proposal: "warning",
  negotiation: "purple",
  won: "success",

  // Booking
  confirmed: "success",
  tentative: "warning",

  // Approval
  approved: "success",
  rejected: "danger",
  review: "warning",

  // Crew / advancing
  invited: "info",
  declined: "danger",
  checked_in: "purple",
  checked_out: "neutral",
  no_show: "danger",
  scheduled: "warning",
};

/**
 * Resolve a status string to its full badge class set.
 * Falls back to neutral for unknown statuses.
 */
export function getStatusBadgeClasses(status: string): string {
  const intent = STATUS_INTENT_MAP[status.toLowerCase()] ?? "neutral";
  return SEMANTIC_BADGE_CLASSES[intent];
}

/**
 * Resolve a status string to its solid background class.
 */
export function getStatusSolidClass(status: string): string {
  const intent = STATUS_INTENT_MAP[status.toLowerCase()] ?? "neutral";
  return SEMANTIC_SOLID_CLASSES[intent];
}

/**
 * Resolve a status string to its text color class.
 */
export function getStatusTextClass(status: string): string {
  const intent = STATUS_INTENT_MAP[status.toLowerCase()] ?? "neutral";
  return SEMANTIC_TEXT_CLASSES[intent];
}

// ─────────────────────────────────────────────────────────────
// PRIORITY → INTENT MAPPING
// ─────────────────────────────────────────────────────────────

export const PRIORITY_INTENT_MAP: Record<string, SemanticIntent> = {
  urgent: "danger",
  critical: "danger",
  high: "orange",
  medium: "warning",
  low: "info",
  none: "neutral",
};

/**
 * Resolve a priority string to its full badge class set.
 */
export function getPriorityBadgeClasses(priority: string): string {
  const intent = PRIORITY_INTENT_MAP[priority.toLowerCase()] ?? "neutral";
  return SEMANTIC_BADGE_CLASSES[intent];
}

/**
 * Resolve a priority string to its solid background class.
 */
export function getPrioritySolidClass(priority: string): string {
  const intent = PRIORITY_INTENT_MAP[priority.toLowerCase()] ?? "neutral";
  return SEMANTIC_SOLID_CLASSES[intent];
}

// ─────────────────────────────────────────────────────────────
// LEAVE TYPE → INTENT MAPPING
// ─────────────────────────────────────────────────────────────

export const LEAVE_TYPE_INTENT_MAP: Record<string, SemanticIntent> = {
  annual: "success",
  sick: "danger",
  parental: "purple",
  bereavement: "neutral",
  study: "info",
  unpaid: "warning",
};

/**
 * Resolve a leave type to its solid background class.
 */
export function getLeaveTypeSolidClass(leaveType: string): string {
  const intent = LEAVE_TYPE_INTENT_MAP[leaveType.toLowerCase()] ?? "neutral";
  return SEMANTIC_SOLID_CLASSES[intent];
}

/**
 * Resolve a leave type to its text color class.
 */
export function getLeaveTypeTextClass(leaveType: string): string {
  const intent = LEAVE_TYPE_INTENT_MAP[leaveType.toLowerCase()] ?? "neutral";
  return SEMANTIC_TEXT_CLASSES[intent];
}
