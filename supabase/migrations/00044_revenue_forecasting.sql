-- ATLVS Revenue Forecasting
-- Quotas, Forecasts, and Revenue Projections
-- Migration: 00044

-- ============================================================================
-- QUOTAS (Sales targets by user/team/period)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Target assignment
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID, -- Future: team quotas
    
    -- Period
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Targets
    target_amount DECIMAL(14, 2) NOT NULL,
    target_deals INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Pipeline filter (optional)
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, user_id, period_start, period_end)
);

CREATE INDEX idx_quotas_organization ON quotas(organization_id);
CREATE INDEX idx_quotas_user ON quotas(user_id);
CREATE INDEX idx_quotas_period ON quotas(period_start, period_end);
CREATE INDEX idx_quotas_active ON quotas(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FORECAST SNAPSHOTS (Point-in-time pipeline snapshots)
-- ============================================================================

CREATE TABLE IF NOT EXISTS forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Snapshot metadata
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    snapshot_type VARCHAR(20) DEFAULT 'automatic' CHECK (snapshot_type IN ('automatic', 'manual', 'end_of_period')),
    
    -- Aggregated metrics
    total_pipeline_value DECIMAL(14, 2) NOT NULL DEFAULT 0,
    weighted_pipeline_value DECIMAL(14, 2) NOT NULL DEFAULT 0,
    deal_count INTEGER NOT NULL DEFAULT 0,
    
    -- By stage breakdown
    stage_breakdown JSONB DEFAULT '[]',
    
    -- By owner breakdown
    owner_breakdown JSONB DEFAULT '[]',
    
    -- Forecast projections
    forecast_best_case DECIMAL(14, 2),
    forecast_most_likely DECIMAL(14, 2),
    forecast_worst_case DECIMAL(14, 2),
    
    -- Period context
    period_type VARCHAR(20),
    period_start DATE,
    period_end DATE,
    
    -- Pipeline filter
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forecast_snapshots_organization ON forecast_snapshots(organization_id);
CREATE INDEX idx_forecast_snapshots_date ON forecast_snapshots(snapshot_date DESC);
CREATE INDEX idx_forecast_snapshots_period ON forecast_snapshots(period_start, period_end);

-- ============================================================================
-- FORECAST SCENARIOS (What-if analysis)
-- ============================================================================

CREATE TABLE IF NOT EXISTS forecast_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Scenario type
    scenario_type VARCHAR(20) DEFAULT 'custom' CHECK (scenario_type IN ('best_case', 'worst_case', 'most_likely', 'custom')),
    
    -- Adjustments
    probability_multiplier DECIMAL(5, 2) DEFAULT 1.0,
    value_multiplier DECIMAL(5, 2) DEFAULT 1.0,
    stage_adjustments JSONB DEFAULT '{}', -- per-stage probability overrides
    
    -- Calculated values
    projected_revenue DECIMAL(14, 2),
    projected_deals INTEGER,
    
    -- Period
    period_start DATE,
    period_end DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_forecast_scenarios_organization ON forecast_scenarios(organization_id);

-- ============================================================================
-- FUNCTION: Calculate forecast for a period
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_forecast(
    p_organization_id UUID,
    p_period_start DATE,
    p_period_end DATE,
    p_pipeline_id UUID DEFAULT NULL
) RETURNS TABLE (
    total_value DECIMAL(14, 2),
    weighted_value DECIMAL(14, 2),
    deal_count INTEGER,
    best_case DECIMAL(14, 2),
    most_likely DECIMAL(14, 2),
    worst_case DECIMAL(14, 2)
) AS $$
DECLARE
    v_total DECIMAL(14, 2) := 0;
    v_weighted DECIMAL(14, 2) := 0;
    v_count INTEGER := 0;
BEGIN
    -- Calculate from active deals
    SELECT 
        COALESCE(SUM(d.value), 0),
        COALESCE(SUM(d.value * COALESCE(d.probability, 50) / 100), 0),
        COUNT(*)
    INTO v_total, v_weighted, v_count
    FROM deals d
    WHERE d.organization_id = p_organization_id
      AND d.stage NOT IN ('closed-won', 'closed-lost')
      AND (d.expected_close_date IS NULL OR d.expected_close_date BETWEEN p_period_start AND p_period_end)
      AND (p_pipeline_id IS NULL OR d.pipeline_id = p_pipeline_id);
    
    RETURN QUERY SELECT 
        v_total,
        v_weighted,
        v_count,
        v_total * 1.2, -- Best case: 120% of total
        v_weighted,     -- Most likely: weighted value
        v_weighted * 0.7; -- Worst case: 70% of weighted
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Create daily forecast snapshot
-- ============================================================================

CREATE OR REPLACE FUNCTION create_forecast_snapshot(
    p_organization_id UUID,
    p_pipeline_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_snapshot_id UUID;
    v_total DECIMAL(14, 2);
    v_weighted DECIMAL(14, 2);
    v_count INTEGER;
    v_stage_breakdown JSONB;
    v_owner_breakdown JSONB;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(value), 0),
        COALESCE(SUM(value * COALESCE(probability, 50) / 100), 0),
        COUNT(*)
    INTO v_total, v_weighted, v_count
    FROM deals
    WHERE organization_id = p_organization_id
      AND stage NOT IN ('closed-won', 'closed-lost')
      AND (p_pipeline_id IS NULL OR pipeline_id = p_pipeline_id);
    
    -- Calculate stage breakdown
    SELECT jsonb_agg(jsonb_build_object(
        'stage', stage,
        'count', cnt,
        'value', val,
        'weighted_value', weighted_val
    ))
    INTO v_stage_breakdown
    FROM (
        SELECT 
            stage,
            COUNT(*) as cnt,
            SUM(value) as val,
            SUM(value * COALESCE(probability, 50) / 100) as weighted_val
        FROM deals
        WHERE organization_id = p_organization_id
          AND stage NOT IN ('closed-won', 'closed-lost')
          AND (p_pipeline_id IS NULL OR pipeline_id = p_pipeline_id)
        GROUP BY stage
    ) s;
    
    -- Calculate owner breakdown
    SELECT jsonb_agg(jsonb_build_object(
        'owner_id', owner_id,
        'count', cnt,
        'value', val,
        'weighted_value', weighted_val
    ))
    INTO v_owner_breakdown
    FROM (
        SELECT 
            owner_id,
            COUNT(*) as cnt,
            SUM(value) as val,
            SUM(value * COALESCE(probability, 50) / 100) as weighted_val
        FROM deals
        WHERE organization_id = p_organization_id
          AND stage NOT IN ('closed-won', 'closed-lost')
          AND (p_pipeline_id IS NULL OR pipeline_id = p_pipeline_id)
        GROUP BY owner_id
    ) o;
    
    -- Insert snapshot
    INSERT INTO forecast_snapshots (
        organization_id,
        snapshot_date,
        snapshot_type,
        total_pipeline_value,
        weighted_pipeline_value,
        deal_count,
        stage_breakdown,
        owner_breakdown,
        forecast_best_case,
        forecast_most_likely,
        forecast_worst_case,
        pipeline_id
    ) VALUES (
        p_organization_id,
        CURRENT_DATE,
        'automatic',
        v_total,
        v_weighted,
        v_count,
        COALESCE(v_stage_breakdown, '[]'),
        COALESCE(v_owner_breakdown, '[]'),
        v_total * 1.2,
        v_weighted,
        v_weighted * 0.7,
        p_pipeline_id
    )
    RETURNING id INTO v_snapshot_id;
    
    RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: Quota attainment
-- ============================================================================

CREATE OR REPLACE VIEW quota_attainment AS
SELECT 
    q.*,
    COALESCE(won.total_won, 0) as actual_amount,
    COALESCE(won.deals_won, 0) as actual_deals,
    CASE 
        WHEN q.target_amount > 0 THEN ROUND((COALESCE(won.total_won, 0) / q.target_amount) * 100, 1)
        ELSE 0
    END as attainment_percentage,
    q.target_amount - COALESCE(won.total_won, 0) as gap_amount,
    CASE 
        WHEN q.target_deals > 0 THEN ROUND((COALESCE(won.deals_won, 0)::DECIMAL / q.target_deals) * 100, 1)
        ELSE 0
    END as deals_attainment_percentage
FROM quotas q
LEFT JOIN (
    SELECT 
        organization_id,
        owner_id,
        SUM(value) as total_won,
        COUNT(*) as deals_won
    FROM deals
    WHERE stage = 'closed-won'
      AND won_at IS NOT NULL
    GROUP BY organization_id, owner_id
) won ON q.organization_id = won.organization_id 
      AND q.user_id = won.owner_id
WHERE q.is_active = TRUE;

COMMENT ON VIEW quota_attainment IS 'Quotas with actual attainment calculated from won deals';

-- ============================================================================
-- VIEW: Forecast trend (last 30 days)
-- ============================================================================

CREATE OR REPLACE VIEW forecast_trend AS
SELECT 
    organization_id,
    snapshot_date,
    total_pipeline_value,
    weighted_pipeline_value,
    deal_count,
    LAG(weighted_pipeline_value) OVER (PARTITION BY organization_id ORDER BY snapshot_date) as prev_weighted_value,
    weighted_pipeline_value - LAG(weighted_pipeline_value) OVER (PARTITION BY organization_id ORDER BY snapshot_date) as change_from_previous
FROM forecast_snapshots
WHERE snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY organization_id, snapshot_date DESC;

COMMENT ON VIEW forecast_trend IS 'Forecast snapshots with day-over-day changes';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotas_org_isolation ON quotas;
CREATE POLICY quotas_org_isolation ON quotas
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS forecast_snapshots_org_isolation ON forecast_snapshots;
CREATE POLICY forecast_snapshots_org_isolation ON forecast_snapshots
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS forecast_scenarios_org_isolation ON forecast_scenarios;
CREATE POLICY forecast_scenarios_org_isolation ON forecast_scenarios
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));
