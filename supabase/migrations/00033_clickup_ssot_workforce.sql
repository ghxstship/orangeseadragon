-- Migration: ClickUp SSOT Entity Implementation - Part 3 (Workforce)
-- Created: 2026-01-29
-- Description: Availability, Travel, Recruitment, Performance, Safety
-- Reference: clickupmigration.md

-- ============================================================================
-- WORKFORCE - AVAILABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS availability_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status availability_status NOT NULL DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_org ON availability_submissions(organization_id);
CREATE INDEX idx_availability_user ON availability_submissions(user_id);
CREATE INDEX idx_availability_dates ON availability_submissions(start_date, end_date);

CREATE TABLE IF NOT EXISTS blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blackout_date DATE NOT NULL,
    reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, blackout_date)
);

CREATE INDEX idx_blackout_org ON blackout_dates(organization_id);
CREATE INDEX idx_blackout_user ON blackout_dates(user_id);

-- ============================================================================
-- WORKFORCE - TRAVEL MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS travel_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    request_number VARCHAR(50) NOT NULL,
    traveler_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    purpose TEXT,
    destination VARCHAR(255),
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status travel_status NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, request_number)
);

CREATE INDEX idx_travel_requests_org ON travel_requests(organization_id);
CREATE INDEX idx_travel_requests_traveler ON travel_requests(traveler_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(status);

CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,
    traveler_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    airline VARCHAR(100),
    flight_number VARCHAR(20),
    confirmation_number VARCHAR(50),
    departure_airport VARCHAR(10),
    departure_city VARCHAR(100),
    departure_datetime TIMESTAMPTZ,
    arrival_airport VARCHAR(10),
    arrival_city VARCHAR(100),
    arrival_datetime TIMESTAMPTZ,
    booking_class VARCHAR(20),
    seat_number VARCHAR(10),
    cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'checked_in', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flights_org ON flights(organization_id);
CREATE INDEX idx_flights_traveler ON flights(traveler_id);

CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_name VARCHAR(255) NOT NULL,
    hotel_address TEXT,
    hotel_phone VARCHAR(50),
    confirmation_number VARCHAR(50),
    room_type VARCHAR(50),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nightly_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hotels_org ON hotels(organization_id);
CREATE INDEX idx_hotels_guest ON hotels(guest_id);

CREATE TABLE IF NOT EXISTS ground_transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transport_type VARCHAR(50) NOT NULL,
    provider VARCHAR(255),
    confirmation_number VARCHAR(50),
    pickup_location TEXT,
    pickup_datetime TIMESTAMPTZ,
    dropoff_location TEXT,
    dropoff_datetime TIMESTAMPTZ,
    cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'booked',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ground_transport_org ON ground_transport(organization_id);

CREATE TABLE IF NOT EXISTS per_diems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_days INTEGER,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_per_diems_org ON per_diems(organization_id);

-- ============================================================================
-- WORKFORCE - RECRUITMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requisition_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    reports_to UUID REFERENCES users(id) ON DELETE SET NULL,
    employment_type VARCHAR(50),
    location VARCHAR(255),
    remote_eligible BOOLEAN DEFAULT FALSE,
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    openings INTEGER DEFAULT 1,
    filled INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'open', 'on_hold', 'filled', 'cancelled')),
    target_start_date DATE,
    posted_date DATE,
    closed_date DATE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, requisition_number)
);

CREATE INDEX idx_job_requisitions_org ON job_requisitions(organization_id);
CREATE INDEX idx_job_requisitions_status ON job_requisitions(status);

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    requisition_id UUID REFERENCES job_requisitions(id) ON DELETE SET NULL,
    source VARCHAR(100),
    status candidate_status NOT NULL DEFAULT 'new',
    resume_url TEXT,
    cover_letter_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_candidates_org ON candidates(organization_id);
CREATE INDEX idx_candidates_requisition ON candidates(requisition_id);
CREATE INDEX idx_candidates_status ON candidates(status);

