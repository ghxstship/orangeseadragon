-- Migration: Productive.io Time Tracking & Union Labor Rules
-- Created: 2026-02-07
-- Description: Adds union labor rule engine, meal penalty tracking,
--              turnaround violation detection, timer sessions,
--              timesheet periods with locking, and rate card
--              linking for automatic cost calculation.

-- ============================================================================
-- STEP 1: LABOR RULE SETS (Union / Non-Union / Custom)
-- ============================================================================

CREATE TABLE IF NOT EXISTS labor_rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL DEFAULT 'custom'
        CHECK (rule_type IN ('iatse', 'teamsters', 'ibew', 'ua', 'sag_aftra', 'non_union', 'custom')),
    jurisdiction VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Standard hours
    standard_daily_hours DECIMAL(4,2) DEFAULT 8.00,
    standard_weekly_hours DECIMAL(5,2) DEFAULT 40.00,

    -- Overtime rules
    overtime_after_daily_hours DECIMAL(4,2) DEFAULT 8.00,
    overtime_after_weekly_hours DECIMAL(5,2) DEFAULT 40.00,
    overtime_multiplier DECIMAL(3,2) DEFAULT 1.50,
    double_time_after_daily_hours DECIMAL(4,2) DEFAULT 12.00,
    double_time_multiplier DECIMAL(3,2) DEFAULT 2.00,
    golden_time_after_daily_hours DECIMAL(4,2),
    golden_time_multiplier DECIMAL(3,2),

    -- Meal penalties
    meal_break_required_after_hours DECIMAL(4,2) DEFAULT 6.00,
    meal_break_duration_minutes INTEGER DEFAULT 30,
    meal_penalty_amount DECIMAL(10,2) DEFAULT 50.00,
    meal_penalty_per_interval_minutes INTEGER DEFAULT 30,
    meal_penalty_max_intervals INTEGER DEFAULT 3,
    second_meal_after_hours DECIMAL(4,2) DEFAULT 12.00,

    -- Turnaround
    minimum_turnaround_hours DECIMAL(4,2) DEFAULT 10.00,
    turnaround_violation_multiplier DECIMAL(3,2) DEFAULT 1.50,
    forced_call_penalty_amount DECIMAL(10,2),

    -- Rest periods
    rest_break_every_hours DECIMAL(4,2) DEFAULT 4.00,
    rest_break_duration_minutes INTEGER DEFAULT 15,

    -- Weekend / Holiday
    saturday_multiplier DECIMAL(3,2) DEFAULT 1.50,
    sunday_multiplier DECIMAL(3,2) DEFAULT 2.00,
    holiday_multiplier DECIMAL(3,2) DEFAULT 2.50,

    -- Minimums
    minimum_call_hours DECIMAL(4,2) DEFAULT 4.00,
    minimum_call_amount DECIMAL(10,2),

    -- Per diem
    per_diem_amount DECIMAL(10,2),
    per_diem_travel_day_amount DECIMAL(10,2),

    -- Metadata
    effective_date DATE,
    expiration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_labor_rule_sets_org ON labor_rule_sets(organization_id);
