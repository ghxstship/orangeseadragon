-- Migration: SSOT Consolidation
-- Created: 2026-02-02
-- Description: Consolidate duplicate table definitions to establish Single Source of Truth
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- PHASE 1: RATE CARDS CONSOLIDATION
-- ============================================================================
-- Problem: rate_cards defined in both 00004_workforce.sql and 00034_clickup_ssot_business_assets.sql
-- Solution: Create unified rate_cards with rate_type discriminator

-- Create enum for rate card types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rate_card_type') THEN
        CREATE TYPE rate_card_type AS ENUM ('workforce', 'service', 'equipment', 'rental');
    END IF;
END $$;

-- Add rate_type column to existing rate_cards table (from 00034)
ALTER TABLE rate_cards 
    ADD COLUMN IF NOT EXISTS rate_type rate_card_type DEFAULT 'service';

-- Update existing rate cards to have appropriate type
-- Workforce rate cards (from 00004) - these reference positions/skills
UPDATE rate_cards rc
SET rate_type = 'workforce'
WHERE EXISTS (
    SELECT 1 FROM rate_card_items rci 
    WHERE rci.rate_card_id = rc.id 
    AND rci.service_id IS NULL
)
AND rc.rate_type = 'service';

-- Service rate cards - these reference services
UPDATE rate_cards rc
SET rate_type = 'service'
WHERE EXISTS (
    SELECT 1 FROM rate_card_items rci 
    WHERE rci.rate_card_id = rc.id 
    AND rci.service_id IS NOT NULL
);

