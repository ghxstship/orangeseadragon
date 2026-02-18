-- ============================================================================
-- Migration 20260223: Create missing tables referenced by API routes
-- consent_records, dashboard_layouts, data_deletion_requests
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. consent_records — GDPR/privacy consent audit trail
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category text NOT NULL,
    granted boolean NOT NULL DEFAULT false,
    version text NOT NULL DEFAULT '1.0.0',
    ip_address text,
    user_agent text,
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_category ON consent_records(user_id, category);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records FORCE ROW LEVEL SECURITY;

CREATE POLICY "consent_records_self_read" ON consent_records FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "consent_records_self_write" ON consent_records FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. dashboard_layouts — user-customizable dashboard widget layouts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    widgets jsonb NOT NULL DEFAULT '[]'::jsonb,
    columns integer NOT NULL DEFAULT 12,
    is_shared boolean NOT NULL DEFAULT false,
    is_default boolean NOT NULL DEFAULT false,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_org_id ON dashboard_layouts(organization_id);

ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts FORCE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_layouts_owner_read" ON dashboard_layouts FOR SELECT
    USING (
        user_id = auth.uid()
        OR (is_shared = true AND organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        ))
    );
CREATE POLICY "dashboard_layouts_owner_write" ON dashboard_layouts FOR INSERT
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "dashboard_layouts_owner_update" ON dashboard_layouts FOR UPDATE
    USING (user_id = auth.uid());
CREATE POLICY "dashboard_layouts_owner_delete" ON dashboard_layouts FOR DELETE
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. data_deletion_requests — GDPR Article 17 right to erasure
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    reason text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    requested_at timestamptz NOT NULL DEFAULT now(),
    scheduled_deletion_at timestamptz,
    processed_at timestamptz,
    processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON data_deletion_requests(status);

ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY "data_deletion_requests_self_read" ON data_deletion_requests FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "data_deletion_requests_self_write" ON data_deletion_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());
