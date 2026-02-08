import { createClient } from "@/lib/supabase/server";
import { unauthorized, forbidden } from "@/lib/api/response";
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

  let query = supabase
    .from("organization_members")
    .select(
      `
      id,
      organization_id,
      role_id,
      status,
      role:roles(name)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  if (orgId) {
    query = query.eq("organization_id", orgId);
  }

  const { data: member, error: memberError } = await query.maybeSingle();

  if (memberError || !member) {
    return { error: forbidden("Not a member of this organization") };
  }

  return {
    user,
    supabase,
    membership: {
      id: member.id,
      organization_id: member.organization_id,
      role_id: member.role_id,
      role_name: (member.role as { name?: string } | null)?.name ?? null,
      status: member.status,
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
