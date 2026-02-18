import { createClient } from "@/lib/supabase/server";
import { unauthorized, forbidden } from "@/lib/api/response";
import { evaluatePolicy, type PolicyAction } from "@/lib/api/policy";
import { logWarn } from "@/lib/observability";
import {
  normalizeRoleSlug,
  normalizeProjectRoleSlug,
  getRoleLevel,
  isResourceForbidden,
  resolveEffectivePermissions,
  type RoleSlug,
  type PlatformRoleSlug,
  type ProjectRoleSlug,
  type Permission,
  type PermissionOverride,
} from "@/lib/rbac/roles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * ATLVS API Auth Guard
 *
 * All role resolution derives from the canonical SSOT at `@/lib/rbac/roles`.
 *
 * Resolution paths:
 *   1. Platform role: `user_roles` table → canonical slug normalization
 *   2. Project role:  `project_members` table → project slug normalization
 *   3. Overrides:     `permission_overrides` table → org + project feature flags
 *
 * Effective permissions = platform base ∪ project base ∪ explicit grants,
 *   then org overrides applied, then project overrides applied.
 */

// ============================================================================
// TYPES
// ============================================================================

export type { RoleSlug, PlatformRoleSlug, ProjectRoleSlug, Permission };
export type DataSensitivity = 'low' | 'medium' | 'high' | 'critical';

export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
  error?: never;
}

export interface AuthError {
  user?: never;
  supabase?: never;
  error: ReturnType<typeof unauthorized> | ReturnType<typeof forbidden>;
}

export interface OrgMemberContext extends AuthContext {
  membership: {
    id: string;
    organization_id: string;
    role_slug: PlatformRoleSlug;
    role_name: string | null;
    permissions: string[];
    effectivePermissions: Set<Permission>;
    project_role_slug: ProjectRoleSlug | null;
    project_id: string | null;
    department_scope: string[] | null;
    project_scope: string[] | null;
    venue_scope: string[] | null;
    status: string;
  };
}

export interface OrgMemberError {
  user?: never;
  supabase?: never;
  membership?: never;
  error: ReturnType<typeof unauthorized> | ReturnType<typeof forbidden>;
}

function getMetadataOrganizationId(user: User): string | null {
  const metadataOrgId = (
    user.user_metadata as { organization_id?: string } | null | undefined
  )?.organization_id;
  return typeof metadataOrgId === "string" && metadataOrgId.length > 0
    ? metadataOrgId
    : null;
}

// ============================================================================
// AUTH GUARD
// ============================================================================

/**
 * Verify the request is from an authenticated user.
 * Returns the user and supabase client, or an error response.
 */
export async function requireAuth(): Promise<AuthContext | AuthError> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: unauthorized() };
  }

  return { user, supabase };
}

// ============================================================================
// ORG MEMBERSHIP GUARD
// ============================================================================

/**
 * Verify the request is from an authenticated user who is an active member
 * of the specified organization.
 *
 * Resolution:
 *   1. Platform role from `user_roles` (highest-level active role)
 *   2. Project role from `project_members` (if projectId provided)
 *   3. Permission overrides from `permission_overrides` (org + project)
 *   4. Effective permissions computed via `resolveEffectivePermissions()`
 */
