-- Migration: Phase 3 — People Management Extras & Security Enhancements
-- Created: 2026-02-07
-- Description: Crew care fields, rate cards, emergency contacts, NDA/tax doc tracking,
--              freelancer availability, time-bound access, role hierarchy, NDA-gated docs

-- ============================================================================
-- STEP 1: EMPLOYEE PROFILE EXTENSIONS (Crew Care & Compliance)
-- ============================================================================

DO $$
BEGIN
    -- Emergency contact fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'emergency_contact_name'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN emergency_contact_name VARCHAR(255);
        ALTER TABLE employee_profiles ADD COLUMN emergency_contact_phone VARCHAR(50);
        ALTER TABLE employee_profiles ADD COLUMN emergency_contact_relationship VARCHAR(100);
        ALTER TABLE employee_profiles ADD COLUMN emergency_contact_email VARCHAR(255);
    END IF;

    -- Medical / crew care fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN dietary_restrictions TEXT[];
        ALTER TABLE employee_profiles ADD COLUMN allergies TEXT[];
        ALTER TABLE employee_profiles ADD COLUMN tshirt_size VARCHAR(10)
            CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'));
        ALTER TABLE employee_profiles ADD COLUMN medical_notes TEXT;
        ALTER TABLE employee_profiles ADD COLUMN blood_type VARCHAR(5);
    END IF;

    -- Compliance document tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'w9_status'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN w9_status VARCHAR(20) DEFAULT 'not_submitted'
            CHECK (w9_status IN ('not_submitted', 'submitted', 'verified', 'expired'));
        ALTER TABLE employee_profiles ADD COLUMN w9_submitted_at TIMESTAMPTZ;
        ALTER TABLE employee_profiles ADD COLUMN w9_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
        ALTER TABLE employee_profiles ADD COLUMN w8ben_status VARCHAR(20) DEFAULT 'not_applicable'
            CHECK (w8ben_status IN ('not_applicable', 'not_submitted', 'submitted', 'verified', 'expired'));
        ALTER TABLE employee_profiles ADD COLUMN w8ben_submitted_at TIMESTAMPTZ;
    END IF;

    -- NDA tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'nda_status'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN nda_status VARCHAR(20) DEFAULT 'none'
            CHECK (nda_status IN ('none', 'pending', 'signed', 'expired'));
        ALTER TABLE employee_profiles ADD COLUMN nda_signed_at TIMESTAMPTZ;
        ALTER TABLE employee_profiles ADD COLUMN nda_expires_at TIMESTAMPTZ;
        ALTER TABLE employee_profiles ADD COLUMN nda_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
        ALTER TABLE employee_profiles ADD COLUMN non_compete_status VARCHAR(20) DEFAULT 'none'
            CHECK (non_compete_status IN ('none', 'active', 'expired', 'waived'));
        ALTER TABLE employee_profiles ADD COLUMN non_compete_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREW RATE CARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_rate_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),

    -- Rate structure
    day_rate NUMERIC(12,2),
    half_day_rate NUMERIC(12,2),
    hourly_rate NUMERIC(12,2),
    overtime_rate_multiplier NUMERIC(4,2) DEFAULT 1.5,
    double_time_multiplier NUMERIC(4,2) DEFAULT 2.0,
    weekend_rate_multiplier NUMERIC(4,2) DEFAULT 1.5,
    holiday_rate_multiplier NUMERIC(4,2) DEFAULT 2.0,

    -- Per diem
    per_diem_amount NUMERIC(10,2),
    hotel_allowance NUMERIC(10,2),
    mileage_rate NUMERIC(6,4),
    travel_day_rate NUMERIC(12,2),

    -- Kit / equipment
    kit_rental_rate NUMERIC(10,2),
    vehicle_allowance NUMERIC(10,2),

    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',

    -- Validity
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_cards_org ON crew_rate_cards(organization_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_employee ON crew_rate_cards(employee_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_role ON crew_rate_cards(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective ON crew_rate_cards(effective_from, effective_until);

-- ============================================================================
-- STEP 3: FREELANCER AVAILABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS freelancer_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,

    -- Availability window
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    availability_type VARCHAR(20) NOT NULL
        CHECK (availability_type IN ('available', 'unavailable', 'tentative', 'preferred')),

    -- Recurrence for seasonal patterns
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(20)
        CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
    recurrence_end_date DATE,

    -- Details
    notes TEXT,
    day_of_week INTEGER[], -- 0=Sun, 1=Mon, ..., 6=Sat (for recurring weekly)

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_availability_dates CHECK (date_end >= date_start)
);

CREATE INDEX IF NOT EXISTS idx_freelancer_avail_org ON freelancer_availability(organization_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_avail_employee ON freelancer_availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_avail_dates ON freelancer_availability(date_start, date_end);

-- ============================================================================
-- STEP 4: TIME-BOUND ACCESS CONTROLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- What they can access
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,

    -- Access window
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    -- Scope
    permission_level VARCHAR(20) DEFAULT 'read'
        CHECK (permission_level IN ('read', 'write', 'admin', 'full')),

    -- NDA prerequisite
    requires_nda BOOLEAN DEFAULT FALSE,
    nda_verified BOOLEAN DEFAULT FALSE,

    -- Geofence
    geofence_enabled BOOLEAN DEFAULT FALSE,
    geofence_latitude NUMERIC(10,7),
    geofence_longitude NUMERIC(10,7),
    geofence_radius_meters INTEGER,

    -- Audit
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    revoke_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_grants_org ON access_grants(organization_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_user ON access_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_resource ON access_grants(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_active ON access_grants(organization_id, is_active, expires_at)
    WHERE is_active = TRUE;

-- Function to auto-expire access grants
CREATE OR REPLACE FUNCTION expire_access_grants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE access_grants
    SET is_active = FALSE,
        revoke_reason = 'auto-expired',
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE is_active = TRUE
      AND expires_at IS NOT NULL
      AND expires_at < NOW();
END;
$$;

-- ============================================================================
-- STEP 5: ROLE HIERARCHY (7-tier)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_role_tier') THEN
        CREATE TYPE org_role_tier AS ENUM (
            'super_admin',    -- Platform-level
            'org_owner',      -- Organization owner
            'org_admin',      -- Full org admin
            'manager',        -- Department/project manager
            'member',         -- Standard member
            'contractor',     -- External contractor
            'guest'           -- Read-only guest
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'organization_members' AND column_name = 'role_tier'
    ) THEN
        ALTER TABLE organization_members ADD COLUMN role_tier org_role_tier DEFAULT 'member';
        ALTER TABLE organization_members ADD COLUMN department_scope TEXT[];
        ALTER TABLE organization_members ADD COLUMN project_scope UUID[];
        ALTER TABLE organization_members ADD COLUMN venue_scope UUID[];
    END IF;
END $$;

-- ============================================================================
-- STEP 6: PER DIEM CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_per_diem(
    p_employee_id UUID,
    p_organization_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_include_travel_days BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    total_days INTEGER,
    travel_days INTEGER,
    work_days INTEGER,
    per_diem_total NUMERIC,
    hotel_total NUMERIC,
    travel_day_total NUMERIC,
    grand_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rate RECORD;
    v_total_days INTEGER;
    v_travel_days INTEGER := 0;
BEGIN
    -- Get the active rate card
    SELECT * INTO v_rate
    FROM crew_rate_cards
    WHERE employee_id = p_employee_id
      AND organization_id = p_organization_id
      AND effective_from <= p_start_date
      AND (effective_until IS NULL OR effective_until >= p_end_date)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF v_rate IS NULL THEN
        RETURN QUERY SELECT 0, 0, 0, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;

    v_total_days := p_end_date - p_start_date + 1;

    IF p_include_travel_days AND v_total_days > 1 THEN
        v_travel_days := 2; -- First and last day
    END IF;

    RETURN QUERY SELECT
        v_total_days,
        v_travel_days,
        v_total_days - v_travel_days,
        COALESCE(v_rate.per_diem_amount, 0) * v_total_days,
        COALESCE(v_rate.hotel_allowance, 0) * (v_total_days - 1), -- No hotel last night
        COALESCE(v_rate.travel_day_rate, 0) * v_travel_days,
        (COALESCE(v_rate.per_diem_amount, 0) * v_total_days) +
        (COALESCE(v_rate.hotel_allowance, 0) * (v_total_days - 1)) +
        (COALESCE(v_rate.travel_day_rate, 0) * v_travel_days);
END;
$$;

-- ============================================================================
-- STEP 7: RLS POLICIES
-- ============================================================================

ALTER TABLE crew_rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY rate_cards_org_isolation ON crew_rate_cards
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY freelancer_avail_org_isolation ON freelancer_availability
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY access_grants_org_isolation ON access_grants
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