-- Add position_id and skill_id to rate_card_items for workforce rates
ALTER TABLE rate_card_items 
    ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES skills(id) ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_rate_card_items_position ON rate_card_items(position_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_items_skill ON rate_card_items(skill_id);

-- Create unified view for all rate cards
DROP VIEW IF EXISTS rate_cards_unified;
CREATE VIEW rate_cards_unified AS
SELECT 
    rc.id,
    rc.organization_id,
    rc.name,
    rc.description,
    rc.rate_type,
    rc.effective_date,
    rc.expiration_date,
    rc.is_active,
    rc.created_at,
    rc.updated_at,
    COUNT(rci.id) AS item_count
FROM rate_cards rc
LEFT JOIN rate_card_items rci ON rci.rate_card_id = rc.id
GROUP BY rc.id;

COMMENT ON VIEW rate_cards_unified IS 'SSOT view for all rate cards across workforce, service, and equipment domains';

-- ============================================================================
-- PHASE 2: ADVANCING TABLES CONSOLIDATION
-- ============================================================================
-- Problem: Three advancing models exist:
--   1. advancing (00023) - basic
--   2. site_advances + advance_reports (00034) - site-focused
--   3. production_advances + advance_items (00047) - comprehensive
-- Solution: Keep production_advances as SSOT, migrate data, deprecate others

-- Add columns to production_advances to support site_advances functionality
ALTER TABLE production_advances
    ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS advance_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- Create index for venue
CREATE INDEX IF NOT EXISTS idx_production_advances_venue ON production_advances(venue_id);

-- Migrate data from site_advances to production_advances
INSERT INTO production_advances (
    organization_id,
    event_id,
    advance_code,
    advance_type,
    status,
    due_date,
    venue_id,
    advance_contact_id,
    notes,
    created_at,
    updated_at,
    created_by
)
SELECT 
    sa.organization_id,
    sa.event_id,
    sa.advance_number,
    'pre_event', -- default type for site advances
    CASE sa.status 
        WHEN 'scheduled' THEN 'draft'
        WHEN 'in_progress' THEN 'in_progress'
        WHEN 'completed' THEN 'completed'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'draft'
    END,
    sa.advance_date,
    sa.venue_id,
    sa.advance_contact_id,
    sa.notes,
    sa.created_at,
    sa.updated_at,
    sa.created_by
FROM site_advances sa
WHERE NOT EXISTS (
    SELECT 1 FROM production_advances pa 
    WHERE pa.organization_id = sa.organization_id 
    AND pa.advance_code = sa.advance_number
)
ON CONFLICT (organization_id, advance_code) DO NOTHING;

-- Migrate data from advancing table to production_advances
INSERT INTO production_advances (
    organization_id,
    event_id,
    advance_code,
    advance_type,
    status,
    due_date,
    notes,
    created_at,
    updated_at,
    created_by
)
SELECT 
    a.organization_id,
    a.event_id,
    COALESCE(a.name, 'ADV-' || SUBSTRING(a.id::text, 1, 8)),
    'pre_event',
    CASE a.status 
        WHEN 'pending' THEN 'draft'
        WHEN 'completed' THEN 'completed'
        ELSE 'draft'
    END,
    a.advance_date,
    a.notes,
    a.created_at,
    a.updated_at,
    a.created_by
FROM advancing a
WHERE NOT EXISTS (
    SELECT 1 FROM production_advances pa 
    WHERE pa.organization_id = a.organization_id 
    AND pa.event_id = a.event_id
    AND pa.advance_code = COALESCE(a.name, 'ADV-' || SUBSTRING(a.id::text, 1, 8))
)
ON CONFLICT (organization_id, advance_code) DO NOTHING;

-- Create advance_reports linkage to production_advances
ALTER TABLE advance_reports
    ADD COLUMN IF NOT EXISTS production_advance_id UUID REFERENCES production_advances(id) ON DELETE CASCADE;

-- Migrate advance_reports to link to production_advances
UPDATE advance_reports ar
SET production_advance_id = pa.id
FROM site_advances sa
JOIN production_advances pa ON pa.advance_code = sa.advance_number AND pa.organization_id = sa.organization_id
WHERE ar.site_advance_id = sa.id
AND ar.production_advance_id IS NULL;

-- Drop deprecated tables (data has been migrated to production_advances)
DROP TABLE IF EXISTS site_advances CASCADE;
DROP TABLE IF EXISTS advancing CASCADE;

-- ============================================================================
-- PHASE 3: CREDENTIALS/CERTIFICATIONS CONSOLIDATION
-- ============================================================================
-- Problem: credentials (00023) and user_certifications (00004) overlap
-- Solution: Create unified user_credentials table

-- Create enum for credential types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credential_type') THEN
        CREATE TYPE credential_type AS ENUM ('certification', 'license', 'permit', 'training', 'degree', 'other');
    END IF;
END $$;

-- Create unified user_credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_type credential_type NOT NULL DEFAULT 'certification',
    certification_type_id UUID REFERENCES certification_types(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    credential_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending', 'suspended')),
    document_url TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credentials_org ON user_credentials(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_type ON user_credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_user_credentials_expiry ON user_credentials(expiry_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_credentials_cert_type ON user_credentials(certification_type_id);

-- Migrate data from user_certifications
INSERT INTO user_credentials (
    organization_id,
    user_id,
    credential_type,
    certification_type_id,
    name,
    issuing_authority,
    credential_number,
    issue_date,
    expiry_date,
    status,
    document_url,
    verified_at,
    verified_by,
    created_at,
    updated_at
)
SELECT 
    uc.organization_id,
    uc.user_id,
    'certification',
    uc.certification_type_id,
    COALESCE(ct.name, 'Unknown Certification'),
    COALESCE(uc.issuing_authority, ct.issuing_authority),
    uc.certification_number,
    uc.issued_date,
    uc.expiry_date,
    CASE 
        WHEN uc.expiry_date < NOW() THEN 'expired'
        WHEN uc.verified_at IS NOT NULL THEN 'active'
        ELSE 'pending'
    END,
    uc.document_url,
    uc.verified_at,
    uc.verified_by,
    uc.created_at,
    uc.updated_at
FROM user_certifications uc
LEFT JOIN certification_types ct ON ct.id = uc.certification_type_id
WHERE NOT EXISTS (
    SELECT 1 FROM user_credentials ucr 
    WHERE ucr.user_id = uc.user_id 
    AND ucr.certification_type_id = uc.certification_type_id
)
ON CONFLICT DO NOTHING;

-- Migrate data from credentials table
INSERT INTO user_credentials (
    organization_id,
    user_id,
    credential_type,
    name,
    issuing_authority,
    credential_number,
    issue_date,
    expiry_date,
    status,
    document_url,
    verified_at,
    verified_by,
    created_at,
    updated_at
)
SELECT 
    c.organization_id,
    c.user_id,
    CASE c.credential_type
        WHEN 'certification' THEN 'certification'::credential_type
        WHEN 'license' THEN 'license'::credential_type
        WHEN 'permit' THEN 'permit'::credential_type
        WHEN 'training' THEN 'training'::credential_type
        ELSE 'other'::credential_type
    END,
    c.name,
    c.issuing_authority,
    c.credential_number,
    c.issue_date,
    c.expiry_date,
    COALESCE(c.status, 'active'),
    c.document_url,
    c.verified_at,
    c.verified_by,
    c.created_at,
    c.updated_at
FROM credentials c
WHERE NOT EXISTS (
    SELECT 1 FROM user_credentials ucr 
    WHERE ucr.user_id = c.user_id 
    AND ucr.name = c.name
    AND ucr.credential_number = c.credential_number
)
ON CONFLICT DO NOTHING;

-- Drop deprecated tables (data has been migrated to user_credentials)
DROP TABLE IF EXISTS user_certifications CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;

-- ============================================================================
-- PHASE 4: TIME ENTRIES CONSOLIDATION
-- ============================================================================
-- Problem: time_entries (00029) and timesheet_entries (00004) overlap
-- Solution: Keep time_entries as SSOT, create view for timesheet aggregation

-- Add missing columns to time_entries to support timesheet_entries functionality
ALTER TABLE time_entries
    ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(6,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS entry_type VARCHAR(50) DEFAULT 'regular' 
        CHECK (entry_type IN ('regular', 'overtime', 'pto', 'sick', 'holiday'));

-- Create timesheet aggregation view (replaces timesheet_entries)
CREATE OR REPLACE VIEW timesheet_entries_unified AS
SELECT 
    te.id,
    te.org_id AS organization_id,
    te.user_id,
    te.project_id,
    te.task_id,
    te.date,
    te.hours,
    te.overtime_hours,
    te.break_minutes,
    te.description,
    te.billable,
    te.hourly_rate,
    te.status,
    te.approved_by_id,
    te.approved_at,
    te.entry_type,
    te.created_at,
    te.updated_at
FROM time_entries te;

-- Create weekly timesheet summary view
CREATE OR REPLACE VIEW timesheets_weekly_summary AS
SELECT 
    te.org_id AS organization_id,
    te.user_id,
    DATE_TRUNC('week', te.date)::DATE AS week_start,
    (DATE_TRUNC('week', te.date) + INTERVAL '6 days')::DATE AS week_end,
    SUM(te.hours) AS total_hours,
    SUM(te.overtime_hours) AS total_overtime_hours,
    SUM(CASE WHEN te.billable THEN te.hours ELSE 0 END) AS billable_hours,
    SUM(CASE WHEN NOT te.billable THEN te.hours ELSE 0 END) AS non_billable_hours,
    SUM(te.hours * COALESCE(te.hourly_rate, 0)) AS total_value,
    COUNT(DISTINCT te.project_id) AS projects_worked,
    COUNT(*) AS entry_count,
    CASE 
        WHEN COUNT(*) FILTER (WHERE te.status = 'rejected') > 0 THEN 'rejected'
        WHEN COUNT(*) FILTER (WHERE te.status = 'draft') > 0 THEN 'draft'
        WHEN COUNT(*) FILTER (WHERE te.status = 'submitted') > 0 THEN 'submitted'
        WHEN COUNT(*) = COUNT(*) FILTER (WHERE te.status = 'approved') THEN 'approved'
        ELSE 'mixed'
    END AS status
FROM time_entries te
GROUP BY te.org_id, te.user_id, DATE_TRUNC('week', te.date);

COMMENT ON VIEW timesheet_entries_unified IS 'SSOT view for time entries.';
COMMENT ON VIEW timesheets_weekly_summary IS 'Weekly aggregation of time entries for timesheet review.';

-- Drop deprecated table (data should be migrated to time_entries)
DROP TABLE IF EXISTS timesheet_entries CASCADE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_credentials_org_read" ON user_credentials;
CREATE POLICY "user_credentials_org_read" ON user_credentials 
    FOR SELECT USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "user_credentials_org_insert" ON user_credentials;
CREATE POLICY "user_credentials_org_insert" ON user_credentials 
    FOR INSERT WITH CHECK (is_organization_member(organization_id));
DROP POLICY IF EXISTS "user_credentials_org_update" ON user_credentials;
CREATE POLICY "user_credentials_org_update" ON user_credentials 
    FOR UPDATE USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "user_credentials_org_delete" ON user_credentials;
CREATE POLICY "user_credentials_org_delete" ON user_credentials 
    FOR DELETE USING (is_organization_member(organization_id));

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_user_credentials_updated_at ON user_credentials;
CREATE TRIGGER trg_user_credentials_updated_at
    BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