CREATE TABLE IF NOT EXISTS candidate_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    requisition_id UUID REFERENCES job_requisitions(id) ON DELETE SET NULL,
    interview_type VARCHAR(50),
    round INTEGER DEFAULT 1,
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    meeting_url TEXT,
    interviewer_ids UUID[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    recommendation VARCHAR(20) CHECK (recommendation IN ('strong_yes', 'yes', 'neutral', 'no', 'strong_no')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_candidate_interviews_org ON candidate_interviews(organization_id);
CREATE INDEX idx_candidate_interviews_candidate ON candidate_interviews(candidate_id);

CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    requisition_id UUID REFERENCES job_requisitions(id) ON DELETE SET NULL,
    position_title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    salary DECIMAL(12,2),
    bonus DECIMAL(12,2),
    equity VARCHAR(100),
    start_date DATE,
    offer_date DATE,
    expiration_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'expired', 'withdrawn')),
    responded_at TIMESTAMPTZ,
    decline_reason TEXT,
    offer_letter_url TEXT,
    signed_offer_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_job_offers_org ON job_offers(organization_id);
CREATE INDEX idx_job_offers_candidate ON job_offers(candidate_id);

-- ============================================================================
-- WORKFORCE - PERFORMANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    target_value DECIMAL(12,2),
    current_value DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(50),
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    review_id UUID REFERENCES performance_reviews(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_goals_org ON goals(organization_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

CREATE TABLE IF NOT EXISTS peer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'manager', 'public')),
    review_id UUID REFERENCES performance_reviews(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_peer_feedback_org ON peer_feedback(organization_id);
CREATE INDEX idx_peer_feedback_to ON peer_feedback(to_user_id);

CREATE TABLE IF NOT EXISTS pips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    improvement_goals JSONB DEFAULT '[]',
    success_criteria TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'extended', 'completed_success', 'completed_failure', 'cancelled')),
    outcome TEXT,
    completed_at TIMESTAMPTZ,
    hr_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    hr_approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_pips_org ON pips(organization_id);
CREATE INDEX idx_pips_employee ON pips(employee_id);

-- ============================================================================
-- WORKFORCE - SAFETY
-- ============================================================================

CREATE TABLE IF NOT EXISTS near_misses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_number VARCHAR(50) NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    incident_date DATE NOT NULL,
    incident_time TIME,
    location VARCHAR(255),
    description TEXT NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    category VARCHAR(50),
    potential_severity VARCHAR(20),
    root_cause TEXT,
    corrective_actions TEXT,
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, report_number)
);

CREATE INDEX idx_near_misses_org ON near_misses(organization_id);
CREATE INDEX idx_near_misses_date ON near_misses(incident_date);

CREATE TABLE IF NOT EXISTS safety_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    observer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    observation_date DATE NOT NULL,
    location VARCHAR(255),
    observation_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    is_positive BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    action_required BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_safety_observations_org ON safety_observations(organization_id);

CREATE TABLE IF NOT EXISTS workers_comp_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    claim_number VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_report_id UUID REFERENCES incident_reports(id) ON DELETE SET NULL,
    injury_date DATE NOT NULL,
    injury_description TEXT NOT NULL,
    body_part VARCHAR(100),
    treating_physician VARCHAR(255),
    medical_facility VARCHAR(255),
    claim_filed_date DATE,
    insurance_carrier VARCHAR(255),
    insurance_claim_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'filed' CHECK (status IN ('filed', 'under_review', 'approved', 'denied', 'settled', 'closed')),
    medical_costs DECIMAL(12,2) DEFAULT 0,
    lost_wages DECIMAL(12,2) DEFAULT 0,
    settlement_amount DECIMAL(12,2),
    return_to_work_date DATE,
    work_restrictions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, claim_number)
);

CREATE INDEX idx_workers_comp_org ON workers_comp_claims(organization_id);
CREATE INDEX idx_workers_comp_employee ON workers_comp_claims(employee_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE availability_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE per_diems ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pips ENABLE ROW LEVEL SECURITY;
ALTER TABLE near_misses ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers_comp_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_org_access" ON availability_submissions FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "blackout_org_access" ON blackout_dates FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "travel_requests_org_access" ON travel_requests FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "flights_org_access" ON flights FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "hotels_org_access" ON hotels FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "ground_transport_org_access" ON ground_transport FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "per_diems_org_access" ON per_diems FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "job_requisitions_org_access" ON job_requisitions FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "candidates_org_access" ON candidates FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "candidate_interviews_org_access" ON candidate_interviews FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "job_offers_org_access" ON job_offers FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "goals_org_access" ON goals FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "peer_feedback_org_access" ON peer_feedback FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "pips_org_access" ON pips FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "near_misses_org_access" ON near_misses FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "safety_observations_org_access" ON safety_observations FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "workers_comp_org_access" ON workers_comp_claims FOR ALL USING (is_organization_member(organization_id));
