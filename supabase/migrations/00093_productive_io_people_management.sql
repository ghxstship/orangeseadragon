-- Migration: Productive.io People Management Enhancements
-- Created: 2026-02-07
-- Description: Adds holiday calendars, approval policies, time-off entitlements,
--              and crew preference fields for live production workforce management.

-- ============================================================================
-- STEP 1: HOLIDAY CALENDARS
-- ============================================================================

CREATE TABLE IF NOT EXISTS holiday_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    region VARCHAR(100),
    country_code VARCHAR(3),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_holiday_calendars_org ON holiday_calendars(organization_id);

CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL REFERENCES holiday_calendars(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    is_recurring BOOLEAN DEFAULT TRUE,
    holiday_type VARCHAR(30) DEFAULT 'public'
        CHECK (holiday_type IN ('public', 'company', 'regional', 'optional')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holidays_calendar ON holidays(calendar_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);

-- ============================================================================
-- STEP 2: APPROVAL POLICIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Policy rules (JSON array of approval steps)
    approval_steps JSONB NOT NULL DEFAULT '[]',

    -- Conditions for when this policy applies
    conditions JSONB DEFAULT '{}',

    -- Auto-approve settings
    auto_approve_below_amount DECIMAL(14,2),
    auto_approve_for_roles TEXT[],

    -- Escalation
    escalation_timeout_hours INTEGER DEFAULT 48,
    escalation_to UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_approval_policies_org ON approval_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_policies_entity ON approval_policies(organization_id, entity_type);

-- ============================================================================
-- STEP 3: TIME-OFF ENTITLEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS time_off_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    leave_type VARCHAR(50) NOT NULL
        CHECK (leave_type IN ('annual', 'sick', 'personal', 'parental', 'bereavement', 'jury_duty', 'comp_time', 'unpaid', 'custom')),
    custom_type_name VARCHAR(100),

    -- Entitlement
    total_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,1) DEFAULT 0,
    pending_days DECIMAL(5,1) DEFAULT 0,
    remaining_days DECIMAL(5,1) GENERATED ALWAYS AS (total_days - used_days - pending_days) STORED,

    -- Accrual
    accrual_type VARCHAR(20) DEFAULT 'annual'
        CHECK (accrual_type IN ('annual', 'monthly', 'per_pay_period', 'none')),
    accrual_rate DECIMAL(5,2),
    max_carryover_days DECIMAL(5,1),
    carryover_expiry_date DATE,

    -- Period
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    fiscal_year INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_entitlement UNIQUE (organization_id, user_id, leave_type, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON time_off_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_org ON time_off_entitlements(organization_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_type ON time_off_entitlements(leave_type);

-- ============================================================================
-- STEP 4: CREW PREFERENCE FIELDS ON EMPLOYEE PROFILES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'tshirt_size'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10);
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(100);
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS medical_notes TEXT;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS preferred_pronouns VARCHAR(50);
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(255);
    END IF;
END $$;

-- Add blackout dates / availability preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'blackout_dates'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS blackout_dates JSONB DEFAULT '[]';
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS preferred_regions TEXT[];
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS max_travel_days_per_month INTEGER;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS w9_on_file BOOLEAN DEFAULT FALSE;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS w9_submitted_at TIMESTAMPTZ;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS nda_signed BOOLEAN DEFAULT FALSE;
        ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS nda_signed_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: UPDATE ENTITLEMENT ON LEAVE APPROVAL
-- ============================================================================

CREATE OR REPLACE FUNCTION update_entitlement_on_leave()
RETURNS TRIGGER AS $$
DECLARE
    v_days DECIMAL(5,1);
BEGIN
    -- Calculate leave days
    IF NEW.end_date IS NOT NULL AND NEW.start_date IS NOT NULL THEN
        v_days := (NEW.end_date - NEW.start_date)::decimal + 1;
    ELSE
        v_days := 1;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Leave approved: move from pending to used
        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
            UPDATE time_off_entitlements SET
                used_days = used_days + v_days,
                pending_days = GREATEST(pending_days - v_days, 0),
                updated_at = NOW()
            WHERE user_id = NEW.user_id
              AND leave_type = COALESCE(NEW.leave_type, 'annual')
              AND fiscal_year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        -- Leave rejected/cancelled: remove from pending
        IF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'pending' THEN
            UPDATE time_off_entitlements SET
                pending_days = GREATEST(pending_days - v_days, 0),
                updated_at = NOW()
            WHERE user_id = NEW.user_id
              AND leave_type = COALESCE(NEW.leave_type, 'annual')
              AND fiscal_year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- New leave request: add to pending
        IF NEW.status = 'pending' THEN
            UPDATE time_off_entitlements SET
                pending_days = pending_days + v_days,
                updated_at = NOW()
            WHERE user_id = NEW.user_id
              AND leave_type = COALESCE(NEW.leave_type, 'annual')
              AND fiscal_year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_entitlement_on_leave ON leave_requests;
CREATE TRIGGER trg_update_entitlement_on_leave
    AFTER INSERT OR UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_entitlement_on_leave();

-- ============================================================================
-- STEP 6: WORKING DAYS CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_working_days(
    p_start_date DATE,
    p_end_date DATE,
    p_calendar_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_date DATE;
    v_is_holiday BOOLEAN;
BEGIN
    FOR v_date IN SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date
    LOOP
        -- Skip weekends
        IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN CONTINUE; END IF;

        -- Skip holidays if calendar provided
        v_is_holiday := FALSE;
        IF p_calendar_id IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM holidays
                WHERE calendar_id = p_calendar_id
                  AND date = v_date
            ) INTO v_is_holiday;
        END IF;

        IF NOT v_is_holiday THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: RLS POLICIES
-- ============================================================================

ALTER TABLE holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY holiday_calendars_org_isolation ON holiday_calendars
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY holidays_org_isolation ON holidays
    USING (calendar_id IN (
        SELECT id FROM holiday_calendars WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY approval_policies_org_isolation ON approval_policies
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY entitlements_org_isolation ON time_off_entitlements
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
