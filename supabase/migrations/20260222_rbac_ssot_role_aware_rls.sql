-- ============================================================================
-- RBAC SSOT: Role-Aware RLS Migration (v2 — Expanded Taxonomy)
-- ============================================================================
-- Establishes the canonical role taxonomy at the database level and rewrites
-- RLS policies for sensitive tables to enforce role-tier restrictions.
--
-- Architecture:
--   1. PLATFORM ROLES — 20 org-level roles (internal + external)
--   2. PROJECT ROLES  — 6 project-scoped roles
--   3. OVERRIDES      — org-level and project-level permission feature flags
--
-- Canonical platform role slugs (mirrored from src/lib/rbac/roles.ts):
--   owner(1000), admin(900), controller(800), officer(800),
--   producer(700), manager(600), coordinator(500), team(400),
--   contractor(300), crew(250), collaborator(200), partner(200),
--   affiliate(150), ambassador(150), client(100), vendor(100),
--   venue(100), artist(100), agency(100), guest(10)
--
-- Resolution: user_roles → project_members → permission_overrides
-- ============================================================================

-- ============================================================================
-- 1. CANONICAL ROLE HIERARCHY LOOKUP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS canonical_role_hierarchy (
    slug VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    scope VARCHAR(10) NOT NULL DEFAULT 'internal' CHECK (scope IN ('internal', 'external')),
    description TEXT,
    self_scope_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remove old slugs that no longer exist in the taxonomy
DELETE FROM canonical_role_hierarchy WHERE slug IN (
    'finance_manager', 'security_auditor', 'compliance_officer',
    'member', 'crew_lead', 'crew_member', 'client_viewer'
);

INSERT INTO canonical_role_hierarchy (slug, label, level, scope, description, self_scope_only) VALUES
    -- Internal roles
    ('owner',        'Owner',        1000, 'internal', 'Account holder with full platform access and billing control', FALSE),
    ('admin',        'Admin',         900, 'internal', 'System administrator with full operational access', FALSE),
    ('controller',   'Controller',    800, 'internal', 'Finance controller: budgets, invoices, payroll, approvals, reporting', FALSE),
    ('officer',      'Officer',       800, 'internal', 'Compliance officer: audit, certifications, policy enforcement, security', FALSE),
    ('producer',     'Producer',      700, 'internal', 'Production lead: events, shows, crew, logistics, budgets (read)', FALSE),
    ('manager',      'Manager',       600, 'internal', 'Department/project manager with team and workflow oversight', FALSE),
    ('coordinator',  'Coordinator',   500, 'internal', 'Scheduling, logistics, asset tracking, day-of operations', FALSE),
    ('team',         'Team',          400, 'internal', 'Standard internal team member', FALSE),
    -- External roles
    ('contractor',   'Contractor',    300, 'external', 'External contractor with scoped project access and timekeeping', TRUE),
    ('crew',         'Crew',          250, 'external', 'External crew: check-in/out, assignments, timesheets', TRUE),
    ('collaborator', 'Collaborator',  200, 'external', 'External collaborator with read/write on assigned resources', TRUE),
    ('partner',      'Partner',       200, 'external', 'Strategic partner with shared project visibility', TRUE),
    ('affiliate',    'Affiliate',     150, 'external', 'Affiliate partner with referral and commission visibility', TRUE),
    ('ambassador',   'Ambassador',    150, 'external', 'Brand ambassador with public-facing content and event access', TRUE),
    ('client',       'Client',        100, 'external', 'External client with read access to their projects and deliverables', TRUE),
    ('vendor',       'Vendor',        100, 'external', 'External vendor with access to their POs and invoices', TRUE),
    ('venue',        'Venue',         100, 'external', 'Venue representative with event and logistics access', TRUE),
    ('artist',       'Artist',        100, 'external', 'Artist/performer with rider, schedule, and deliverable access', TRUE),
    ('agency',       'Agency',        100, 'external', 'Talent agency with roster, booking, and contract access', TRUE),
    ('guest',        'Guest',          10, 'external', 'Read-only guest with minimal access', TRUE)
ON CONFLICT (slug) DO UPDATE SET
    label = EXCLUDED.label,
    level = EXCLUDED.level,
    scope = EXCLUDED.scope,
    description = EXCLUDED.description,
    self_scope_only = EXCLUDED.self_scope_only;

ALTER TABLE canonical_role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_role_hierarchy FORCE ROW LEVEL SECURITY;

CREATE POLICY "canonical_role_hierarchy_read_all"
    ON canonical_role_hierarchy FOR SELECT
    USING (TRUE);

-- ============================================================================
-- 2. ALIGN user_roles SEED DATA
-- ============================================================================

DELETE FROM lookup_tables WHERE table_name = 'user_roles';
INSERT INTO lookup_tables (table_name, key, value, metadata, position) VALUES
    ('user_roles', 'owner',        'Owner',        '{"permissions": ["all"], "level": 1000, "scope": "internal"}', 1),
    ('user_roles', 'admin',        'Admin',        '{"permissions": ["all"], "level": 900, "scope": "internal"}', 2),
    ('user_roles', 'controller',   'Controller',   '{"permissions": ["entity.read","entity.write","entity.export","finance.read","finance.write","finance.approve","finance.payroll","time.read","time.approve","audit.read","reports.read","reports.create"], "level": 800, "scope": "internal"}', 3),
    ('user_roles', 'officer',      'Officer',      '{"permissions": ["entity.read","entity.write","entity.export","people.read","people.sensitive","audit.read","audit.write","settings.read","documents.read","documents.write","reports.read","reports.create"], "level": 800, "scope": "internal"}', 4),
    ('user_roles', 'producer',     'Producer',     '{"permissions": ["entity.read","entity.write","entity.delete","entity.export","finance.read","people.read","people.write","production.read","production.write","production.manage","assets.read","assets.write","assets.reserve","time.read","time.write","time.approve","documents.read","documents.write","reports.read"], "level": 700, "scope": "internal"}', 5),
    ('user_roles', 'manager',      'Manager',      '{"permissions": ["entity.read","entity.write","entity.delete","entity.export","finance.read","people.read","people.write","people.manage","production.read","production.write","production.manage","assets.read","assets.write","assets.reserve","crm.read","time.read","time.write","time.approve","documents.read","documents.write","settings.read","reports.read"], "level": 600, "scope": "internal"}', 6),
    ('user_roles', 'coordinator',  'Coordinator',  '{"permissions": ["entity.read","entity.write","people.read","production.read","production.write","assets.read","assets.write","assets.reserve","time.read","time.write","documents.read"], "level": 500, "scope": "internal"}', 7),
    ('user_roles', 'team',         'Team',         '{"permissions": ["entity.read","entity.write","people.read","production.read","assets.read","assets.reserve","time.read","time.write","documents.read"], "level": 400, "scope": "internal"}', 8),
    ('user_roles', 'contractor',   'Contractor',   '{"permissions": ["entity.read","entity.write","production.read","time.read","time.write","documents.read"], "level": 300, "scope": "external"}', 9),
    ('user_roles', 'crew',         'Crew',         '{"permissions": ["entity.read","production.read","time.read","time.write"], "level": 250, "scope": "external"}', 10),
    ('user_roles', 'collaborator', 'Collaborator', '{"permissions": ["entity.read","entity.write","documents.read","documents.write"], "level": 200, "scope": "external"}', 11),
    ('user_roles', 'partner',      'Partner',      '{"permissions": ["entity.read","production.read","documents.read","reports.read"], "level": 200, "scope": "external"}', 12),
    ('user_roles', 'affiliate',    'Affiliate',    '{"permissions": ["entity.read","crm.read","reports.read"], "level": 150, "scope": "external"}', 13),
    ('user_roles', 'ambassador',   'Ambassador',   '{"permissions": ["entity.read","production.read","documents.read"], "level": 150, "scope": "external"}', 14),
    ('user_roles', 'client',       'Client',       '{"permissions": ["entity.read","documents.read"], "level": 100, "scope": "external"}', 15),
    ('user_roles', 'vendor',       'Vendor',       '{"permissions": ["entity.read","documents.read"], "level": 100, "scope": "external"}', 16),
    ('user_roles', 'venue',        'Venue',        '{"permissions": ["entity.read","production.read","assets.read","documents.read"], "level": 100, "scope": "external"}', 17),
    ('user_roles', 'artist',       'Artist',       '{"permissions": ["entity.read","production.read","documents.read"], "level": 100, "scope": "external"}', 18),
    ('user_roles', 'agency',       'Agency',       '{"permissions": ["entity.read","production.read","crm.read","documents.read"], "level": 100, "scope": "external"}', 19),
    ('user_roles', 'guest',        'Guest',        '{"permissions": ["entity.read"], "level": 10, "scope": "external"}', 20)
ON CONFLICT (table_name, key) DO UPDATE SET
    value = EXCLUDED.value,
    metadata = EXCLUDED.metadata,
    position = EXCLUDED.position;

-- Remove old slugs from lookup_tables
DELETE FROM lookup_tables WHERE table_name = 'user_roles' AND key IN (
    'finance_manager', 'security_auditor', 'compliance_officer',
    'member', 'crew_lead', 'crew_member', 'client_viewer'
);

-- ============================================================================
-- 2b. PROJECT MEMBERS — add project_role_slug and is_active columns
-- ============================================================================

ALTER TABLE project_members
    ADD COLUMN IF NOT EXISTS project_role_slug VARCHAR(50) DEFAULT 'project_member',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_project_members_role_active
    ON project_members (user_id, project_id, is_active)
    WHERE is_active = TRUE;

-- ============================================================================
-- 2c. PERMISSION OVERRIDES TABLE (feature flags)
-- ============================================================================
-- Granular grant/revoke overrides at org or project level.
-- Can target a specific user, a specific role, or apply globally (both NULL).

CREATE TABLE IF NOT EXISTS permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('organization', 'project')),
    scope_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_slug VARCHAR(50),
    permission VARCHAR(100) NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('grant', 'revoke')),
    is_active BOOLEAN DEFAULT TRUE,
    reason TEXT,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_overrides_scope
    ON permission_overrides (scope, scope_id, is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_permission_overrides_user
    ON permission_overrides (user_id, is_active)
    WHERE is_active = TRUE;

ALTER TABLE permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_overrides FORCE ROW LEVEL SECURITY;

-- Admin+ can manage overrides, users can read their own
CREATE POLICY "permission_overrides_read" ON permission_overrides FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
            WHERE ur.user_id = auth.uid()
              AND ur.is_active = TRUE
              AND crh.level >= 900
        )
    );