CREATE INDEX IF NOT EXISTS idx_labor_rule_sets_type ON labor_rule_sets(rule_type);
CREATE INDEX IF NOT EXISTS idx_labor_rule_sets_active ON labor_rule_sets(organization_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- STEP 2: TIMER SESSIONS (Start/Stop Timer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS timer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,

    -- Timer state
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stopped_at TIMESTAMPTZ,
    is_running BOOLEAN DEFAULT TRUE,

    -- Accumulated time (for pause/resume)
    accumulated_seconds INTEGER DEFAULT 0,
    last_resumed_at TIMESTAMPTZ,

    -- Classification
    description TEXT,
    is_billable BOOLEAN DEFAULT TRUE,

    -- Conversion
    time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timer_sessions_user ON timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_running ON timer_sessions(user_id, is_running) WHERE is_running = TRUE;
CREATE INDEX IF NOT EXISTS idx_timer_sessions_org ON timer_sessions(organization_id);

-- Ensure only one running timer per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_timer_sessions_one_running
    ON timer_sessions(user_id) WHERE is_running = TRUE;

-- ============================================================================
-- STEP 3: TIMESHEET PERIODS (Weekly Locking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS timesheet_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open', 'submitted', 'approved', 'locked', 'rejected')),
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timesheet_periods_org ON timesheet_periods(organization_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_periods_dates ON timesheet_periods(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_timesheet_periods_status ON timesheet_periods(status);

-- ============================================================================
-- STEP 4: MEAL PENALTY RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    crew_checkin_id UUID,
    labor_rule_set_id UUID REFERENCES labor_rule_sets(id) ON DELETE SET NULL,

    -- Penalty details
    penalty_date DATE NOT NULL,
    shift_start TIMESTAMPTZ NOT NULL,
    meal_due_at TIMESTAMPTZ NOT NULL,
    meal_taken_at TIMESTAMPTZ,
    penalty_type VARCHAR(20) NOT NULL DEFAULT 'first_meal'
        CHECK (penalty_type IN ('first_meal', 'second_meal', 'walking_meal')),
    intervals_violated INTEGER DEFAULT 1,
    penalty_amount DECIMAL(10,2) NOT NULL,
    is_waived BOOLEAN DEFAULT FALSE,
    waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    waived_reason TEXT,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_penalties_org ON meal_penalties(organization_id);
CREATE INDEX IF NOT EXISTS idx_meal_penalties_user ON meal_penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_penalties_event ON meal_penalties(event_id);
CREATE INDEX IF NOT EXISTS idx_meal_penalties_date ON meal_penalties(penalty_date);

-- ============================================================================
-- STEP 5: TURNAROUND VIOLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS turnaround_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    labor_rule_set_id UUID REFERENCES labor_rule_sets(id) ON DELETE SET NULL,

    -- Violation details
    previous_shift_end TIMESTAMPTZ NOT NULL,
    next_shift_start TIMESTAMPTZ NOT NULL,
    required_hours DECIMAL(4,2) NOT NULL,
    actual_hours DECIMAL(4,2) NOT NULL,
    shortfall_hours DECIMAL(4,2) GENERATED ALWAYS AS (required_hours - actual_hours) STORED,

    -- Penalty
    penalty_type VARCHAR(20) DEFAULT 'forced_call'
        CHECK (penalty_type IN ('forced_call', 'overtime_rate', 'flat_penalty')),
    penalty_amount DECIMAL(10,2),
    is_waived BOOLEAN DEFAULT FALSE,
    waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    waived_reason TEXT,

    -- Context
    previous_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    next_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turnaround_violations_org ON turnaround_violations(organization_id);
CREATE INDEX IF NOT EXISTS idx_turnaround_violations_user ON turnaround_violations(user_id);

-- ============================================================================
-- STEP 6: ADD LABOR RULE SET REFERENCES TO EXISTING TABLES
-- ============================================================================

-- Add labor_rule_set_id to time_entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'time_entries' AND column_name = 'labor_rule_set_id'
    ) THEN
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS labor_rule_set_id UUID REFERENCES labor_rule_sets(id) ON DELETE SET NULL;
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(6,2) DEFAULT 0;
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS double_time_hours DECIMAL(6,2) DEFAULT 0;
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS regular_hours DECIMAL(6,2) DEFAULT 0;
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS total_cost DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- crew_checkins table does not exist in schema; skipping column additions

-- Add union_status to user profiles or employee_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_profiles'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'employee_profiles' AND column_name = 'union_status'
        ) THEN
            ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS union_status VARCHAR(20) DEFAULT 'non_union'
                CHECK (union_status IN ('iatse', 'teamsters', 'ibew', 'ua', 'sag_aftra', 'non_union', 'other'));
            ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS union_local VARCHAR(50);
            ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS default_labor_rule_set_id UUID REFERENCES labor_rule_sets(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Add timesheet_period_id to time_entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'time_entries' AND column_name = 'timesheet_period_id'
    ) THEN
        ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS timesheet_period_id UUID REFERENCES timesheet_periods(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: RLS POLICIES
-- ============================================================================

ALTER TABLE labor_rule_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY labor_rule_sets_org_isolation ON labor_rule_sets
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY timer_sessions_org_isolation ON timer_sessions
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

ALTER TABLE timesheet_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY timesheet_periods_org_isolation ON timesheet_periods
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

ALTER TABLE meal_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY meal_penalties_org_isolation ON meal_penalties
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

ALTER TABLE turnaround_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY turnaround_violations_org_isolation ON turnaround_violations
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- STEP 8: OVERTIME CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_overtime(
    p_total_hours DECIMAL,
    p_labor_rule_set_id UUID
) RETURNS TABLE (
    regular_hours DECIMAL,
    overtime_hours DECIMAL,
    double_time_hours DECIMAL,
    golden_time_hours DECIMAL
) AS $$
DECLARE
    v_rule labor_rule_sets%ROWTYPE;
    v_remaining DECIMAL;
BEGIN
    SELECT * INTO v_rule FROM labor_rule_sets WHERE id = p_labor_rule_set_id;

    IF NOT FOUND THEN
        -- Default: all regular
        RETURN QUERY SELECT p_total_hours, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
        RETURN;
    END IF;

    v_remaining := p_total_hours;

    -- Golden time
    IF v_rule.golden_time_after_daily_hours IS NOT NULL AND v_remaining > v_rule.golden_time_after_daily_hours THEN
        golden_time_hours := v_remaining - v_rule.golden_time_after_daily_hours;
        v_remaining := v_rule.golden_time_after_daily_hours;
    ELSE
        golden_time_hours := 0;
    END IF;

    -- Double time
    IF v_rule.double_time_after_daily_hours IS NOT NULL AND v_remaining > v_rule.double_time_after_daily_hours THEN
        double_time_hours := v_remaining - v_rule.double_time_after_daily_hours;
        v_remaining := v_rule.double_time_after_daily_hours;
    ELSE
        double_time_hours := 0;
    END IF;

    -- Overtime
    IF v_remaining > v_rule.overtime_after_daily_hours THEN
        overtime_hours := v_remaining - v_rule.overtime_after_daily_hours;
        v_remaining := v_rule.overtime_after_daily_hours;
    ELSE
        overtime_hours := 0;
    END IF;

    -- Regular
    regular_hours := v_remaining;

    RETURN QUERY SELECT regular_hours, overtime_hours, double_time_hours, golden_time_hours;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 9: MEAL PENALTY DETECTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_meal_penalty(
    p_shift_start TIMESTAMPTZ,
    p_last_meal_time TIMESTAMPTZ,
    p_current_time TIMESTAMPTZ,
    p_labor_rule_set_id UUID
) RETURNS TABLE (
    is_violation BOOLEAN,
    penalty_amount DECIMAL,
    intervals_violated INTEGER,
    meal_due_at TIMESTAMPTZ
) AS $$
DECLARE
    v_rule labor_rule_sets%ROWTYPE;
    v_reference_time TIMESTAMPTZ;
    v_hours_since DECIMAL;
    v_intervals INTEGER;
BEGIN
    SELECT * INTO v_rule FROM labor_rule_sets WHERE id = p_labor_rule_set_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::DECIMAL, 0, p_current_time;
        RETURN;
    END IF;

    -- Reference time is either last meal or shift start
    v_reference_time := COALESCE(p_last_meal_time, p_shift_start);
    v_hours_since := EXTRACT(EPOCH FROM (p_current_time - v_reference_time)) / 3600.0;

    IF v_hours_since > v_rule.meal_break_required_after_hours THEN
        -- Calculate intervals violated
        v_intervals := LEAST(
            FLOOR((v_hours_since - v_rule.meal_break_required_after_hours) * 60 / COALESCE(v_rule.meal_penalty_per_interval_minutes, 30)) + 1,
            COALESCE(v_rule.meal_penalty_max_intervals, 3)
        );

        meal_due_at := v_reference_time + (v_rule.meal_break_required_after_hours || ' hours')::INTERVAL;
        is_violation := TRUE;
        penalty_amount := v_intervals * v_rule.meal_penalty_amount;
        intervals_violated := v_intervals;
    ELSE
        is_violation := FALSE;
        penalty_amount := 0;
        intervals_violated := 0;
        meal_due_at := v_reference_time + (v_rule.meal_break_required_after_hours || ' hours')::INTERVAL;
    END IF;

    RETURN QUERY SELECT is_violation, penalty_amount, intervals_violated, meal_due_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- STEP 10: TURNAROUND VIOLATION DETECTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_turnaround_violation(
    p_user_id UUID,
    p_next_shift_start TIMESTAMPTZ,
    p_labor_rule_set_id UUID
) RETURNS TABLE (
    is_violation BOOLEAN,
    previous_shift_end TIMESTAMPTZ,
    required_hours DECIMAL,
    actual_hours DECIMAL,
    shortfall_hours DECIMAL
) AS $$
DECLARE
    v_rule labor_rule_sets%ROWTYPE;
    v_last_checkout TIMESTAMPTZ;
    v_hours_between DECIMAL;
BEGIN
    SELECT * INTO v_rule FROM labor_rule_sets WHERE id = p_labor_rule_set_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
        RETURN;
    END IF;

    -- Find last checkout for this user
    SELECT cc.check_out_time INTO v_last_checkout
    FROM crew_checkins cc
    WHERE cc.crew_member_id = p_user_id
      AND cc.check_out_time IS NOT NULL
      AND cc.check_out_time < p_next_shift_start
    ORDER BY cc.check_out_time DESC
    LIMIT 1;

    IF v_last_checkout IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, v_rule.minimum_turnaround_hours, 0::DECIMAL, 0::DECIMAL;
        RETURN;
    END IF;

    v_hours_between := EXTRACT(EPOCH FROM (p_next_shift_start - v_last_checkout)) / 3600.0;

    IF v_hours_between < v_rule.minimum_turnaround_hours THEN
        RETURN QUERY SELECT
            TRUE,
            v_last_checkout,
            v_rule.minimum_turnaround_hours,
            v_hours_between,
            v_rule.minimum_turnaround_hours - v_hours_between;
    ELSE
        RETURN QUERY SELECT
            FALSE,
            v_last_checkout,
            v_rule.minimum_turnaround_hours,
            v_hours_between,
            0::DECIMAL;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;
