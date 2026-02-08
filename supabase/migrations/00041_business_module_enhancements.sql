-- ATLVS Business Module Enhancements
-- Deal Rotting, Multiple Pipelines, Activity Timeline Integration
-- Migration: 00041

-- ============================================================================
-- PIPELINES TABLE (Multiple Pipelines Support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    pipeline_type VARCHAR(50) DEFAULT 'sales', -- sales, renewals, partnerships, custom
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}', -- rotting_days_default, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, name)
);

CREATE INDEX idx_pipelines_organization ON pipelines(organization_id);
CREATE INDEX idx_pipelines_default ON pipelines(organization_id, is_default) WHERE is_default = TRUE;

-- ============================================================================
-- ENHANCE PIPELINE_STAGES (Add pipeline_id, rotting_days)
-- ============================================================================

-- Add pipeline_id to pipeline_stages if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pipeline_stages' AND column_name = 'pipeline_id') THEN
        ALTER TABLE pipeline_stages ADD COLUMN pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add rotting_days to pipeline_stages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pipeline_stages' AND column_name = 'rotting_days') THEN
        ALTER TABLE pipeline_stages ADD COLUMN rotting_days INTEGER DEFAULT 7;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);

-- ============================================================================
-- ENHANCE DEALS TABLE (Add last_activity_at, pipeline_id)
-- ============================================================================

-- Add last_activity_at for deal rotting indicators
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'last_activity_at') THEN
        ALTER TABLE deals ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add pipeline_id to deals
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        ALTER TABLE deals ADD COLUMN pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add stage_id to deals (references pipeline_stages instead of text stage)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'stage_id') THEN
        ALTER TABLE deals ADD COLUMN stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_last_activity ON deals(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_deals_rotting ON deals(organization_id, last_activity_at) 
    WHERE stage NOT IN ('closed-won', 'closed-lost');

-- ============================================================================
-- ENHANCE ACTIVITIES TABLE (Add duration_minutes, metadata)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'activities' AND column_name = 'duration_minutes') THEN
        ALTER TABLE activities ADD COLUMN duration_minutes INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'activities' AND column_name = 'metadata') THEN
        ALTER TABLE activities ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add occurred_at for when activity actually happened (vs created_at)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'activities' AND column_name = 'occurred_at') THEN
        ALTER TABLE activities ADD COLUMN occurred_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activities_occurred ON activities(occurred_at DESC);

-- ============================================================================
-- TRIGGER: Auto-update deals.last_activity_at when activity is created
-- ============================================================================

CREATE OR REPLACE FUNCTION update_deal_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the deal's last_activity_at when a new activity is created
    IF NEW.deal_id IS NOT NULL THEN
        UPDATE deals 
        SET last_activity_at = COALESCE(NEW.occurred_at, NEW.created_at),
            updated_at = NOW()
        WHERE id = NEW.deal_id;
    END IF;
    
    -- Also update company and contact last activity if we add those fields later
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deal_last_activity ON activities;
CREATE TRIGGER trigger_update_deal_last_activity
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_last_activity();

-- ============================================================================
-- TRIGGER: Auto-update deals.last_activity_at on deal stage change
-- ============================================================================

CREATE OR REPLACE FUNCTION update_deal_activity_on_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If stage changed, update last_activity_at
    IF OLD.stage IS DISTINCT FROM NEW.stage OR OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
        NEW.last_activity_at = NOW();
        
        -- Also create an activity record for the stage change
        INSERT INTO activities (
            organization_id,
            activity_type,
            subject,
            description,
            deal_id,
            company_id,
            contact_id,
            occurred_at,
            is_completed,
            created_by
        ) VALUES (
            NEW.organization_id,
            'stage_change',
            'Deal stage changed to ' || COALESCE(NEW.stage, 'unknown'),
            'Deal moved from ' || COALESCE(OLD.stage, 'unknown') || ' to ' || COALESCE(NEW.stage, 'unknown'),
            NEW.id,
            NEW.company_id,
            NEW.contact_id,
            NOW(),
            TRUE,
            NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deal_stage_change_activity ON deals;
CREATE TRIGGER trigger_deal_stage_change_activity
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_activity_on_stage_change();

-- ============================================================================
-- ADD activity_type ENUM VALUE IF NOT EXISTS
-- ============================================================================

DO $$ 
BEGIN
    -- Check if 'stage_change' exists in activity_type enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'stage_change' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'activity_type')
    ) THEN
        ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'stage_change';
    END IF;
END $$;

-- ============================================================================
-- SEED DEFAULT PIPELINE FOR EXISTING ORGANIZATIONS
-- ============================================================================

-- Create default pipeline for each organization that doesn't have one
INSERT INTO pipelines (organization_id, name, description, pipeline_type, is_default)
SELECT DISTINCT 
    o.id,
    'Sales Pipeline',
    'Default sales pipeline',
    'sales',
    TRUE
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM pipelines p WHERE p.organization_id = o.id
)
ON CONFLICT DO NOTHING;

-- Link existing pipeline_stages to the default pipeline
UPDATE pipeline_stages ps
SET pipeline_id = (
    SELECT p.id FROM pipelines p 
    WHERE p.organization_id = ps.organization_id 
    AND p.is_default = TRUE
    LIMIT 1
)
WHERE ps.pipeline_id IS NULL;

-- Link existing deals to the default pipeline
UPDATE deals d
SET pipeline_id = (
    SELECT p.id FROM pipelines p 
    WHERE p.organization_id = d.organization_id 
    AND p.is_default = TRUE
    LIMIT 1
)
WHERE d.pipeline_id IS NULL;

-- ============================================================================
-- RLS POLICIES FOR PIPELINES
-- ============================================================================

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pipelines_org_isolation ON pipelines;
CREATE POLICY pipelines_org_isolation ON pipelines
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- VIEW: Deals with rotting status
-- ============================================================================

CREATE OR REPLACE VIEW deals_with_rotting AS
SELECT 
    d.*,
    COALESCE(ps.rotting_days, 7) as rotting_threshold_days,
    EXTRACT(EPOCH FROM (NOW() - d.last_activity_at)) / 86400 as days_since_activity,
    CASE 
        WHEN d.stage IN ('closed-won', 'closed-lost') THEN FALSE
        WHEN d.last_activity_at IS NULL THEN TRUE
        WHEN EXTRACT(EPOCH FROM (NOW() - d.last_activity_at)) / 86400 > COALESCE(ps.rotting_days, 7) THEN TRUE
        ELSE FALSE
    END as is_rotting
FROM deals d
LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id OR d.stage = ps.slug;

COMMENT ON VIEW deals_with_rotting IS 'Deals enriched with rotting status based on last activity';