export async function requireOrgMember(
  orgId?: string,
  projectId?: string | null,
): Promise<OrgMemberContext | OrgMemberError> {
  const auth = await requireAuth();
  if (auth.error) return auth;

  const { user, supabase } = auth;
  const metadataOrgId = getMetadataOrganizationId(user);
  const resolvedOrgId = orgId ?? metadataOrgId;

  if (!resolvedOrgId) {
    return { error: forbidden("No organization context available") };
  }

  // 1. Resolve platform roles
  const { data: userRoles, error: roleError } = await supabase
    .from("user_roles")
    .select("id, organization_id, role_slug, permissions, created_at")
    .eq("user_id", user.id)
    .eq("organization_id", resolvedOrgId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (roleError) {
    logWarn('guard.requireOrgMember.roleLookupFailed', {
      code: roleError.code,
      orgId: resolvedOrgId,
    });
    return { error: forbidden("Failed to resolve organization membership") };
  }

  if (!userRoles || userRoles.length === 0) {
    return { error: forbidden("Not a member of this organization") };
  }

  const sortedRoles = [...userRoles].sort((a, b) => {
    return getRoleLevel(normalizeRoleSlug(b.role_slug)) - getRoleLevel(normalizeRoleSlug(a.role_slug));
  });

  const primaryRoleRow = sortedRoles[0]!;
  const canonicalSlug = normalizeRoleSlug(primaryRoleRow.role_slug);

  if (!canonicalSlug) {
    logWarn('guard.requireOrgMember.unknownRoleSlug', {
      slug: primaryRoleRow.role_slug,
      orgId: resolvedOrgId,
    });
    return { error: forbidden(`Unknown role '${primaryRoleRow.role_slug}'`) };
  }

  // Aggregate explicit permissions from all active platform roles
  const explicitPermissions: string[] = [];
  for (const row of userRoles) {
    if (Array.isArray(row.permissions)) {
      for (const p of row.permissions) {
        explicitPermissions.push(p);
      }
    }
  }

  // 2. Resolve project role (if project context provided)
  let projectRoleSlug: ProjectRoleSlug | null = null;
  if (projectId) {
    const { data: projectMember } = await supabase
      .from("project_members")
      .select("project_role_slug")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("is_active", true)
      .maybeSingle();

    if (projectMember?.project_role_slug) {
      projectRoleSlug = normalizeProjectRoleSlug(projectMember.project_role_slug);
    }
  }

  // 3. Resolve permission overrides (org-level + project-level)
  const overrides: PermissionOverride[] = [];
  const overrideFilters = [
    { scope: 'organization' as const, scope_id: resolvedOrgId },
    ...(projectId ? [{ scope: 'project' as const, scope_id: projectId }] : []),
  ];

  for (const filter of overrideFilters) {
    const { data: rows } = await supabase
      .from("permission_overrides")
      .select("scope, scope_id, user_id, role_slug, permission, action")
      .eq("scope", filter.scope)
      .eq("scope_id", filter.scope_id)
      .eq("is_active", true)
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .or(`role_slug.eq.${canonicalSlug},role_slug.is.null`);

    if (rows) {
      for (const row of rows) {
        // Override applies if it targets this user, this role, or is global (both null)
        const matchesUser = !row.user_id || row.user_id === user.id;
        const matchesRole = !row.role_slug || row.role_slug === canonicalSlug;
        if (matchesUser && matchesRole) {
          overrides.push(row as PermissionOverride);
        }
      }
    }
  }

  // 4. Compute effective permissions
  const effectivePermissions = resolveEffectivePermissions(
    canonicalSlug,
    projectRoleSlug,
    explicitPermissions,
    overrides,
  );

  // 5. Resolve scoped access from organization_members (if present)
  const { data: memberRow } = await supabase
    .from("organization_members")
    .select("department_scope, project_scope, venue_scope")
    .eq("user_id", user.id)
    .eq("organization_id", resolvedOrgId)
    .eq("status", "active")
    .maybeSingle();

  return {
    user,
    supabase,
    membership: {
      id: primaryRoleRow.id,
      organization_id: primaryRoleRow.organization_id,
      role_slug: canonicalSlug,
      role_name: canonicalSlug,
      permissions: Array.from(effectivePermissions),
      effectivePermissions,
      project_role_slug: projectRoleSlug,
      project_id: projectId ?? null,
      department_scope: (memberRow?.department_scope as string[] | null) ?? null,
      project_scope: (memberRow?.project_scope as string[] | null) ?? null,
      venue_scope: (memberRow?.venue_scope as string[] | null) ?? null,
      status: "active",
    },
  };
}

// ============================================================================
// ROLE GUARD
// ============================================================================

/**
 * Verify the request is from an org member with one of the allowed roles.
 */
export async function requireRole(
  allowedRoles: RoleSlug[],
  orgId?: string
): Promise<OrgMemberContext | OrgMemberError> {
  const result = await requireOrgMember(orgId);
  if (result.error) return result;

  const { membership } = result;

  if (!allowedRoles.includes(membership.role_slug)) {
    return {
      error: forbidden(
        `Role '${membership.role_slug}' is not authorized. Required: ${allowedRoles.join(", ")}`
      ),
    };
  }

  return result;
}

// ============================================================================
// RESOURCE ACCESS GUARD
// ============================================================================

/**
 * Check if a user's role permits access to a specific resource (DB table).
 * Returns null if allowed, or a 403 Response if forbidden.
 * Derives restrictions from canonical PLATFORM_ROLE_DEFINITIONS.
 */
export function enforceResourceAccess(
  auth: OrgMemberContext,
  resource: string
) {
  if (isResourceForbidden(auth.membership.role_slug, resource)) {
    return forbidden(`Role '${auth.membership.role_slug}' does not have access to ${resource}`);
  }
  return null;
}

// ============================================================================
// POLICY GUARD (ABAC/RBAC)
// ============================================================================

/**
 * Verify the request is from an org member that satisfies centralized policy rules.
 * Combines org membership, role constraints, effective permissions, ownership,
 * sensitivity, access_grants, and scoped access.
 */
export async function requirePolicy(
  action: PolicyAction,
  options?: {
    orgId?: string;
    projectId?: string | null;
    resourceOwnerId?: string | null;
    resourceOrganizationId?: string | null;
    sensitivity?: DataSensitivity;
    resource?: string;
    resourceId?: string;
  }
): Promise<OrgMemberContext | OrgMemberError> {
  const result = await requireOrgMember(options?.orgId, options?.projectId);
  if (result.error) return result;

  // Resource-level access check
  if (options?.resource) {
    const resourceDenied = enforceResourceAccess(result, options.resource);
    if (resourceDenied) return { error: resourceDenied };
  }

  // Access grant check for time-bound / NDA-gated resources
  if (options?.resource && options?.resourceId && result.membership.role_slug !== 'owner' && result.membership.role_slug !== 'admin') {
    const { data: grant } = await result.supabase
      .from("access_grants")
      .select("id, is_active, expires_at, requires_nda, nda_verified")
      .eq("user_id", result.user.id)
      .eq("organization_id", result.membership.organization_id)
      .eq("resource_type", options.resource)
      .eq("resource_id", options.resourceId)
      .eq("is_active", true)
      .maybeSingle();

    if (grant) {
      if (grant.expires_at && new Date(grant.expires_at) < new Date()) {
        return { error: forbidden("Access grant has expired") };
      }
      if (grant.requires_nda && !grant.nda_verified) {
        return { error: forbidden("NDA verification required for this resource") };
      }
    }
  }

  const decision = evaluatePolicy(action, {
    actorId: result.user.id,
    actorOrganizationId: result.membership.organization_id,
    roleSlug: result.membership.role_slug,
    permissions: result.membership.permissions,
    effectivePermissions: result.membership.effectivePermissions,
    resourceOwnerId: options?.resourceOwnerId,
    resourceOrganizationId:
      options?.resourceOrganizationId ?? result.membership.organization_id,
    sensitivity: options?.sensitivity,
  });

  if (!decision.allow) {
    return { error: forbidden(decision.reason) };
  }

  return result;
}