CREATE POLICY "permission_overrides_write" ON permission_overrides FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
            WHERE ur.user_id = auth.uid()
              AND ur.is_active = TRUE
              AND crh.level >= 900
        )
    );

CREATE POLICY "permission_overrides_update" ON permission_overrides FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
            WHERE ur.user_id = auth.uid()
              AND ur.is_active = TRUE
              AND crh.level >= 900
        )
    );

CREATE POLICY "permission_overrides_delete" ON permission_overrides FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
            WHERE ur.user_id = auth.uid()
              AND ur.is_active = TRUE
              AND crh.level >= 900
        )
    );

-- ============================================================================
-- 3. ROLE-AWARE RLS HELPER FUNCTIONS
-- ============================================================================

-- Get the user's highest-priority role slug for an organization
CREATE OR REPLACE FUNCTION get_user_role_slug(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    result VARCHAR;
BEGIN
    SELECT ur.role_slug INTO result
    FROM user_roles ur
    JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = org_id
      AND ur.is_active = TRUE
    ORDER BY crh.level DESC
    LIMIT 1;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the user's hierarchy level for an organization
CREATE OR REPLACE FUNCTION get_user_role_level(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    result INTEGER;
BEGIN
    SELECT crh.level INTO result
    FROM user_roles ur
    JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = org_id
      AND ur.is_active = TRUE
    ORDER BY crh.level DESC
    LIMIT 1;

    RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has at least the specified role level in an org
CREATE OR REPLACE FUNCTION has_min_role_level(org_id UUID, min_level INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role_level(org_id) >= min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has a specific role slug in an org
CREATE OR REPLACE FUNCTION has_role_slug(org_id UUID, required_slug VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND role_slug = required_slug
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is an active org member (via user_roles — SSOT)
CREATE OR REPLACE FUNCTION is_org_member_via_roles(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user's role is self-scope-only (external roles)
CREATE OR REPLACE FUNCTION is_self_scope_only(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT crh.self_scope_only INTO result
    FROM user_roles ur
    JOIN canonical_role_hierarchy crh ON crh.slug = ur.role_slug
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = org_id
      AND ur.is_active = TRUE
    ORDER BY crh.level DESC
    LIMIT 1;

    RETURN COALESCE(result, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has an active, non-expired access grant for a resource
CREATE OR REPLACE FUNCTION has_access_grant(
    org_id UUID,
    p_resource_type VARCHAR,
    p_resource_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM access_grants
        WHERE user_id = auth.uid()
          AND organization_id = org_id
          AND resource_type = p_resource_type
          AND (resource_id IS NULL OR resource_id = p_resource_id)
          AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (requires_nda = FALSE OR nda_verified = TRUE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 4. ROLE-AWARE RLS POLICIES FOR SENSITIVE TABLES
-- ============================================================================
-- Replaces binary member/not-member policies with role-tier enforcement.
-- Pattern: manager+ (level >= 600) for financial data, admin+ (level >= 900) for payroll.

-- ---------------------------------------------------------------------------
-- 4a. FINANCIAL TABLES — require manager+ (level >= 600)
-- ---------------------------------------------------------------------------

DO $$ BEGIN

-- budgets
DROP POLICY IF EXISTS "Org members can view budgets" ON budgets;
DROP POLICY IF EXISTS "Org members can manage budgets" ON budgets;
DROP POLICY IF EXISTS "budgets_org_read" ON budgets;
DROP POLICY IF EXISTS "budgets_org_write" ON budgets;
DROP POLICY IF EXISTS "budgets_role_read" ON budgets;
DROP POLICY IF EXISTS "budgets_role_write" ON budgets;
DROP POLICY IF EXISTS "budgets_role_update" ON budgets;
DROP POLICY IF EXISTS "budgets_role_delete" ON budgets;

CREATE POLICY "budgets_role_read" ON budgets FOR SELECT
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "budgets_role_write" ON budgets FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 600));
CREATE POLICY "budgets_role_update" ON budgets FOR UPDATE
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "budgets_role_delete" ON budgets FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
-- budget_line_items
DROP POLICY IF EXISTS "Org members can view budget line items" ON budget_line_items;
DROP POLICY IF EXISTS "Org members can manage budget line items" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_org_read" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_role_read" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_role_write" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_role_update" ON budget_line_items;
DROP POLICY IF EXISTS "budget_line_items_role_delete" ON budget_line_items;

CREATE POLICY "budget_line_items_role_read" ON budget_line_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM budgets b
        WHERE b.id = budget_line_items.budget_id
          AND has_min_role_level(b.organization_id, 600)
    ));
CREATE POLICY "budget_line_items_role_write" ON budget_line_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM budgets b
        WHERE b.id = budget_line_items.budget_id
          AND has_min_role_level(b.organization_id, 600)
    ));
CREATE POLICY "budget_line_items_role_update" ON budget_line_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM budgets b
        WHERE b.id = budget_line_items.budget_id
          AND has_min_role_level(b.organization_id, 600)
    ));
CREATE POLICY "budget_line_items_role_delete" ON budget_line_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM budgets b
        WHERE b.id = budget_line_items.budget_id
          AND has_min_role_level(b.organization_id, 900)
    ));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
