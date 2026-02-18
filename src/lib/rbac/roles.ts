/**
 * ATLVS Canonical Role & Permission Taxonomy — Single Source of Truth
 *
 * Architecture:
 *   1. PLATFORM ROLES — org-level roles assigned via `user_roles` table
 *   2. PROJECT ROLES — project-scoped roles assigned via `project_members` table
 *   3. PERMISSIONS    — granular feature-flag-style permission strings (3NF)
 *   4. OVERRIDES      — org-level and project-level permission overrides
 *
 * Resolution order (most specific wins):
 *   project override → org override → project role perms → platform role perms
 *
 * DB tables that reference this SSOT:
 *   - `canonical_role_hierarchy` (mirrors PLATFORM_ROLE_DEFINITIONS)
 *   - `user_roles` (platform role assignment: user × org × role_slug)
 *   - `project_members` (project role assignment: user × project × project_role_slug)
 *   - `permission_overrides` (org-level and project-level feature flag overrides)
 *
 * To add a role: add it here, then run the seed alignment migration.
 * To change permissions: change them here — all guards and policies auto-derive.
 */

// ============================================================================
// 1. PLATFORM ROLE SLUGS (org-level)
// ============================================================================

export const PLATFORM_ROLE_SLUGS = [
  // Internal roles (org staff)
  'owner',
  'admin',
  'controller',
  'officer',
  'producer',
  'manager',
  'coordinator',
  'team',
  // External roles (scoped access)
  'contractor',
  'crew',
  'collaborator',
  'partner',
  'affiliate',
  'ambassador',
  'client',
  'vendor',
  'venue',
  'artist',
  'agency',
  'guest',
] as const;

export type PlatformRoleSlug = (typeof PLATFORM_ROLE_SLUGS)[number];

/** Primary role type used by guards and policies */
export type RoleSlug = PlatformRoleSlug;

// ============================================================================
// 2. PROJECT ROLE SLUGS (project-level)
// ============================================================================

export const PROJECT_ROLE_SLUGS = [
  'project_owner',
  'project_manager',
  'project_lead',
  'project_member',
  'project_contributor',
  'project_viewer',
] as const;

export type ProjectRoleSlug = (typeof PROJECT_ROLE_SLUGS)[number];

// ============================================================================
// 3. ROLE SCOPE CLASSIFICATION
// ============================================================================

export type RoleScope = 'internal' | 'external';

const EXTERNAL_ROLES: ReadonlySet<PlatformRoleSlug> = new Set([
  'contractor', 'crew', 'collaborator', 'partner', 'affiliate',
  'ambassador', 'client', 'vendor', 'venue', 'artist', 'agency', 'guest',
]);

export function isExternalRole(slug: string | null | undefined): boolean {
  if (!slug) return true;
  return EXTERNAL_ROLES.has(slug as PlatformRoleSlug);
}

// ============================================================================
// 4. HIERARCHY LEVELS (higher = more privileged)
// ============================================================================

export const ROLE_HIERARCHY: Record<PlatformRoleSlug, number> = {
  owner: 1000,
  admin: 900,
  controller: 800,
  officer: 800,
  producer: 700,
  manager: 600,
  coordinator: 500,
  team: 400,
  contractor: 300,
  crew: 250,
  collaborator: 200,
  partner: 200,
  affiliate: 150,
  ambassador: 150,
  client: 100,
  vendor: 100,
  venue: 100,
  artist: 100,
  agency: 100,
  guest: 10,
};

export const PROJECT_ROLE_HIERARCHY: Record<ProjectRoleSlug, number> = {
  project_owner: 1000,
  project_manager: 800,
  project_lead: 600,
  project_member: 400,
  project_contributor: 200,
  project_viewer: 100,
};

// ============================================================================
// 5. PERMISSION STRINGS (granular feature flags)
// ============================================================================

