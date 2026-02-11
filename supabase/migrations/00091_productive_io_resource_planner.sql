-- Migration: Productive.io Resource Planner Enhancements
-- Created: 2026-02-07
-- Description: Adds resource bookings with conflict detection, placeholders,
--              tentative bookings, utilization tracking, and capacity indicators.

-- ============================================================================
-- STEP 1: RESOURCE BOOKINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Who is booked
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

    -- What they're booked for
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,

    -- Booking details
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    booking_type VARCHAR(30) NOT NULL DEFAULT 'confirmed'
        CHECK (booking_type IN ('confirmed', 'tentative', 'placeholder', 'soft_hold')),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),

    -- Time range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours_per_day DECIMAL(4,2) DEFAULT 8.0,
    total_hours DECIMAL(8,2),
    allocation_percent INTEGER DEFAULT 100 CHECK (allocation_percent BETWEEN 1 AND 100),

    -- Rate / cost
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    estimated_cost DECIMAL(14,2),
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    labor_rule_set_id UUID REFERENCES labor_rule_sets(id) ON DELETE SET NULL,

    -- Placeholder details (when user_id is NULL)
    placeholder_name VARCHAR(255),
    required_skills TEXT[],
    required_certifications TEXT[],
    min_experience_years INTEGER,

    -- Confirmation workflow
    confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    offer_sent_at TIMESTAMPTZ,
    offer_accepted_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,
    internal_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT chk_booking_has_person CHECK (user_id IS NOT NULL OR contact_id IS NOT NULL OR placeholder_name IS NOT NULL),
    CONSTRAINT chk_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_resource_bookings_org ON resource_bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_user ON resource_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_contact ON resource_bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_project ON resource_bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_event ON resource_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_dates ON resource_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_type ON resource_bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_status ON resource_bookings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_resource_bookings_budget ON resource_bookings(budget_id);