-- invoices — controller+ (level >= 800) for write, team+ for read
DROP POLICY IF EXISTS "Org members can view invoices" ON invoices;
DROP POLICY IF EXISTS "Org members can manage invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_org_read" ON invoices;
DROP POLICY IF EXISTS "invoices_role_read" ON invoices;
DROP POLICY IF EXISTS "invoices_role_write" ON invoices;
DROP POLICY IF EXISTS "invoices_role_update" ON invoices;
DROP POLICY IF EXISTS "invoices_role_delete" ON invoices;

CREATE POLICY "invoices_role_read" ON invoices FOR SELECT
    USING (
        has_min_role_level(organization_id, 400)
        OR (has_min_role_level(organization_id, 100) AND has_access_grant(organization_id, 'invoices', id))
    );
CREATE POLICY "invoices_role_write" ON invoices FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 600));
CREATE POLICY "invoices_role_update" ON invoices FOR UPDATE
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "invoices_role_delete" ON invoices FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
-- expenses — team+ read, manager+ write
DROP POLICY IF EXISTS "Org members can view expenses" ON expenses;
DROP POLICY IF EXISTS "Org members can manage expenses" ON expenses;
DROP POLICY IF EXISTS "expenses_org_read" ON expenses;
DROP POLICY IF EXISTS "expenses_role_read" ON expenses;
DROP POLICY IF EXISTS "expenses_role_write" ON expenses;
DROP POLICY IF EXISTS "expenses_role_update" ON expenses;
DROP POLICY IF EXISTS "expenses_role_delete" ON expenses;

