"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase, useUser } from "./use-supabase";

interface UserRole {
  role_slug: string;
  permissions: string[] | null;
  is_active: boolean | null;
  organization_id: string;
}

interface PermissionsContext {
  roles: UserRole[];
  permissions: Set<string>;
  roleSlugs: Set<string>;
  isLoading: boolean;
  hasPermission: (permission?: string) => boolean;
  hasRole: (roleSlug: string) => boolean;
  hasAnyRole: (roleSlugs: string[]) => boolean;
  isAtLeast: (minimumRole: string) => boolean;
}

const ROLE_HIERARCHY: Record<string, number> = {
  owner: 100,
  admin: 90,
  manager: 70,
  member: 50,
  contractor: 40,
  client: 20,
  vendor: 10,
};

export function usePermissions(organizationId?: string | null): PermissionsContext {
  const supabase = useSupabase();
  const { user } = useUser();

  const resolvedOrgId = organizationId ?? user?.user_metadata?.organization_id ?? null;

  const { data: roles = [], isLoading } = useQuery({
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
        console.error("[usePermissions] Failed to fetch roles:", error);
        return [];
      }

      return (data ?? []) as UserRole[];
    },
    enabled: !!user?.id && !!resolvedOrgId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const roleSlugs = new Set(roles.map((r) => r.role_slug));
  const permissions = new Set(roles.flatMap((r) => r.permissions ?? []));

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    if (roleSlugs.has("owner") || roleSlugs.has("admin")) return true;
    return permissions.has(permission);
  };

  const hasRole = (roleSlug: string): boolean => roleSlugs.has(roleSlug);

  const hasAnyRole = (slugs: string[]): boolean => slugs.some((s) => roleSlugs.has(s));

  const isAtLeast = (minimumRole: string): boolean => {
    const minLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
    return Array.from(roleSlugs).some((slug) => (ROLE_HIERARCHY[slug] ?? 0) >= minLevel);
  };

  return {
    roles,
    permissions,
    roleSlugs,
    isLoading,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAtLeast,
  };
}
