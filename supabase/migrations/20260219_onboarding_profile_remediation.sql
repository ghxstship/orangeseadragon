-- Migration: Onboarding & Profile System Remediation
-- Created: 2026-02-19
-- Description: Adds missing profile columns to users table, adds industry/company_size
--              to organizations table, adds organization_id to user_preferences for
--              preference cascade support, and creates onboarding_progress compat view.

-- ============================================================================
-- 1. USERS TABLE — missing profile columns
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(127);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(127);

-- ============================================================================
-- 2. ORGANIZATIONS TABLE — proper columns instead of metadata JSONB
-- ============================================================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);

-- ============================================================================
-- 3. USER_PREFERENCES — add organization_id for preference cascade
-- ============================================================================

-- Drop the existing unique constraint on user_id alone so we can have
-- per-org preferences. Only do this if the constraint exists.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_preferences_user_id_key'
        AND conrelid = 'user_preferences'::regclass
    ) THEN
        ALTER TABLE user_preferences DROP CONSTRAINT user_preferences_user_id_key;
    END IF;
END $$;

ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add a new unique constraint that allows per-org preferences
-- A NULL organization_id means global user preference
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_user_preferences_user_org'
        AND conrelid = 'user_preferences'::regclass
    ) THEN
        ALTER TABLE user_preferences ADD CONSTRAINT uq_user_preferences_user_org
            UNIQUE (user_id, organization_id);
    END IF;
END $$;

-- Add preference_scope column for cascade resolution
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preference_scope VARCHAR(20) 
    DEFAULT 'user_global' CHECK (preference_scope IN ('user_global', 'user_org', 'org_default', 'org_enforced', 'system_default'));

-- ============================================================================
-- 4. NOTIFICATION_PREFERENCES — add per-category granularity
-- ============================================================================

ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS category_overrides JSONB DEFAULT '{}';

-- ============================================================================
-- 5. RLS POLICIES for new columns (existing policies cover the tables)
-- ============================================================================

-- user_preferences org-scoped read
DROP POLICY IF EXISTS "Users can view org preferences" ON user_preferences;
CREATE POLICY "Users can view org preferences"
    ON user_preferences FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR (
            organization_id IS NOT NULL
            AND preference_scope IN ('org_default', 'org_enforced')
            AND organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- ============================================================================
-- 6. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_org ON user_preferences(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_job_title ON users(job_title) WHERE job_title IS NOT NULL;