-- Use created_by if column exists, otherwise fall back to org membership only
IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'created_by'
) THEN
    CREATE POLICY "expenses_role_read" ON expenses FOR SELECT
        USING (
            has_min_role_level(organization_id, 400)
            OR (is_org_member_via_roles(organization_id) AND created_by = auth.uid())
        );
    CREATE POLICY "expenses_role_update" ON expenses FOR UPDATE
        USING (
            has_min_role_level(organization_id, 600)
            OR (is_org_member_via_roles(organization_id) AND created_by = auth.uid())
        );
ELSE
    CREATE POLICY "expenses_role_read" ON expenses FOR SELECT
        USING (has_min_role_level(organization_id, 400));
    CREATE POLICY "expenses_role_update" ON expenses FOR UPDATE
        USING (has_min_role_level(organization_id, 600));
END IF;

CREATE POLICY "expenses_role_write" ON expenses FOR INSERT
    WITH CHECK (is_org_member_via_roles(organization_id));
CREATE POLICY "expenses_role_delete" ON expenses FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4b. PAYROLL TABLES — require admin+ (level >= 900)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view payroll batches" ON payroll_batches;
DROP POLICY IF EXISTS "Org members can manage payroll batches" ON payroll_batches;
DROP POLICY IF EXISTS "payroll_batches_org_read" ON payroll_batches;
DROP POLICY IF EXISTS "payroll_batches_role_read" ON payroll_batches;
DROP POLICY IF EXISTS "payroll_batches_role_write" ON payroll_batches;
DROP POLICY IF EXISTS "payroll_batches_role_update" ON payroll_batches;
DROP POLICY IF EXISTS "payroll_batches_role_delete" ON payroll_batches;

