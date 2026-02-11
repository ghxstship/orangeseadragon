-- ============================================================================
-- MIGRATION 00109: Fiscal Year Configuration + Financial Period Closing
-- ============================================================================
-- Addresses gap: No fiscal year settings, no period closing mechanism
-- Enables: Configurable fiscal years, monthly/quarterly close process,
--          period locking to prevent retroactive changes
-- ============================================================================

-- Fiscal year configuration per organization
CREATE TABLE IF NOT EXISTS fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, name)
);

-- Financial periods (months within a fiscal year)
CREATE TABLE IF NOT EXISTS financial_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    period_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closing', 'closed', 'locked')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(fiscal_year_id, period_number)
);

-- Period close checklist items
CREATE TABLE IF NOT EXISTS period_close_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    financial_period_id UUID NOT NULL REFERENCES financial_periods(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT true,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(financial_period_id, item_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fiscal_years_org ON fiscal_years(organization_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_years_current ON fiscal_years(organization_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_financial_periods_fy ON financial_periods(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_financial_periods_org ON financial_periods(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_periods_dates ON financial_periods(organization_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_period_close_checklist_period ON period_close_checklist(financial_period_id);

-- RLS policies
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_close_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fiscal_years_org_isolation" ON fiscal_years
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "financial_periods_org_isolation" ON financial_periods
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "period_close_checklist_org_isolation" ON period_close_checklist
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Function: Generate monthly periods for a fiscal year
CREATE OR REPLACE FUNCTION generate_fiscal_year_periods(p_fiscal_year_id UUID)
RETURNS VOID AS $$
DECLARE
    v_fy RECORD;
    v_period_start DATE;
    v_period_end DATE;
    v_period_num INT := 1;
BEGIN
    SELECT * INTO v_fy FROM fiscal_years WHERE id = p_fiscal_year_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Fiscal year not found'; END IF;

    v_period_start := v_fy.start_date;

    WHILE v_period_start < v_fy.end_date LOOP
        v_period_end := LEAST(
            (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
            v_fy.end_date
        );

        INSERT INTO financial_periods (
            organization_id, fiscal_year_id, name, period_number,
            start_date, end_date, status
        ) VALUES (
            v_fy.organization_id, p_fiscal_year_id,
            TO_CHAR(v_period_start, 'Mon YYYY'),
            v_period_num,
            v_period_start, v_period_end, 'open'
        ) ON CONFLICT (fiscal_year_id, period_number) DO NOTHING;

        v_period_start := (v_period_start + INTERVAL '1 month')::DATE;
        v_period_num := v_period_num + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Close a financial period with validation
CREATE OR REPLACE FUNCTION close_financial_period(
    p_period_id UUID,
    p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_period RECORD;
    v_incomplete_count INT;
    v_result JSONB;
BEGIN
    SELECT * INTO v_period FROM financial_periods WHERE id = p_period_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Period not found'; END IF;
    IF v_period.status IN ('closed', 'locked') THEN
        RAISE EXCEPTION 'Period is already closed';
    END IF;

    -- Check required checklist items
    SELECT COUNT(*) INTO v_incomplete_count
    FROM period_close_checklist
    WHERE financial_period_id = p_period_id
      AND is_required = true
      AND is_completed = false;

    IF v_incomplete_count > 0 THEN
        v_result := jsonb_build_object(
            'success', false,
            'error', format('%s required checklist items are incomplete', v_incomplete_count)
        );
        RETURN v_result;
    END IF;

    -- Close the period
    UPDATE financial_periods
    SET status = 'closed',
        closed_at = now(),
        closed_by = p_user_id,
        updated_at = now()
    WHERE id = p_period_id;

    v_result := jsonb_build_object(
        'success', true,
        'period_id', p_period_id,
        'closed_at', now()
    );
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed default close checklist template items
-- These get cloned when a period enters 'closing' status
CREATE TABLE IF NOT EXISTS period_close_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE(organization_id, item_key)
);

ALTER TABLE period_close_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "period_close_template_items_org_isolation" ON period_close_template_items
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
