-- Migration: Phase 5 — Operational Depth & Remaining Backend Gaps
-- Created: 2026-02-07
-- Description: Venue crew requirements, crew gig ratings, post-mortem/AAR,
--              vendor payment scheduling, multi-year deals, RFP tracking,
--              phase-specific task template auto-gen, venue availability,
--              emergency alert broadcast

-- ============================================================================
-- STEP 1: VENUE CREW REQUIREMENT TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS venue_crew_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,

    -- Role requirement
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,

    -- Qualifications
    required_certifications TEXT[],
    required_skills TEXT[],
    min_experience_years INTEGER,
    union_required BOOLEAN DEFAULT FALSE,
    union_type VARCHAR(50),

    -- Scheduling
    default_call_time TIME,
    typical_hours NUMERIC(4,1),
    notes TEXT,

    -- Rate override for this venue
    venue_day_rate_override NUMERIC(12,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_venue_crew_req_org ON venue_crew_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_crew_req_venue ON venue_crew_requirements(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_crew_req_role ON venue_crew_requirements(venue_id, role);

-- Auto-populate crew from venue requirements
CREATE OR REPLACE FUNCTION auto_populate_crew_from_venue(
    p_project_id UUID,
    p_venue_id UUID,
    p_organization_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_req RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_req IN
        SELECT * FROM venue_crew_requirements
        WHERE venue_id = p_venue_id
          AND organization_id = p_organization_id
    LOOP
        -- Create resource booking placeholders for each requirement
        FOR i IN 1..v_req.quantity LOOP
            INSERT INTO resource_bookings (
                id, organization_id, project_id, role,
                status, booking_type, notes
            ) VALUES (
                uuid_generate_v4(), p_organization_id, p_project_id, v_req.role,
                'placeholder', 'placeholder',
                'Auto-populated from venue requirement: ' || v_req.role
            ) ON CONFLICT DO NOTHING;
            v_count := v_count + 1;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$;

-- ============================================================================
-- STEP 2: CREW GIG RATINGS (per-project, per-crew-member)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_gig_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Rating
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    skill_rating INTEGER CHECK (skill_rating BETWEEN 1 AND 5),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 5),

    -- Context
    role_during_project VARCHAR(100),
    would_rehire BOOLEAN,
    comments TEXT,
    is_private BOOLEAN DEFAULT TRUE,

    -- Audit
    rated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_crew_gig_rating UNIQUE (employee_id, project_id, rated_by)
);

CREATE INDEX IF NOT EXISTS idx_crew_gig_ratings_org ON crew_gig_ratings(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_gig_ratings_employee ON crew_gig_ratings(employee_id);
CREATE INDEX IF NOT EXISTS idx_crew_gig_ratings_project ON crew_gig_ratings(project_id);

-- Aggregate rating view
CREATE OR REPLACE VIEW crew_rating_summary AS
SELECT
    cgr.organization_id,
    cgr.employee_id,
    ep.first_name || ' ' || ep.last_name AS crew_name,
    COUNT(*) AS total_ratings,
    ROUND(AVG(cgr.overall_rating), 2) AS avg_overall,
    ROUND(AVG(cgr.professionalism_rating), 2) AS avg_professionalism,
    ROUND(AVG(cgr.skill_rating), 2) AS avg_skill,
    ROUND(AVG(cgr.reliability_rating), 2) AS avg_reliability,
    ROUND(AVG(cgr.communication_rating), 2) AS avg_communication,
    ROUND(AVG(cgr.teamwork_rating), 2) AS avg_teamwork,
    COUNT(CASE WHEN cgr.would_rehire = TRUE THEN 1 END) AS rehire_count,
    ROUND(COUNT(CASE WHEN cgr.would_rehire = TRUE THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) AS rehire_pct
FROM crew_gig_ratings cgr
JOIN employee_profiles ep ON ep.id = cgr.employee_id
GROUP BY cgr.organization_id, cgr.employee_id, ep.first_name, ep.last_name;

-- ============================================================================
-- STEP 3: POST-MORTEM / AFTER ACTION REVIEW (AAR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_post_mortems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- AAR structure
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'in_review', 'finalized', 'archived')),
    meeting_date DATE,
    facilitator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    attendees UUID[],

    -- Content sections
    summary TEXT,
    what_went_well TEXT,
    what_went_wrong TEXT,
    what_to_improve TEXT,
    action_items JSONB DEFAULT '[]',

    -- Metrics snapshot
    budget_variance_pct NUMERIC(6,2),
    schedule_variance_days INTEGER,
    client_satisfaction_score INTEGER CHECK (client_satisfaction_score BETWEEN 1 AND 10),
    team_satisfaction_score INTEGER CHECK (team_satisfaction_score BETWEEN 1 AND 10),
    safety_incidents INTEGER DEFAULT 0,

    -- Tags for searchability
    tags TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_post_mortems_org ON project_post_mortems(organization_id);
CREATE INDEX IF NOT EXISTS idx_post_mortems_project ON project_post_mortems(project_id);
CREATE INDEX IF NOT EXISTS idx_post_mortems_tags ON project_post_mortems USING GIN (tags);

-- Lessons learned (reusable across projects)
CREATE TABLE IF NOT EXISTS lessons_learned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    post_mortem_id UUID REFERENCES project_post_mortems(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Lesson content
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN (
            'planning', 'execution', 'communication', 'budget',
            'scheduling', 'vendor', 'client', 'safety', 'technical',
            'logistics', 'staffing', 'other'
        )),
    description TEXT NOT NULL,
    recommendation TEXT,
    severity VARCHAR(20) DEFAULT 'medium'
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Applicability
    applies_to_production_types TEXT[],
    applies_to_venue_types TEXT[],
    tags TEXT[],

    -- Tracking
    times_referenced INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_learned_org ON lessons_learned(organization_id);
CREATE INDEX IF NOT EXISTS idx_lessons_learned_category ON lessons_learned(category);
CREATE INDEX IF NOT EXISTS idx_lessons_learned_tags ON lessons_learned USING GIN (tags);

-- ============================================================================
-- STEP 4: VENDOR PAYMENT SCHEDULING
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Payment details
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    scheduled_date DATE NOT NULL,
    payment_method VARCHAR(30)
        CHECK (payment_method IN ('bank_transfer', 'check', 'credit_card', 'wire', 'ach', 'other')),

    -- Status
    status VARCHAR(20) DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'pending_approval', 'approved', 'processing', 'paid', 'cancelled', 'failed')),

    -- Approval gate
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,

    -- Execution
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(255),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_pay_sched_org ON vendor_payment_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pay_sched_vendor ON vendor_payment_schedules(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pay_sched_date ON vendor_payment_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vendor_pay_sched_status ON vendor_payment_schedules(status);

-- ============================================================================
-- STEP 5: MULTI-YEAR DEAL SUPPORT
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deals' AND column_name = 'is_multi_year'
    ) THEN
        ALTER TABLE deals ADD COLUMN is_multi_year BOOLEAN DEFAULT FALSE;
        ALTER TABLE deals ADD COLUMN contract_start_date DATE;
        ALTER TABLE deals ADD COLUMN contract_end_date DATE;
        ALTER TABLE deals ADD COLUMN renewal_type VARCHAR(20)
            CHECK (renewal_type IN ('auto_renew', 'manual_renew', 'one_time', 'evergreen'));
        ALTER TABLE deals ADD COLUMN renewal_date DATE;
        ALTER TABLE deals ADD COLUMN annual_value NUMERIC(14,2);
        ALTER TABLE deals ADD COLUMN total_contract_value NUMERIC(14,2);
        ALTER TABLE deals ADD COLUMN pitch_deck_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: RFP TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS rfp_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    client_id UUID,

    -- RFP details
    rfp_number VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    received_date DATE,
    due_date DATE NOT NULL,
    submission_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'received'
        CHECK (status IN ('received', 'reviewing', 'drafting', 'internal_review', 'submitted', 'shortlisted', 'won', 'lost', 'withdrawn', 'no_bid')),

    -- Response
    response_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    proposed_amount NUMERIC(14,2),
    proposed_timeline TEXT,
    key_differentiators TEXT,
    team_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contributors UUID[],

    -- Outcome
    outcome_notes TEXT,
    feedback_received TEXT,
    competitor_info JSONB DEFAULT '{}',

    -- Metadata
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rfp_responses_org ON rfp_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_deal ON rfp_responses(deal_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_status ON rfp_responses(status);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_due ON rfp_responses(due_date);

-- ============================================================================
-- STEP 7: PHASE-SPECIFIC TASK TEMPLATE AUTO-GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_generate_phase_tasks(
    p_project_id UUID,
    p_phase VARCHAR,
    p_organization_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_template RECORD;
    v_task_template RECORD;
    v_count INTEGER := 0;
    v_project RECORD;
BEGIN
    -- Get the project to determine production type
    SELECT * INTO v_project
    FROM projects
    WHERE id = p_project_id AND organization_id = p_organization_id;

    IF v_project IS NULL THEN
        RAISE EXCEPTION 'Project not found';
    END IF;

    -- Find matching project template by production type
    SELECT * INTO v_template
    FROM project_templates
    WHERE organization_id = p_organization_id
      AND (production_type = v_project.production_type OR production_type IS NULL)
      AND is_active = TRUE
    ORDER BY
        CASE WHEN production_type = v_project.production_type THEN 0 ELSE 1 END,
        created_at DESC
    LIMIT 1;

    IF v_template IS NULL THEN
        RETURN 0;
    END IF;

    -- Create tasks from template task items that match the phase
    FOR v_task_template IN
        SELECT * FROM task_templates
        WHERE project_template_id = v_template.id
          AND (phase = p_phase OR phase IS NULL)
        ORDER BY sort_order
    LOOP
        INSERT INTO tasks (
            id, organization_id, project_id, title, description,
            status, priority, phase, estimated_hours,
            created_by
        ) VALUES (
            uuid_generate_v4(), p_organization_id, p_project_id,
            v_task_template.title, v_task_template.description,
            'todo', COALESCE(v_task_template.priority, 'medium'), p_phase,
            v_task_template.estimated_hours,
            v_project.created_by
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- ============================================================================
-- STEP 8: VENUE AVAILABILITY CROSS-REFERENCE
-- ============================================================================

CREATE OR REPLACE FUNCTION check_venue_availability(
    p_venue_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_organization_id UUID
)
RETURNS TABLE (
    is_available BOOLEAN,
    conflicting_events BIGINT,
    conflicts JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(e.id) = 0 AS is_available,
        COUNT(e.id) AS conflicting_events,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'event_id', e.id,
                    'event_name', e.name,
                    'start_date', e.start_date,
                    'end_date', e.end_date,
                    'status', e.status
                )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::JSONB
        ) AS conflicts
    FROM events e
    WHERE e.venue_id = p_venue_id
      AND e.organization_id = p_organization_id
      AND e.status NOT IN ('cancelled', 'archived')
      AND e.start_date <= p_end_date
      AND e.end_date >= p_start_date;
END;
$$;

-- ============================================================================
-- STEP 9: EMERGENCY ALERT BROADCAST
-- ============================================================================

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,

    -- Alert details
    alert_type VARCHAR(30) NOT NULL
        CHECK (alert_type IN (
            'emergency', 'evacuation', 'weather', 'security',
            'medical', 'fire', 'general', 'all_clear'
        )),
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('info', 'warning', 'critical', 'life_safety')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Targeting
    target_scope VARCHAR(20) DEFAULT 'all'
        CHECK (target_scope IN ('all', 'project', 'venue', 'department', 'role')),
    target_departments TEXT[],
    target_roles TEXT[],

    -- Delivery
    delivery_channels TEXT[] DEFAULT ARRAY['push', 'sms'],
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'sending', 'sent', 'acknowledged', 'resolved')),
    sent_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Acknowledgment tracking
    total_recipients INTEGER DEFAULT 0,
    acknowledged_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_alert_acknowledgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    location_latitude NUMERIC(10,7),
    location_longitude NUMERIC(10,7),
    response_note TEXT,

    CONSTRAINT uq_alert_ack UNIQUE (alert_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_org ON emergency_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_project ON emergency_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_venue ON emergency_alerts(venue_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alert_acks ON emergency_alert_acknowledgments(alert_id);

-- ============================================================================
-- STEP 10: CLIENT EVENT HISTORY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW client_event_history AS
SELECT
    c.id AS client_id,
    c.name AS client_name,
    c.organization_id,
    e.id AS event_id,
    e.name AS event_name,
    e.start_date,
    e.end_date,
    e.status AS event_status,
    p.id AS project_id,
    p.name AS project_name,
    p.status AS project_status,
    b.total_budget,
    b.total_spent,
    inv.total_invoiced,
    inv.total_paid
FROM companies c
JOIN projects p ON p.client_id = c.id
LEFT JOIN events e ON e.project_id = p.id
LEFT JOIN budgets b ON b.project_id = p.id
LEFT JOIN LATERAL (
    SELECT
        SUM(i.total_amount) AS total_invoiced,
        SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) AS total_paid
    FROM invoices i
    WHERE i.project_id = p.id AND i.direction = 'outgoing'
) inv ON TRUE
ORDER BY c.name, e.start_date DESC NULLS LAST;

-- ============================================================================
-- STEP 11: RLS POLICIES
-- ============================================================================

ALTER TABLE venue_crew_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_gig_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_post_mortems ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alert_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY venue_crew_req_org_isolation ON venue_crew_requirements
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY crew_gig_ratings_org_isolation ON crew_gig_ratings
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY post_mortems_org_isolation ON project_post_mortems
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY lessons_learned_org_isolation ON lessons_learned
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY vendor_pay_sched_org_isolation ON vendor_payment_schedules
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY rfp_responses_org_isolation ON rfp_responses
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY emergency_alerts_org_isolation ON emergency_alerts
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY emergency_alert_acks_isolation ON emergency_alert_acknowledgments
    USING (alert_id IN (
        SELECT id FROM emergency_alerts WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));