CREATE POLICY "payroll_batches_role_read" ON payroll_batches FOR SELECT
    USING (has_min_role_level(organization_id, 800));
CREATE POLICY "payroll_batches_role_write" ON payroll_batches FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "payroll_batches_role_update" ON payroll_batches FOR UPDATE
    USING (has_min_role_level(organization_id, 900));
CREATE POLICY "payroll_batches_role_delete" ON payroll_batches FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view pay stubs" ON pay_stubs;
DROP POLICY IF EXISTS "Org members can manage pay stubs" ON pay_stubs;
DROP POLICY IF EXISTS "pay_stubs_org_read" ON pay_stubs;
DROP POLICY IF EXISTS "pay_stubs_role_read" ON pay_stubs;
DROP POLICY IF EXISTS "pay_stubs_role_write" ON pay_stubs;
DROP POLICY IF EXISTS "pay_stubs_role_update" ON pay_stubs;

-- Use employee_id if column exists, otherwise fall back to org-level only
IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pay_stubs' AND column_name = 'employee_id'
) THEN
    CREATE POLICY "pay_stubs_role_read" ON pay_stubs FOR SELECT
        USING (
            has_min_role_level(organization_id, 800)
            OR (is_org_member_via_roles(organization_id) AND employee_id = auth.uid())
        );
ELSE
    CREATE POLICY "pay_stubs_role_read" ON pay_stubs FOR SELECT
        USING (has_min_role_level(organization_id, 800));
END IF;

