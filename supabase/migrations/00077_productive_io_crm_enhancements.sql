-- Migration: Productive.io CRM Enhancements
-- Created: 2026-02-07
-- Description: Adds deal-to-project conversion, hold management,
--              deal-to-budget linking, and production type tagging on deals.

-- ============================================================================
-- STEP 1: DEAL ENHANCEMENTS
-- ============================================================================

-- Add production_type to deals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'production_type'
    ) THEN
        ALTER TABLE deals ADD COLUMN production_type VARCHAR(50);
    END IF;
END $$;

-- Add hold management fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'hold_status'
    ) THEN
        ALTER TABLE deals ADD COLUMN hold_status VARCHAR(30)
            CHECK (hold_status IN ('no_hold', 'first_hold', 'second_hold', 'confirmed', 'released', 'challenged'));
        ALTER TABLE deals ADD COLUMN hold_date TIMESTAMPTZ;
        ALTER TABLE deals ADD COLUMN hold_expires_at TIMESTAMPTZ;
        ALTER TABLE deals ADD COLUMN hold_notes TEXT;
    END IF;
END $$;

-- Add deal-to-budget linking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'estimated_budget'
    ) THEN
        ALTER TABLE deals ADD COLUMN estimated_budget DECIMAL(14,2);
        ALTER TABLE deals ADD COLUMN estimated_margin_percent DECIMAL(5,2);
        ALTER TABLE deals ADD COLUMN estimated_costs DECIMAL(14,2);
    END IF;
END $$;

-- Add conversion tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'converted_project_id'
    ) THEN
        ALTER TABLE deals ADD COLUMN converted_project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
        ALTER TABLE deals ADD COLUMN converted_at TIMESTAMPTZ;
        ALTER TABLE deals ADD COLUMN converted_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add referral source
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'referral_source'
    ) THEN
        ALTER TABLE deals ADD COLUMN referral_source VARCHAR(255);
        ALTER TABLE deals ADD COLUMN referral_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add win/loss tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'loss_reason'
    ) THEN
        ALTER TABLE deals ADD COLUMN loss_reason VARCHAR(50)
            CHECK (loss_reason IN ('price', 'timing', 'competition', 'scope', 'relationship', 'budget_cut', 'no_decision', 'other'));
        ALTER TABLE deals ADD COLUMN loss_notes TEXT;
        ALTER TABLE deals ADD COLUMN competitor_name VARCHAR(255);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_production_type ON deals(production_type);
CREATE INDEX IF NOT EXISTS idx_deals_hold_status ON deals(hold_status);
CREATE INDEX IF NOT EXISTS idx_deals_converted_project ON deals(converted_project_id);

-- ============================================================================
-- STEP 2: DEAL-TO-PROJECT CONVERSION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION convert_deal_to_project(
    p_deal_id UUID,
    p_user_id UUID,
    p_create_budget BOOLEAN DEFAULT TRUE,
    p_budget_template_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_deal deals%ROWTYPE;
    v_project_id UUID;
    v_budget_id UUID;
    v_org_id UUID;
BEGIN
    -- Get deal
    SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal not found: %', p_deal_id;
    END IF;

    -- Check not already converted
    IF v_deal.converted_project_id IS NOT NULL THEN
        RAISE EXCEPTION 'Deal already converted to project: %', v_deal.converted_project_id;
    END IF;

    v_org_id := v_deal.organization_id;

    -- Create project
    INSERT INTO projects (
        organization_id,
        name,
        description,
        client_id,
        status,
        start_date,
        created_by
    ) VALUES (
        v_org_id,
        v_deal.name,
        'Converted from deal: ' || v_deal.name,
        v_deal.company_id,
        'planning',
        COALESCE(v_deal.close_date, CURRENT_DATE),
        p_user_id
    ) RETURNING id INTO v_project_id;

    -- Create budget if requested
    IF p_create_budget AND v_deal.value IS NOT NULL THEN
        INSERT INTO budgets (
            organization_id,
            project_id,
            name,
            budget_type,
            period_type,
            start_date,
            end_date,
            total_amount,
            revenue_amount,
            status,
            created_by
        ) VALUES (
            v_org_id,
            v_project_id,
            v_deal.name || ' Budget',
            'fixed_price',
            'project',
            COALESCE(v_deal.close_date, CURRENT_DATE),
            COALESCE(v_deal.close_date, CURRENT_DATE) + INTERVAL '90 days',
            COALESCE(v_deal.value, 0),
            COALESCE(v_deal.value, 0),
            'draft',
            p_user_id
        ) RETURNING id INTO v_budget_id;

        -- If budget template provided, copy line items
        IF p_budget_template_id IS NOT NULL THEN
            INSERT INTO budget_line_items (budget_id, category_id, name, description, planned_amount)
            SELECT v_budget_id, btli.category_id, btli.name, btli.description,
                   COALESCE(btli.default_amount, 0)
            FROM budget_template_line_items btli
            WHERE btli.template_id = p_budget_template_id
            ORDER BY btli.sort_order;
        END IF;
    END IF;

    -- Update deal with conversion info
    UPDATE deals SET
        converted_project_id = v_project_id,
        converted_at = NOW(),
        converted_by = p_user_id,
        stage = 'closed_won',
        updated_at = NOW()
    WHERE id = p_deal_id;

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: VENUE HOLDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS venue_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    hold_type VARCHAR(30) NOT NULL DEFAULT 'first_hold'
        CHECK (hold_type IN ('first_hold', 'second_hold', 'confirmed', 'tentative')),
    hold_date DATE NOT NULL,
    hold_end_date DATE,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'confirmed', 'released', 'expired', 'challenged')),

    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    released_by UUID REFERENCES users(id) ON DELETE SET NULL,
    released_at TIMESTAMPTZ,
    release_reason TEXT,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_holds_org ON venue_holds(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_holds_venue ON venue_holds(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_holds_deal ON venue_holds(deal_id);
CREATE INDEX IF NOT EXISTS idx_venue_holds_date ON venue_holds(hold_date, hold_end_date);
CREATE INDEX IF NOT EXISTS idx_venue_holds_status ON venue_holds(status);
CREATE INDEX IF NOT EXISTS idx_venue_holds_expires ON venue_holds(expires_at) WHERE status = 'active';

-- ============================================================================
-- STEP 4: RLS POLICIES
-- ============================================================================

ALTER TABLE venue_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY venue_holds_org_isolation ON venue_holds
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- STEP 5: AUTO-EXPIRE HOLDS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_venue_holds()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE venue_holds SET
        status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
