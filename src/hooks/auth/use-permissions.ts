"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "../auth/use-supabase";
import { captureError } from '@/lib/observability';
import {
  ROLE_HIERARCHY,
  normalizeRoleSlug,
  getRoleLevel,
  isResourceForbidden,
  resolveEffectivePermissions,
  type PlatformRoleSlug,
  type Permission,
  type PermissionOverride,
} from "@/lib/rbac/roles";

interface UserRole {
  role_slug: string;
  permissions: string[] | null;
  is_active: boolean | null;
  organization_id: string;
}

interface ProjectMembership {
  project_role_slug: string;
}

interface PermissionsContext {
  roles: UserRole[];
  primaryRole: PlatformRoleSlug | null;
  permissions: Set<string>;
  effectivePermissions: Set<Permission>;
  roleSlugs: Set<string>;
  isLoading: boolean;
  hasPermission: (permission?: string) => boolean;
  hasRole: (roleSlug: string) => boolean;
  hasAnyRole: (roleSlugs: string[]) => boolean;
  isAtLeast: (minimumRole: string) => boolean;
  canAccessResource: (resource: string) => boolean;
}

export function usePermissions(
  organizationId?: string | null,
  projectId?: string | null,
): PermissionsContext {
  const supabase = useSupabase();
  const { user } = useUser();

  const resolvedOrgId = organizationId ?? user?.user_metadata?.organization_id ?? null;

  // 1. Fetch platform roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles", user?.id, resolvedOrgId],
    queryFn: async () => {
      if (!user?.id || !resolvedOrgId) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role_slug, permissions, is_active, organization_id")
        .eq("user_id", user.id)
        .eq("organization_id", resolvedOrgId)
        .eq("is_active", true);

      if (error) {
        captureError(error, 'permissions.fetchRoles');
        return [];
      }

      return (data ?? []) as UserRole[];
    },
    enabled: !!user?.id && !!resolvedOrgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 2. Fetch project role (if project context)
  const { data: projectMembership } = useQuery({
    queryKey: ["project-role", user?.id, projectId],
    queryFn: async () => {
      if (!user?.id || !projectId) return null;

      const { data, error } = await supabase
        .from("project_members")
        .select("project_role_slug")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        captureError(error, 'permissions.fetchProjectRole');
        return null;
      }

      return data as ProjectMembership | null;
    },
    enabled: !!user?.id && !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 3. Fetch permission overrides (org + project)
  const { data: overrides = [] } = useQuery<PermissionOverride[]>({
    queryKey: ["permission-overrides", user?.id, resolvedOrgId, projectId],
    queryFn: async () => {
      if (!user?.id || !resolvedOrgId) return [];

      const scopeIds = [resolvedOrgId, ...(projectId ? [projectId] : [])].filter(Boolean);
      const { data, error } = await supabase
        .from("permission_overrides")
        .select("scope, scope_id, user_id, role_slug, permission, action")
        .eq("is_active", true)
        .in("scope_id", scopeIds);

      if (error) {
        captureError(error, 'permissions.fetchOverrides');
        return [];
      }

      return (data ?? []) as PermissionOverride[];
    },
    enabled: !!user?.id && !!resolvedOrgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = rolesLoading;
  const roleSlugs = new Set(roles.map((r) => r.role_slug));

  // Resolve primary role (highest hierarchy level)
  const primaryRole: PlatformRoleSlug | null = roles.reduce<PlatformRoleSlug | null>((best, r) => {
    const slug = normalizeRoleSlug(r.role_slug);
    if (!slug) return best;
    if (!best) return slug;
    return getRoleLevel(slug) > getRoleLevel(best) ? slug : best;
  }, null);

  // Compute effective permissions
  const explicitPerms = roles.flatMap((r) => r.permissions ?? []);
  const projectRoleSlug = projectMembership?.project_role_slug
    ? (projectMembership.project_role_slug as Parameters<typeof resolveEffectivePermissions>[1])
    : null;

  const effectivePermissions = resolveEffectivePermissions(
    primaryRole,
    projectRoleSlug,
    explicitPerms,
    overrides,
  );

  const permissions = new Set<string>(effectivePermissions);

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    if (roleSlugs.has("owner") || roleSlugs.has("admin")) return true;
    return effectivePermissions.has(permission as Permission);
  };

  const hasRole = (roleSlug: string): boolean => roleSlugs.has(roleSlug);

  const hasAnyRole = (slugs: string[]): boolean => slugs.some((s) => roleSlugs.has(s));

  const isAtLeast = (minimumRole: string): boolean => {
    const minLevel = ROLE_HIERARCHY[minimumRole as PlatformRoleSlug] ?? 0;
    return Array.from(roleSlugs).some((slug) => (ROLE_HIERARCHY[slug as PlatformRoleSlug] ?? 0) >= minLevel);
  };

  const canAccessResource = (resource: string): boolean => {
    return !isResourceForbidden(primaryRole, resource);
  };

  return {
    roles,
    primaryRole,
    permissions,
    effectivePermissions,
    roleSlugs,
    isLoading,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAtLeast,
    canAccessResource,
  };
}