CREATE POLICY "pay_stubs_role_write" ON pay_stubs FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "pay_stubs_role_update" ON pay_stubs FOR UPDATE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view pay rates" ON pay_rates;
DROP POLICY IF EXISTS "Org members can manage pay rates" ON pay_rates;
DROP POLICY IF EXISTS "pay_rates_org_read" ON pay_rates;
DROP POLICY IF EXISTS "pay_rates_role_read" ON pay_rates;
DROP POLICY IF EXISTS "pay_rates_role_write" ON pay_rates;
DROP POLICY IF EXISTS "pay_rates_role_update" ON pay_rates;

CREATE POLICY "pay_rates_role_read" ON pay_rates FOR SELECT
    USING (has_min_role_level(organization_id, 800));
CREATE POLICY "pay_rates_role_write" ON pay_rates FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "pay_rates_role_update" ON pay_rates FOR UPDATE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view deductions" ON deductions;
DROP POLICY IF EXISTS "Org members can manage deductions" ON deductions;
DROP POLICY IF EXISTS "deductions_org_read" ON deductions;
DROP POLICY IF EXISTS "deductions_role_read" ON deductions;
DROP POLICY IF EXISTS "deductions_role_write" ON deductions;
DROP POLICY IF EXISTS "deductions_role_update" ON deductions;

CREATE POLICY "deductions_role_read" ON deductions FOR SELECT
    USING (has_min_role_level(organization_id, 800));
CREATE POLICY "deductions_role_write" ON deductions FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "deductions_role_update" ON deductions FOR UPDATE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4c. RATE CARDS — require manager+ (level >= 600)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view rate cards" ON rate_cards;
DROP POLICY IF EXISTS "Org members can manage rate cards" ON rate_cards;
DROP POLICY IF EXISTS "rate_cards_org_read" ON rate_cards;
DROP POLICY IF EXISTS "rate_cards_role_read" ON rate_cards;
DROP POLICY IF EXISTS "rate_cards_role_write" ON rate_cards;
DROP POLICY IF EXISTS "rate_cards_role_update" ON rate_cards;

CREATE POLICY "rate_cards_role_read" ON rate_cards FOR SELECT
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "rate_cards_role_write" ON rate_cards FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 600));
CREATE POLICY "rate_cards_role_update" ON rate_cards FOR UPDATE
    USING (has_min_role_level(organization_id, 600));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view crew rate cards" ON crew_rate_cards;
DROP POLICY IF EXISTS "Org members can manage crew rate cards" ON crew_rate_cards;
DROP POLICY IF EXISTS "crew_rate_cards_org_read" ON crew_rate_cards;
DROP POLICY IF EXISTS "crew_rate_cards_role_read" ON crew_rate_cards;
DROP POLICY IF EXISTS "crew_rate_cards_role_write" ON crew_rate_cards;
DROP POLICY IF EXISTS "crew_rate_cards_role_update" ON crew_rate_cards;

CREATE POLICY "crew_rate_cards_role_read" ON crew_rate_cards FOR SELECT
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "crew_rate_cards_role_write" ON crew_rate_cards FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 600));
CREATE POLICY "crew_rate_cards_role_update" ON crew_rate_cards FOR UPDATE
    USING (has_min_role_level(organization_id, 600));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4d. DEALS / PIPELINE — require team+ (level >= 400), block external roles
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view deals" ON deals;
DROP POLICY IF EXISTS "Org members can manage deals" ON deals;
DROP POLICY IF EXISTS "deals_org_read" ON deals;
DROP POLICY IF EXISTS "deals_role_read" ON deals;
DROP POLICY IF EXISTS "deals_role_write" ON deals;
DROP POLICY IF EXISTS "deals_role_update" ON deals;
DROP POLICY IF EXISTS "deals_role_delete" ON deals;

CREATE POLICY "deals_role_read" ON deals FOR SELECT
    USING (has_min_role_level(organization_id, 400));
CREATE POLICY "deals_role_write" ON deals FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 400));
CREATE POLICY "deals_role_update" ON deals FOR UPDATE
    USING (has_min_role_level(organization_id, 400));
CREATE POLICY "deals_role_delete" ON deals FOR DELETE
    USING (has_min_role_level(organization_id, 600));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view proposals" ON proposals;