-- ============================================================================
-- STEP 2: BOOKING CONFLICTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    booking_a_id UUID NOT NULL REFERENCES resource_bookings(id) ON DELETE CASCADE,
    booking_b_id UUID NOT NULL REFERENCES resource_bookings(id) ON DELETE CASCADE,
    conflict_type VARCHAR(30) NOT NULL DEFAULT 'overlap'
        CHECK (conflict_type IN ('overlap', 'over_allocation', 'skill_mismatch', 'certification_expired', 'travel_conflict')),
    severity VARCHAR(20) DEFAULT 'warning'
        CHECK (severity IN ('info', 'warning', 'critical')),
    overlap_start DATE,
    overlap_end DATE,
    total_allocation INTEGER,
    resolution VARCHAR(30)
        CHECK (resolution IN ('unresolved', 'accepted', 'rebooking_a', 'rebooking_b', 'split', 'dismissed')),
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_different_bookings CHECK (booking_a_id != booking_b_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_conflicts_org ON booking_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_booking_conflicts_a ON booking_conflicts(booking_a_id);
CREATE INDEX IF NOT EXISTS idx_booking_conflicts_b ON booking_conflicts(booking_b_id);
CREATE INDEX IF NOT EXISTS idx_booking_conflicts_unresolved ON booking_conflicts(organization_id, resolution) WHERE resolution = 'unresolved';

-- ============================================================================
-- STEP 3: CAPACITY SNAPSHOTS (for utilization reporting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS capacity_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    available_hours DECIMAL(6,2) DEFAULT 8.0,
    booked_hours DECIMAL(6,2) DEFAULT 0,
    utilization_percent DECIMAL(5,2) DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    has_conflict BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_capacity_snapshot UNIQUE (organization_id, user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_capacity_snapshots_user_date ON capacity_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_capacity_snapshots_org_date ON capacity_snapshots(organization_id, snapshot_date);

-- ============================================================================
-- STEP 4: ENHANCE project_resources TABLE
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_resources' AND column_name = 'booking_type'
    ) THEN
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS booking_type VARCHAR(30) DEFAULT 'confirmed'
            CHECK (booking_type IN ('confirmed', 'tentative', 'placeholder', 'soft_hold'));
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS department VARCHAR(100);
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(14,2);
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL;
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
        ALTER TABLE project_resources ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: CONFLICT DETECTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_booking_conflicts(p_booking_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_booking resource_bookings%ROWTYPE;
    v_conflict_count INTEGER := 0;
    v_other RECORD;
BEGIN
    SELECT * INTO v_booking FROM resource_bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN RETURN 0; END IF;

    -- Find overlapping bookings for the same person
    FOR v_other IN
        SELECT rb.*
        FROM resource_bookings rb
        WHERE rb.id != p_booking_id
          AND rb.organization_id = v_booking.organization_id
          AND rb.status = 'active'
          AND rb.start_date <= v_booking.end_date
          AND rb.end_date >= v_booking.start_date
          AND (
              (v_booking.user_id IS NOT NULL AND rb.user_id = v_booking.user_id)
              OR (v_booking.contact_id IS NOT NULL AND rb.contact_id = v_booking.contact_id)
          )
    LOOP
        -- Check if total allocation exceeds 100%
        IF (v_booking.allocation_percent + v_other.allocation_percent) > 100 THEN
            INSERT INTO booking_conflicts (
                organization_id, booking_a_id, booking_b_id,
                conflict_type, severity,
                overlap_start, overlap_end,
                total_allocation, resolution
            ) VALUES (
                v_booking.organization_id, p_booking_id, v_other.id,
                'over_allocation',
                CASE WHEN (v_booking.allocation_percent + v_other.allocation_percent) > 150 THEN 'critical' ELSE 'warning' END,
                GREATEST(v_booking.start_date, v_other.start_date),
                LEAST(v_booking.end_date, v_other.end_date),
                v_booking.allocation_percent + v_other.allocation_percent,
                'unresolved'
            ) ON CONFLICT DO NOTHING;
            v_conflict_count := v_conflict_count + 1;
        ELSE
            -- Still an overlap but within allocation limits
            INSERT INTO booking_conflicts (
                organization_id, booking_a_id, booking_b_id,
                conflict_type, severity,
                overlap_start, overlap_end,
                total_allocation, resolution
            ) VALUES (
                v_booking.organization_id, p_booking_id, v_other.id,
                'overlap', 'info',
                GREATEST(v_booking.start_date, v_other.start_date),
                LEAST(v_booking.end_date, v_other.end_date),
                v_booking.allocation_percent + v_other.allocation_percent,
                'unresolved'
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    RETURN v_conflict_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: AUTO-DETECT CONFLICTS ON INSERT/UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION trg_detect_booking_conflicts()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM detect_booking_conflicts(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_resource_booking_conflict_check ON resource_bookings;
CREATE TRIGGER trg_resource_booking_conflict_check
    AFTER INSERT OR UPDATE ON resource_bookings
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION trg_detect_booking_conflicts();

-- ============================================================================
-- STEP 7: CALCULATE BOOKING COST
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_booking_cost()
RETURNS TRIGGER AS $$
DECLARE
    v_days INTEGER;
BEGIN
    v_days := (NEW.end_date - NEW.start_date) + 1;

    IF NEW.daily_rate IS NOT NULL THEN
        NEW.estimated_cost := NEW.daily_rate * v_days;
    ELSIF NEW.hourly_rate IS NOT NULL AND NEW.hours_per_day IS NOT NULL THEN
        NEW.estimated_cost := NEW.hourly_rate * NEW.hours_per_day * v_days;
    END IF;

    NEW.total_hours := COALESCE(NEW.hours_per_day, 8.0) * v_days;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_booking_cost ON resource_bookings;
CREATE TRIGGER trg_calculate_booking_cost
    BEFORE INSERT OR UPDATE ON resource_bookings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_booking_cost();

-- ============================================================================
-- STEP 8: UTILIZATION SNAPSHOT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_capacity_snapshots(
    p_org_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS INTEGER AS $$
DECLARE
    v_date DATE;
    v_user RECORD;
    v_count INTEGER := 0;
    v_booked DECIMAL(6,2);
    v_booking_count INTEGER;
    v_has_conflict BOOLEAN;
BEGIN
    FOR v_date IN SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date
    LOOP
        -- Skip weekends
        IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN CONTINUE; END IF;

        FOR v_user IN
            SELECT DISTINCT om.user_id
            FROM organization_members om
            WHERE om.organization_id = p_org_id
        LOOP
            -- Calculate booked hours for this user on this date
            SELECT
                COALESCE(SUM(rb.hours_per_day * (rb.allocation_percent / 100.0)), 0),
                COUNT(*)
            INTO v_booked, v_booking_count
            FROM resource_bookings rb
            WHERE rb.organization_id = p_org_id
              AND (rb.user_id = v_user.user_id)
              AND rb.status = 'active'
              AND rb.start_date <= v_date
              AND rb.end_date >= v_date;

            -- Check for conflicts
            v_has_conflict := v_booked > 8.0;

            INSERT INTO capacity_snapshots (
                organization_id, user_id, snapshot_date,
                available_hours, booked_hours, utilization_percent,
                booking_count, has_conflict
            ) VALUES (
                p_org_id, v_user.user_id, v_date,
                8.0, v_booked,
                LEAST(ROUND((v_booked / 8.0) * 100, 2), 999.99),
                v_booking_count, v_has_conflict
            )
            ON CONFLICT (organization_id, user_id, snapshot_date)
            DO UPDATE SET
                booked_hours = EXCLUDED.booked_hours,
                utilization_percent = EXCLUDED.utilization_percent,
                booking_count = EXCLUDED.booking_count,
                has_conflict = EXCLUDED.has_conflict,
                created_at = NOW();

            v_count := v_count + 1;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: RLS POLICIES
-- ============================================================================

ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY resource_bookings_org_isolation ON resource_bookings
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY booking_conflicts_org_isolation ON booking_conflicts
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY capacity_snapshots_org_isolation ON capacity_snapshots
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
