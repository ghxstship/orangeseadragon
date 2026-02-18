import {
  isAtLeastRole,
  type RoleSlug,
  type Permission,
} from "@/lib/rbac/roles";

/**
 * ATLVS Policy Engine
 *
 * All role checks derive from the canonical SSOT at `@/lib/rbac/roles`.
 * Policy evaluation uses effective permissions (platform + project + overrides)
 * computed by the guard layer via `resolveEffectivePermissions()`.
 */

// ============================================================================
// TYPES
// ============================================================================

export type PolicyAction = Permission | string;

export type DataSensitivity = "low" | "medium" | "high" | "critical";

export interface PolicyDecisionContext {
  actorId: string;
  actorOrganizationId: string;
  roleSlug: RoleSlug | null;
  permissions: string[];
  effectivePermissions: Set<Permission>;
  resourceOwnerId?: string | null;
  resourceOrganizationId?: string | null;
  sensitivity?: DataSensitivity;
}

export interface PolicyDecision {
  allow: boolean;
  reason: string;
}

// ============================================================================
// GUARDS
// ============================================================================

function isOrgBoundaryValid(context: PolicyDecisionContext): boolean {
  if (!context.resourceOrganizationId) return true;
  return context.resourceOrganizationId === context.actorOrganizationId;
}

function passesSensitivityGuard(context: PolicyDecisionContext): boolean {
  if (!context.sensitivity) return true;

  if (context.sensitivity === "critical") {
    return isAtLeastRole(context.roleSlug, "admin") ||
      context.roleSlug === "officer";
  }

  if (context.sensitivity === "high") {
    return isAtLeastRole(context.roleSlug, "manager") ||
      context.roleSlug === "officer";
  }

  return true;
}

// ============================================================================
// POLICY EVALUATION
// ============================================================================

export function evaluatePolicy(
  action: PolicyAction,
  context: PolicyDecisionContext
): PolicyDecision {
  // Cross-org boundary check
  if (!isOrgBoundaryValid(context)) {
    return { allow: false, reason: "Cross-organization access is not permitted" };
  }

  // Sensitivity guard
  if (!passesSensitivityGuard(context)) {
    return { allow: false, reason: "Action blocked due to data sensitivity constraints" };
  }

  // Resource owner self-access for read/write
  if (
    context.resourceOwnerId &&
    context.actorId === context.resourceOwnerId &&
    (action === "entity.read" || action === "entity.write")
  ) {
    return { allow: true, reason: "Resource owners can access their own records" };
  }

  // Check effective permissions (platform + project + overrides)
  if (context.effectivePermissions.has(action as Permission)) {
    return { allow: true, reason: `Effective permission grants '${action}'` };
  }

  // Fallback: check raw permissions array (for non-canonical permission strings)
  if (context.permissions.includes(action)) {
    return { allow: true, reason: `Explicit permission grant for '${action}'` };
  }

  return { allow: false, reason: `Policy denied for action '${action}'` };
}
