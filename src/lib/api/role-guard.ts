import { forbidden } from '@/lib/api/response';
import { isResourceForbidden, isAtLeastRole } from '@/lib/rbac/roles';
import type { OrgMemberContext } from '@/lib/api/guard';

/**
 * ATLVS Role-Based Access Guard
 *
 * All resource restrictions derive from the canonical SSOT at `@/lib/rbac/roles`.
 * No hardcoded resource sets — `PLATFORM_ROLE_DEFINITIONS[slug].forbiddenResources`
 * is the single source of truth for what each role can and cannot access.
 */

/**
 * Check if a user's role permits access to a specific resource (DB table).
 * Returns null if allowed, or a 403 Response if forbidden.
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

/**
 * Check if a user's role permits access to emergency contact information.
 */
export function canViewEmergencyContacts(
  auth: OrgMemberContext,
  targetVisibility: string
): boolean {
  const slug = auth.membership.role_slug;

  switch (targetVisibility) {
    case 'all':
      return true;
    case 'managers_only':
      return isAtLeastRole(slug, 'manager');
    case 'hr_only':
      return isAtLeastRole(slug, 'admin');
    case 'restricted':
    default:
      return isAtLeastRole(slug, 'admin');
  }
}