export const PERMISSIONS = [
  // Entity CRUD
  'entity.read',
  'entity.write',
  'entity.delete',
  'entity.archive',
  'entity.export',
  'entity.import',
  // Finance
  'finance.read',
  'finance.write',
  'finance.approve',
  'finance.payroll',
  // People / HR
  'people.read',
  'people.write',
  'people.manage',
  'people.sensitive',
  // Production
  'production.read',
  'production.write',
  'production.manage',
  // Assets
  'assets.read',
  'assets.write',
  'assets.reserve',
  // CRM / Business
  'crm.read',
  'crm.write',
  'crm.pipeline',
  // Audit / Compliance
  'audit.read',
  'audit.write',
  // Settings / Admin
  'settings.read',
  'settings.manage',
  'settings.billing',
  // Timekeeping
  'time.read',
  'time.write',
  'time.approve',
  // Documents
  'documents.read',
  'documents.write',
  'documents.sign',
  // Reporting
  'reports.read',
  'reports.create',
  // Integrations
  'integrations.read',
  'integrations.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// ============================================================================
// 6. PLATFORM ROLE DEFINITIONS
// ============================================================================

export interface RoleDefinition {
  slug: PlatformRoleSlug;
  label: string;
  description: string;
  scope: RoleScope;
  level: number;
  permissions: readonly Permission[];
  forbiddenResources: readonly string[];
  selfScopeOnly: boolean;
}

/** Shared forbidden resource lists (3NF — no duplication) */
const PAYROLL_TABLES = [
  'payroll_batches', 'pay_stubs', 'pay_rates', 'deductions',
] as const;

const BUDGET_TABLES = [
  'budgets', 'budget_line_items', 'budget_categories', 'budget_phases',
  'budget_alerts', 'budget_scenarios',
] as const;

const PIPELINE_TABLES = [
  'deals', 'proposals', 'proposal_line_items',
  'leads', 'pipelines', 'pipeline_stages',
] as const;

const REVENUE_TABLES = [
  'revenue_recognitions', 'fiscal_periods',
] as const;

const INVOICE_TABLES = [
  'invoices', 'invoice_line_items', 'payments',
] as const;

const RATE_TABLES = [
  'crew_rate_cards', 'rate_cards', 'rate_card_items',
] as const;

const EXPENSE_TABLES = [
  'expenses', 'expense_receipts', 'reimbursements',
] as const;

const TIME_TABLES = [
  'time_entries', 'timesheet_entries', 'timesheets',
] as const;

const HR_TABLES = [
  'employee_profiles', 'crew_gig_ratings',
  'labor_rule_sets', 'meal_penalties', 'turnaround_violations',
] as const;

const PO_TABLES = [
  'purchase_orders', 'purchase_order_items',
  'vendor_payment_schedules',
] as const;

export const PLATFORM_ROLE_DEFINITIONS: Record<PlatformRoleSlug, RoleDefinition> = {
  // ── Internal Roles ──────────────────────────────────────────────────────

  owner: {
    slug: 'owner',
    label: 'Owner',
    description: 'Account holder with full platform access and billing control',
    scope: 'internal',
    level: 1000,
    permissions: PERMISSIONS,
    forbiddenResources: [],
    selfScopeOnly: false,
  },
  admin: {
    slug: 'admin',
    label: 'Admin',
    description: 'System administrator with full operational access',
    scope: 'internal',
    level: 900,
    permissions: PERMISSIONS,
    forbiddenResources: [],
    selfScopeOnly: false,
  },
  controller: {
    slug: 'controller',
    label: 'Controller',
    description: 'Finance controller: budgets, invoices, payroll, approvals, reporting',
    scope: 'internal',
    level: 800,
    permissions: [
      'entity.read', 'entity.write', 'entity.export',
      'finance.read', 'finance.write', 'finance.approve', 'finance.payroll',
      'time.read', 'time.approve',
      'audit.read',
      'reports.read', 'reports.create',
    ],
    forbiddenResources: [],
    selfScopeOnly: false,
  },
  officer: {
    slug: 'officer',
    label: 'Officer',
    description: 'Compliance officer: audit, certifications, policy enforcement, security',
    scope: 'internal',
    level: 800,
    permissions: [
      'entity.read', 'entity.write', 'entity.export',
      'people.read', 'people.sensitive',
      'audit.read', 'audit.write',
      'settings.read',
      'documents.read', 'documents.write',
      'reports.read', 'reports.create',
    ],
    forbiddenResources: [...PAYROLL_TABLES],
    selfScopeOnly: false,
  },
  producer: {
    slug: 'producer',
    label: 'Producer',
    description: 'Production lead: events, shows, crew, logistics, budgets (read)',
    scope: 'internal',
    level: 700,
    permissions: [
      'entity.read', 'entity.write', 'entity.delete', 'entity.export',
      'finance.read',
      'people.read', 'people.write',
      'production.read', 'production.write', 'production.manage',
      'assets.read', 'assets.write', 'assets.reserve',
      'time.read', 'time.write', 'time.approve',
      'documents.read', 'documents.write',
      'reports.read',
    ],
    forbiddenResources: [...PAYROLL_TABLES, ...REVENUE_TABLES],
    selfScopeOnly: false,
  },
  manager: {
    slug: 'manager',
    label: 'Manager',
    description: 'Department/project manager with team and workflow oversight',
    scope: 'internal',
    level: 600,
    permissions: [
      'entity.read', 'entity.write', 'entity.delete', 'entity.export',
      'finance.read',
      'people.read', 'people.write', 'people.manage',
      'production.read', 'production.write', 'production.manage',
      'assets.read', 'assets.write', 'assets.reserve',
      'crm.read',
      'time.read', 'time.write', 'time.approve',
      'documents.read', 'documents.write',
      'settings.read',
      'reports.read',
    ],
    forbiddenResources: [...PAYROLL_TABLES],
    selfScopeOnly: false,
  },
  coordinator: {
    slug: 'coordinator',
    label: 'Coordinator',
    description: 'Scheduling, logistics, asset tracking, day-of operations',
    scope: 'internal',
    level: 500,
    permissions: [
      'entity.read', 'entity.write',
      'people.read',
      'production.read', 'production.write',
      'assets.read', 'assets.write', 'assets.reserve',
      'time.read', 'time.write',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES, ...REVENUE_TABLES,
    ],
    selfScopeOnly: false,
  },
  team: {
    slug: 'team',
    label: 'Team',
    description: 'Standard internal team member',
    scope: 'internal',
    level: 400,
    permissions: [
      'entity.read', 'entity.write',
      'people.read',
      'production.read',
      'assets.read', 'assets.reserve',
      'time.read', 'time.write',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...REVENUE_TABLES,
    ],
    selfScopeOnly: false,
  },

  // ── External Roles ──────────────────────────────────────────────────────

  contractor: {
    slug: 'contractor',
    label: 'Contractor',
    description: 'External contractor with scoped project access and timekeeping',
    scope: 'external',
    level: 300,
    permissions: [
      'entity.read', 'entity.write',
      'production.read',
      'time.read', 'time.write',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...HR_TABLES,
    ],
    selfScopeOnly: true,
  },
  crew: {
    slug: 'crew',
    label: 'Crew',
    description: 'External crew: check-in/out, assignments, timesheets',
    scope: 'external',
    level: 250,
    permissions: [
      'entity.read',
      'production.read',
      'time.read', 'time.write',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...INVOICE_TABLES, ...RATE_TABLES,
      ...EXPENSE_TABLES, ...HR_TABLES,
    ],
    selfScopeOnly: true,
  },
  collaborator: {
    slug: 'collaborator',
    label: 'Collaborator',
    description: 'External collaborator with read/write on assigned resources',
    scope: 'external',
    level: 200,
    permissions: [
      'entity.read', 'entity.write',
      'documents.read', 'documents.write',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...RATE_TABLES, ...EXPENSE_TABLES,
      ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  partner: {
    slug: 'partner',
    label: 'Partner',
    description: 'Strategic partner with shared project visibility',
    scope: 'external',
    level: 200,
    permissions: [
      'entity.read',
      'production.read',
      'documents.read',
      'reports.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...RATE_TABLES, ...EXPENSE_TABLES,
      ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  affiliate: {
    slug: 'affiliate',
    label: 'Affiliate',
    description: 'Affiliate partner with referral and commission visibility',
    scope: 'external',
    level: 150,
    permissions: [
      'entity.read',
      'crm.read',
      'reports.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...REVENUE_TABLES,
      ...RATE_TABLES, ...EXPENSE_TABLES, ...TIME_TABLES,
      ...HR_TABLES, ...PO_TABLES, ...INVOICE_TABLES,
    ],
    selfScopeOnly: true,
  },
  ambassador: {
    slug: 'ambassador',
    label: 'Ambassador',
    description: 'Brand ambassador with public-facing content and event access',
    scope: 'external',
    level: 150,
    permissions: [
      'entity.read',
      'production.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...RATE_TABLES, ...EXPENSE_TABLES,
      ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES, ...INVOICE_TABLES,
    ],
    selfScopeOnly: true,
  },
  client: {
    slug: 'client',
    label: 'Client',
    description: 'External client with read access to their projects and deliverables',
    scope: 'external',
    level: 100,
    permissions: [
      'entity.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...RATE_TABLES,
      ...EXPENSE_TABLES, ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  vendor: {
    slug: 'vendor',
    label: 'Vendor',
    description: 'External vendor with access to their POs and invoices',
    scope: 'external',
    level: 100,
    permissions: [
      'entity.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...HR_TABLES,
    ],
    selfScopeOnly: true,
  },
  venue: {
    slug: 'venue',
    label: 'Venue',
    description: 'Venue representative with event and logistics access',
    scope: 'external',
    level: 100,
    permissions: [
      'entity.read',
      'production.read',
      'assets.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...RATE_TABLES, ...EXPENSE_TABLES,
      ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  artist: {
    slug: 'artist',
    label: 'Artist',
    description: 'Artist/performer with rider, schedule, and deliverable access',
    scope: 'external',
    level: 100,
    permissions: [
      'entity.read',
      'production.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...RATE_TABLES, ...EXPENSE_TABLES,
      ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  agency: {
    slug: 'agency',
    label: 'Agency',
    description: 'Talent agency with roster, booking, and contract access',
    scope: 'external',
    level: 100,
    permissions: [
      'entity.read',
      'production.read',
      'crm.read',
      'documents.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...REVENUE_TABLES,
      ...RATE_TABLES, ...EXPENSE_TABLES, ...TIME_TABLES,
      ...HR_TABLES, ...PO_TABLES,
    ],
    selfScopeOnly: true,
  },
  guest: {
    slug: 'guest',
    label: 'Guest',
    description: 'Read-only guest with minimal access',
    scope: 'external',
    level: 10,
    permissions: [
      'entity.read',
    ],
    forbiddenResources: [
      ...PAYROLL_TABLES, ...BUDGET_TABLES, ...PIPELINE_TABLES,
      ...REVENUE_TABLES, ...INVOICE_TABLES, ...RATE_TABLES,
      ...EXPENSE_TABLES, ...TIME_TABLES, ...HR_TABLES, ...PO_TABLES,
      'contracts',
    ],
    selfScopeOnly: true,
  },
};


// ============================================================================
// 7. PROJECT ROLE DEFINITIONS
// ============================================================================

export interface ProjectRoleDefinition {
  slug: ProjectRoleSlug;
  label: string;
  description: string;
  level: number;
  permissions: readonly Permission[];
}

export const PROJECT_ROLE_DEFINITIONS: Record<ProjectRoleSlug, ProjectRoleDefinition> = {
  project_owner: {
    slug: 'project_owner',
    label: 'Project Owner',
    description: 'Full control over the project and all its resources',
    level: 1000,
    permissions: [
      'entity.read', 'entity.write', 'entity.delete', 'entity.archive',
      'entity.export', 'entity.import',
      'finance.read', 'finance.write', 'finance.approve',
      'people.read', 'people.write', 'people.manage',
      'production.read', 'production.write', 'production.manage',
      'assets.read', 'assets.write', 'assets.reserve',
      'time.read', 'time.write', 'time.approve',
      'documents.read', 'documents.write', 'documents.sign',
      'reports.read', 'reports.create',
    ],
  },
  project_manager: {
    slug: 'project_manager',
    label: 'Project Manager',
    description: 'Manages project scope, team, timeline, and deliverables',
    level: 800,
    permissions: [
      'entity.read', 'entity.write', 'entity.delete', 'entity.export',
      'finance.read',
      'people.read', 'people.write',
      'production.read', 'production.write', 'production.manage',
      'assets.read', 'assets.write', 'assets.reserve',
      'time.read', 'time.write', 'time.approve',
      'documents.read', 'documents.write',
      'reports.read',
    ],
  },
  project_lead: {
    slug: 'project_lead',
    label: 'Project Lead',
    description: 'Technical or creative lead with write access',
    level: 600,
    permissions: [
      'entity.read', 'entity.write',
      'people.read',
      'production.read', 'production.write',
      'assets.read', 'assets.write',
      'time.read', 'time.write',
      'documents.read', 'documents.write',
    ],
  },
  project_member: {
    slug: 'project_member',
    label: 'Project Member',
    description: 'Standard project participant with read/write on assigned work',
    level: 400,
    permissions: [
      'entity.read', 'entity.write',
      'production.read',
      'assets.read',
      'time.read', 'time.write',
      'documents.read',
    ],
  },
  project_contributor: {
    slug: 'project_contributor',
    label: 'Project Contributor',
    description: 'External contributor with limited write access',
    level: 200,
    permissions: [
      'entity.read', 'entity.write',
      'documents.read', 'documents.write',
      'time.read', 'time.write',
    ],
  },
  project_viewer: {
    slug: 'project_viewer',
    label: 'Project Viewer',
    description: 'Read-only access to project data',
    level: 100,
    permissions: [
      'entity.read',
      'documents.read',
    ],
  },
};

// ============================================================================
// 8. PERMISSION OVERRIDE SYSTEM (feature flags)
// ============================================================================

export type OverrideAction = 'grant' | 'revoke';
export type OverrideScope = 'organization' | 'project';

export interface PermissionOverride {
  scope: OverrideScope;
  scope_id: string;
  user_id?: string;
  role_slug?: string;
  permission: Permission;
  action: OverrideAction;
}

/**
 * Resolve effective permissions by merging:
 *   1. Platform role base permissions
 *   2. Project role permissions (if in project context)
 *   3. Org-level overrides (grant/revoke)
 *   4. Project-level overrides (grant/revoke)
 *   5. Explicit user_roles.permissions grants
 *
 * Most specific scope wins. Revoke always beats grant at the same scope level.
 */
export function resolveEffectivePermissions(
  platformRoleSlug: PlatformRoleSlug | null,
  projectRoleSlug: ProjectRoleSlug | null,
  explicitPermissions: readonly string[],
  overrides: readonly PermissionOverride[],
): Set<Permission> {
  const effective = new Set<Permission>();

  // Layer 1: platform role base permissions
  if (platformRoleSlug) {
    const def = PLATFORM_ROLE_DEFINITIONS[platformRoleSlug];
    if (def) {
      for (const p of def.permissions) effective.add(p);
    }
  }

  // Layer 2: project role permissions (additive)
  if (projectRoleSlug) {
    const def = PROJECT_ROLE_DEFINITIONS[projectRoleSlug];
    if (def) {
      for (const p of def.permissions) effective.add(p);
    }
  }

  // Layer 3: explicit user_roles.permissions grants
  for (const p of explicitPermissions) {
    if ((PERMISSIONS as readonly string[]).includes(p)) {
      effective.add(p as Permission);
    }
  }

  // Layer 4: org-level overrides
  const orgOverrides = overrides.filter((o) => o.scope === 'organization');
  for (const o of orgOverrides) {
    if (o.action === 'grant') effective.add(o.permission);
    if (o.action === 'revoke') effective.delete(o.permission);
  }

  // Layer 5: project-level overrides (most specific, wins)
  const projectOverrides = overrides.filter((o) => o.scope === 'project');
  for (const o of projectOverrides) {
    if (o.action === 'grant') effective.add(o.permission);
    if (o.action === 'revoke') effective.delete(o.permission);
  }

  return effective;
}

// ============================================================================
// 9. DERIVED LOOKUPS (computed once at module load)
// ============================================================================

/** Role slug → hierarchy level */
export function getRoleLevel(slug: string | null | undefined): number {
  if (!slug) return 0;
  return ROLE_HIERARCHY[slug as PlatformRoleSlug] ?? 0;
}

/** Project role slug → hierarchy level */
export function getProjectRoleLevel(slug: string | null | undefined): number {
  if (!slug) return 0;
  return PROJECT_ROLE_HIERARCHY[slug as ProjectRoleSlug] ?? 0;
}

/** Check if roleA is at least as privileged as roleB */
export function isAtLeastRole(roleA: string | null | undefined, minimumRole: PlatformRoleSlug): boolean {
  return getRoleLevel(roleA) >= getRoleLevel(minimumRole);
}

/** Check if a role has a specific permission (base, no overrides) */
export function roleHasPermission(roleSlug: string | null | undefined, permission: Permission): boolean {
  if (!roleSlug) return false;
  const def = PLATFORM_ROLE_DEFINITIONS[roleSlug as PlatformRoleSlug];
  if (!def) return false;
  return (def.permissions as readonly string[]).includes(permission);
}

/** Check if a role is forbidden from accessing a resource */
export function isResourceForbidden(roleSlug: string | null | undefined, resource: string): boolean {
  if (!roleSlug) return true;
  const def = PLATFORM_ROLE_DEFINITIONS[roleSlug as PlatformRoleSlug];
  if (!def) return true;
  return def.forbiddenResources.includes(resource);
}

/** Get the RoleDefinition for a slug, or null */
export function getRoleDefinition(slug: string | null | undefined): RoleDefinition | null {
  if (!slug) return null;
  return PLATFORM_ROLE_DEFINITIONS[slug as PlatformRoleSlug] ?? null;
}

/** Normalize a role name/slug to canonical form */
export function normalizeRoleSlug(value: string | null | undefined): PlatformRoleSlug | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized in PLATFORM_ROLE_DEFINITIONS) return normalized as PlatformRoleSlug;
  return null;
}

/** Normalize a project role slug */
export function normalizeProjectRoleSlug(value: string | null | undefined): ProjectRoleSlug | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized in PROJECT_ROLE_DEFINITIONS) return normalized as ProjectRoleSlug;
  return null;
}

/** Roles that can write (entity.write permission) */
export const WRITE_ROLES: PlatformRoleSlug[] = PLATFORM_ROLE_SLUGS.filter(
  (s) => PLATFORM_ROLE_DEFINITIONS[s].permissions.includes('entity.write')
);

/** Roles that can delete (entity.delete permission) */
export const DELETE_ROLES: PlatformRoleSlug[] = PLATFORM_ROLE_SLUGS.filter(
  (s) => PLATFORM_ROLE_DEFINITIONS[s].permissions.includes('entity.delete')
);

/** Roles that can approve finance (finance.approve permission) */
export const FINANCE_APPROVE_ROLES: PlatformRoleSlug[] = PLATFORM_ROLE_SLUGS.filter(
  (s) => PLATFORM_ROLE_DEFINITIONS[s].permissions.includes('finance.approve')
);

/** Roles that can read audit logs (audit.read permission) */
export const AUDIT_READ_ROLES: PlatformRoleSlug[] = PLATFORM_ROLE_SLUGS.filter(
  (s) => PLATFORM_ROLE_DEFINITIONS[s].permissions.includes('audit.read')
);

/** Roles that can manage settings (settings.manage permission) */
export const SETTINGS_MANAGE_ROLES: PlatformRoleSlug[] = PLATFORM_ROLE_SLUGS.filter(
  (s) => PLATFORM_ROLE_DEFINITIONS[s].permissions.includes('settings.manage')
);

/** All platform role slugs as a Set for fast lookup */
export const VALID_ROLE_SLUGS = new Set<string>(PLATFORM_ROLE_SLUGS);

/** All project role slugs as a Set for fast lookup */
export const VALID_PROJECT_ROLE_SLUGS = new Set<string>(PROJECT_ROLE_SLUGS);

/** Combined set of all valid slugs */
export const ALL_VALID_SLUGS = new Set<string>([...PLATFORM_ROLE_SLUGS, ...PROJECT_ROLE_SLUGS]);