DROP POLICY IF EXISTS "Org members can manage proposals" ON proposals;
DROP POLICY IF EXISTS "proposals_org_read" ON proposals;
DROP POLICY IF EXISTS "proposals_role_read" ON proposals;
DROP POLICY IF EXISTS "proposals_role_write" ON proposals;
DROP POLICY IF EXISTS "proposals_role_update" ON proposals;

CREATE POLICY "proposals_role_read" ON proposals FOR SELECT
    USING (has_min_role_level(organization_id, 400));
CREATE POLICY "proposals_role_write" ON proposals FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 400));
CREATE POLICY "proposals_role_update" ON proposals FOR UPDATE
    USING (has_min_role_level(organization_id, 400));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4e. EMPLOYEE PROFILES — require team+ (level >= 400) for read, manager+ for write
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view employee profiles" ON employee_profiles;
DROP POLICY IF EXISTS "Org members can manage employee profiles" ON employee_profiles;
DROP POLICY IF EXISTS "employee_profiles_org_read" ON employee_profiles;
DROP POLICY IF EXISTS "employee_profiles_role_read" ON employee_profiles;
DROP POLICY IF EXISTS "employee_profiles_role_write" ON employee_profiles;
DROP POLICY IF EXISTS "employee_profiles_role_update" ON employee_profiles;

CREATE POLICY "employee_profiles_role_read" ON employee_profiles FOR SELECT
    USING (
        has_min_role_level(organization_id, 400)
        OR (is_org_member_via_roles(organization_id) AND user_id = auth.uid())
    );
CREATE POLICY "employee_profiles_role_write" ON employee_profiles FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 600));
CREATE POLICY "employee_profiles_role_update" ON employee_profiles FOR UPDATE
    USING (
        has_min_role_level(organization_id, 600)
        OR (is_org_member_via_roles(organization_id) AND user_id = auth.uid())
    );

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4f. TIME ENTRIES — team+ read all, self-scope for external roles
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view time entries" ON time_entries;
DROP POLICY IF EXISTS "Org members can manage time entries" ON time_entries;
DROP POLICY IF EXISTS "time_entries_org_read" ON time_entries;
DROP POLICY IF EXISTS "time_entries_role_read" ON time_entries;
DROP POLICY IF EXISTS "time_entries_role_write" ON time_entries;
DROP POLICY IF EXISTS "time_entries_role_update" ON time_entries;

CREATE POLICY "time_entries_role_read" ON time_entries FOR SELECT
    USING (
        has_min_role_level(organization_id, 400)
        OR (is_org_member_via_roles(organization_id) AND user_id = auth.uid())
    );
CREATE POLICY "time_entries_role_write" ON time_entries FOR INSERT
    WITH CHECK (
        is_org_member_via_roles(organization_id)
        AND (has_min_role_level(organization_id, 400) OR user_id = auth.uid())
    );
CREATE POLICY "time_entries_role_update" ON time_entries FOR UPDATE
    USING (
        has_min_role_level(organization_id, 600)
        OR (is_org_member_via_roles(organization_id) AND user_id = auth.uid())
    );

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4g. REVENUE / FISCAL — require controller+ (level >= 800)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view revenue recognitions" ON revenue_recognitions;
DROP POLICY IF EXISTS "revenue_recognitions_org_read" ON revenue_recognitions;
DROP POLICY IF EXISTS "revenue_recognitions_role_read" ON revenue_recognitions;
DROP POLICY IF EXISTS "revenue_recognitions_role_write" ON revenue_recognitions;
DROP POLICY IF EXISTS "revenue_recognitions_role_update" ON revenue_recognitions;

CREATE POLICY "revenue_recognitions_role_read" ON revenue_recognitions FOR SELECT
    USING (has_min_role_level(organization_id, 800));
CREATE POLICY "revenue_recognitions_role_write" ON revenue_recognitions FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 800));
CREATE POLICY "revenue_recognitions_role_update" ON revenue_recognitions FOR UPDATE
    USING (has_min_role_level(organization_id, 800));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
