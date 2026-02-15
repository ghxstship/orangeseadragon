import { createClient } from "@/lib/supabase/server";
import { unauthorized, forbidden } from "@/lib/api/response";
import { evaluatePolicy, type DataSensitivity, type PolicyAction } from "@/lib/api/policy";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * ATLVS API Auth Guard — Single Source of Truth
 *
 * Provides reusable authentication and authorization checks for API routes.
 * Eliminates repeated auth boilerplate across 128+ route files.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth.error) return auth.error;
 *   const { user, supabase } = auth;
 *
 * With org membership:
 *   const auth = await requireOrgMember(orgId);
 *   if (auth.error) return auth.error;
 *   const { user, supabase, membership } = auth;
 */

// ============================================================================
// TYPES
// ============================================================================

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
    role_id: string | null;
    role_name: string | null;
    status: string;
  };
}

export interface OrgMemberError {
  user?: never;
  supabase?: never;
  membership?: never;
  error: ReturnType<typeof unauthorized> | ReturnType<typeof forbidden>;
}

const ROLE_PRIORITY: Record<string, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  member: 50,
  contractor: 40,
  client: 20,
  vendor: 10,
};

function normalizeRoleName(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.trim().toLowerCase().replace(/\s+/g, "_");
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
 * If no orgId is provided, resolves the user's primary organization.
 */
export async function requireOrgMember(
  orgId?: string
): Promise<OrgMemberContext | OrgMemberError> {
  const auth = await requireAuth();
  if (auth.error) return auth;

  const { user, supabase } = auth;
  const metadataOrgId = getMetadataOrganizationId(user);
  const resolvedOrgId = orgId ?? metadataOrgId;

  let query = supabase
    .from("organization_members")
    .select(
      `
      id,
      organization_id,
      role_id,
      status,
      role:roles(name, slug)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  if (resolvedOrgId) {
    query = query.eq("organization_id", resolvedOrgId);
  }

  const { data: member, error: memberError } = await query.maybeSingle();

  if (member) {
    const role = member.role as { name?: string; slug?: string } | null;
    const normalizedRoleName =
      normalizeRoleName(role?.slug) ?? normalizeRoleName(role?.name);

    return {
      user,
      supabase,
      membership: {
        id: member.id,
        organization_id: member.organization_id,
        role_id: member.role_id,
        role_name: normalizedRoleName,
        status: member.status,
      },
    };
  }

  let roleQuery = supabase
    .from("user_roles")
    .select("id, organization_id, role_slug, created_at")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (resolvedOrgId) {
    roleQuery = roleQuery.eq("organization_id", resolvedOrgId);
  }

  const { data: userRoles, error: userRoleError } = await roleQuery.order("created_at", {
    ascending: false,
  });

  if (userRoles && userRoles.length > 0) {
    const sortedRoles = [...userRoles].sort((a, b) => {
      const aPriority = ROLE_PRIORITY[normalizeRoleName(a.role_slug) || ""] ?? 0;
      const bPriority = ROLE_PRIORITY[normalizeRoleName(b.role_slug) || ""] ?? 0;
      return bPriority - aPriority;
    });
    const primaryRole = sortedRoles[0];

    return {
      user,
      supabase,
      membership: {
        id: primaryRole.id,
        organization_id: primaryRole.organization_id,
        role_id: null,
        role_name: normalizeRoleName(primaryRole.role_slug),
        status: "active",
      },
    };
  }

  if (memberError) {
    console.warn("[requireOrgMember] organization_members lookup failed", {
      code: memberError.code,
      orgId: resolvedOrgId,
    });
  }

  if (userRoleError) {
    console.warn("[requireOrgMember] user_roles fallback lookup failed", {
      code: userRoleError.code,
      orgId: resolvedOrgId,
    });
  }

  return {
    error: forbidden("Not a member of this organization"),
  };
}

// ============================================================================
// ROLE GUARD
// ============================================================================

/**
 * Verify the request is from an org member with one of the allowed roles.
 */
export async function requireRole(
  allowedRoles: string[],
  orgId?: string
): Promise<OrgMemberContext | OrgMemberError> {
  const result = await requireOrgMember(orgId);
  if (result.error) return result;

  const { membership } = result;

  if (!membership.role_name || !allowedRoles.includes(membership.role_name)) {
    return {
      error: forbidden(
        `Role '${membership.role_name}' is not authorized. Required: ${allowedRoles.join(", ")}`
      ),
    };
  }

  return result;
}

// ============================================================================
// POLICY GUARD (ABAC/RBAC)
// ============================================================================

/**
 * Verify the request is from an org member that satisfies centralized policy rules.
 * This guard combines org membership, role constraints, ownership, and sensitivity checks.
 */
export async function requirePolicy(
  action: PolicyAction,
  options?: {
    orgId?: string;
    resourceOwnerId?: string | null;
    resourceOrganizationId?: string | null;
    sensitivity?: DataSensitivity;
  }
): Promise<OrgMemberContext | OrgMemberError> {
  const result = await requireOrgMember(options?.orgId);
  if (result.error) return result;

  const decision = evaluatePolicy(action, {
    actorId: result.user.id,
    actorOrganizationId: result.membership.organization_id,
    roleName: result.membership.role_name,
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
