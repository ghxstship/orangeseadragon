-- ATLVS Platform Database Schema
-- Workforce Management Tables

-- ============================================================================
-- WORKFORCE MANAGEMENT TABLES
-- ============================================================================

-- Certifications (types)
CREATE TABLE certification_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    issuing_authority VARCHAR(255),
    validity_months INTEGER,
    is_required BOOLEAN DEFAULT FALSE,
    departments UUID[],
    positions UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_certification_types_organization ON certification_types(organization_id);

-- User Certifications
CREATE TABLE user_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_type_id UUID NOT NULL REFERENCES certification_types(id) ON DELETE CASCADE,
    certification_number VARCHAR(100),
    issued_date DATE NOT NULL,
    expiry_date DATE,
    status certification_status DEFAULT 'active',
    issuing_authority VARCHAR(255),
    document_url TEXT,
    notes TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_certifications_organization ON user_certifications(organization_id);
CREATE INDEX idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_type ON user_certifications(certification_type_id);
CREATE INDEX idx_user_certifications_expiry ON user_certifications(expiry_date);
CREATE INDEX idx_user_certifications_expiring ON user_certifications(organization_id, expiry_date) 
    WHERE status = 'active' AND expiry_date IS NOT NULL;

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_skills_organization ON skills(organization_id);
CREATE INDEX idx_skills_category ON skills(category);

-- User Skills
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    years_experience DECIMAL(4, 1),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);

-- Rate Cards
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_cards_organization ON rate_cards(organization_id);
CREATE INDEX idx_rate_cards_effective ON rate_cards(effective_date, end_date);

-- Rate Card Items
CREATE TABLE rate_card_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    rate_type rate_type NOT NULL,
    regular_rate DECIMAL(10, 2) NOT NULL,
    overtime_rate DECIMAL(10, 2),
    double_time_rate DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_card_items_rate_card ON rate_card_items(rate_card_id);
CREATE INDEX idx_rate_card_items_position ON rate_card_items(position_id);

-- User Availability
CREATE TABLE user_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    availability_type availability_type NOT NULL,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date, start_time)
);

CREATE INDEX idx_user_availability_organization ON user_availability(organization_id);
CREATE INDEX idx_user_availability_user ON user_availability(user_id);
CREATE INDEX idx_user_availability_date ON user_availability(date);
CREATE INDEX idx_user_availability_lookup ON user_availability(user_id, date, availability_type);

-- Crew Calls
CREATE TABLE crew_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    call_time TIME NOT NULL,
    end_time TIME,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    location_notes TEXT,
    status crew_call_status DEFAULT 'draft',
    total_positions INTEGER DEFAULT 0,
    filled_positions INTEGER DEFAULT 0,
    notes TEXT,
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_crew_calls_organization ON crew_calls(organization_id);
CREATE INDEX idx_crew_calls_project ON crew_calls(project_id);
CREATE INDEX idx_crew_calls_event ON crew_calls(event_id);
CREATE INDEX idx_crew_calls_date ON crew_calls(date);
CREATE INDEX idx_crew_calls_status ON crew_calls(status);

-- Crew Call Positions
CREATE TABLE crew_call_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_call_id UUID NOT NULL REFERENCES crew_calls(id) ON DELETE CASCADE,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity_needed INTEGER DEFAULT 1,
    quantity_filled INTEGER DEFAULT 0,
    rate_type rate_type DEFAULT 'hourly',
    rate_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    call_time TIME,
    end_time TIME,
    required_certifications UUID[],
    required_skills UUID[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crew_call_positions_crew_call ON crew_call_positions(crew_call_id);
CREATE INDEX idx_crew_call_positions_position ON crew_call_positions(position_id);

-- Crew Assignments
CREATE TABLE crew_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_call_id UUID NOT NULL REFERENCES crew_calls(id) ON DELETE CASCADE,
    crew_call_position_id UUID NOT NULL REFERENCES crew_call_positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status assignment_status DEFAULT 'invited',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    rate_type rate_type,
    rate_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(crew_call_position_id, user_id)
);

CREATE INDEX idx_crew_assignments_organization ON crew_assignments(organization_id);
CREATE INDEX idx_crew_assignments_crew_call ON crew_assignments(crew_call_id);
CREATE INDEX idx_crew_assignments_user ON crew_assignments(user_id);
CREATE INDEX idx_crew_assignments_status ON crew_assignments(status);

-- Shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_assignment_id UUID REFERENCES crew_assignments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    scheduled_start TIME NOT NULL,
    scheduled_end TIME NOT NULL,
    actual_start TIME,
    actual_end TIME,
    break_minutes INTEGER DEFAULT 0,
    status shift_status DEFAULT 'scheduled',
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shifts_organization ON shifts(organization_id);
CREATE INDEX idx_shifts_user ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_project ON shifts(project_id);
CREATE INDEX idx_shifts_event ON shifts(event_id);

-- Timesheets
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status timesheet_status DEFAULT 'draft',
    total_regular_hours DECIMAL(10, 2) DEFAULT 0,
    total_overtime_hours DECIMAL(10, 2) DEFAULT 0,
    total_double_time_hours DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timesheets_organization ON timesheets(organization_id);
CREATE INDEX idx_timesheets_user ON timesheets(user_id);
CREATE INDEX idx_timesheets_period ON timesheets(period_start, period_end);
CREATE INDEX idx_timesheets_status ON timesheets(status);

-- Timesheet Entries
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    regular_hours DECIMAL(10, 2) DEFAULT 0,
    overtime_hours DECIMAL(10, 2) DEFAULT 0,
    double_time_hours DECIMAL(10, 2) DEFAULT 0,
    rate_type rate_type,
    rate_amount DECIMAL(10, 2),
    total_amount DECIMAL(12, 2),
    description TEXT,
    is_billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timesheet_entries_timesheet ON timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(date);
CREATE INDEX idx_timesheet_entries_project ON timesheet_entries(project_id);
CREATE INDEX idx_timesheet_entries_event ON timesheet_entries(event_id);

-- Contractors
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30,
    default_rate_type rate_type,
    default_rate_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contractors_organization ON contractors(organization_id);
CREATE INDEX idx_contractors_user ON contractors(user_id);
CREATE INDEX idx_contractors_email ON contractors(email);