DROP POLICY IF EXISTS "Org members can view fiscal periods" ON fiscal_periods;
DROP POLICY IF EXISTS "fiscal_periods_org_read" ON fiscal_periods;
DROP POLICY IF EXISTS "fiscal_periods_role_read" ON fiscal_periods;
DROP POLICY IF EXISTS "fiscal_periods_role_write" ON fiscal_periods;
DROP POLICY IF EXISTS "fiscal_periods_role_update" ON fiscal_periods;

CREATE POLICY "fiscal_periods_role_read" ON fiscal_periods FOR SELECT
    USING (has_min_role_level(organization_id, 600));
CREATE POLICY "fiscal_periods_role_write" ON fiscal_periods FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 800));
CREATE POLICY "fiscal_periods_role_update" ON fiscal_periods FOR UPDATE
    USING (has_min_role_level(organization_id, 800));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4h. ACCESS GRANTS — admin+ manage, self read
-- ---------------------------------------------------------------------------

DO $$ BEGIN
ALTER TABLE IF EXISTS access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS access_grants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_grants_read" ON access_grants;
DROP POLICY IF EXISTS "access_grants_write" ON access_grants;
DROP POLICY IF EXISTS "access_grants_role_read" ON access_grants;
DROP POLICY IF EXISTS "access_grants_role_write" ON access_grants;
DROP POLICY IF EXISTS "access_grants_role_update" ON access_grants;
DROP POLICY IF EXISTS "access_grants_role_delete" ON access_grants;

CREATE POLICY "access_grants_role_read" ON access_grants FOR SELECT
    USING (
        has_min_role_level(organization_id, 900)
        OR user_id = auth.uid()
    );
CREATE POLICY "access_grants_role_write" ON access_grants FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "access_grants_role_update" ON access_grants FOR UPDATE
    USING (has_min_role_level(organization_id, 900));
CREATE POLICY "access_grants_role_delete" ON access_grants FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4i. USER ROLES — admin+ manage, self read
-- ---------------------------------------------------------------------------

DO $$ BEGIN
DROP POLICY IF EXISTS "user_roles_org_read" ON user_roles;
DROP POLICY IF EXISTS "user_roles_org_write" ON user_roles;
DROP POLICY IF EXISTS "Org members can view user roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_role_read" ON user_roles;
DROP POLICY IF EXISTS "user_roles_role_write" ON user_roles;
DROP POLICY IF EXISTS "user_roles_role_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_role_delete" ON user_roles;

CREATE POLICY "user_roles_role_read" ON user_roles FOR SELECT
    USING (
        has_min_role_level(organization_id, 600)
        OR user_id = auth.uid()
    );
CREATE POLICY "user_roles_role_write" ON user_roles FOR INSERT
    WITH CHECK (has_min_role_level(organization_id, 900));
CREATE POLICY "user_roles_role_update" ON user_roles FOR UPDATE
    USING (has_min_role_level(organization_id, 900));
CREATE POLICY "user_roles_role_delete" ON user_roles FOR DELETE
    USING (has_min_role_level(organization_id, 900));

EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- 5. ENSURE RLS IS ENABLED ON ALL SENSITIVE TABLES
-- ============================================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'budgets', 'budget_line_items', 'budget_categories', 'budget_phases',
            'budget_alerts', 'budget_scenarios',
            'invoices', 'invoice_line_items', 'payments',
            'expenses', 'expense_receipts', 'reimbursements',
            'payroll_batches', 'pay_stubs', 'pay_rates', 'deductions',
            'rate_cards', 'rate_card_items', 'crew_rate_cards',
            'deals', 'proposals', 'proposal_line_items',
            'pipelines', 'pipeline_stages',
            'employee_profiles',
            'time_entries', 'timesheet_entries', 'timesheets',
            'revenue_recognitions', 'fiscal_periods',
            'access_grants', 'user_roles',
            'canonical_role_hierarchy',
            'permission_overrides'
        ])
    LOOP
        IF to_regclass('public.' || tbl) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 6. INDEX FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_active_lookup
    ON user_roles (user_id, organization_id, is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_roles_slug_lookup
    ON user_roles (organization_id, role_slug, is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_access_grants_active_lookup
    ON access_grants (user_id, organization_id, resource_type, is_active)
    WHERE is_active = TRUE;
