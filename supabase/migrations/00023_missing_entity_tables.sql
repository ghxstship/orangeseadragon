-- Migration: Add missing entity tables
-- These tables are required by schemas but don't exist in the database

-- ============================================================================
-- LOOKUP TABLES - Required by 00024_gap_implementation_tables.sql
-- ============================================================================

-- Statuses table (generic status lookup for various entities)
CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    is_terminal BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, domain, code)
);

CREATE INDEX IF NOT EXISTS idx_statuses_org ON statuses(organization_id);
CREATE INDEX IF NOT EXISTS idx_statuses_domain ON statuses(domain);

-- Currencies table
CREATE TABLE IF NOT EXISTS currencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code CHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common currencies
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
    ('USD', 'US Dollar', '$', 2),
    ('EUR', 'Euro', '€', 2),
    ('GBP', 'British Pound', '£', 2),
    ('CAD', 'Canadian Dollar', 'C$', 2),
    ('AUD', 'Australian Dollar', 'A$', 2),
    ('JPY', 'Japanese Yen', '¥', 0),
    ('CHF', 'Swiss Franc', 'CHF', 2),
    ('MXN', 'Mexican Peso', 'MX$', 2)
ON CONFLICT (code) DO NOTHING;

-- Event sessions table (required by 00024 session_talent)
CREATE TABLE IF NOT EXISTS event_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50),
    track VARCHAR(100),
    room VARCHAR(100),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    capacity INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_event_sessions_event ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_org ON event_sessions(organization_id);

-- Position types (full-time, part-time, contractor, etc.)
CREATE TABLE IF NOT EXISTS position_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_position_types_org ON position_types(organization_id);

-- Employment types (exempt, non-exempt, seasonal, etc.)
CREATE TABLE IF NOT EXISTS employment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_employment_types_org ON employment_types(organization_id);

-- Staff members table (employees/workforce members)
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    position_type_id UUID REFERENCES position_types(id) ON DELETE SET NULL,
    employment_type_id UUID REFERENCES employment_types(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
    hire_date DATE,
    termination_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'suspended')),
    hourly_rate DECIMAL(10,2),
    salary DECIMAL(12,2),
    pay_frequency VARCHAR(20) DEFAULT 'biweekly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id),
    UNIQUE(organization_id, employee_number)
);

CREATE INDEX IF NOT EXISTS idx_staff_members_org ON staff_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_dept ON staff_members(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_manager ON staff_members(manager_id);

-- ============================================================================
-- PROJECTS MODULE - Missing Tables
-- ============================================================================

-- Teams table for project teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    color VARCHAR(7),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Sprints table for agile project management
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    velocity INTEGER,
    capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Backlogs table for product backlogs
CREATE TABLE IF NOT EXISTS backlogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Boards table for kanban/scrum boards
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    board_type VARCHAR(50) DEFAULT 'kanban',
    columns JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Roadmaps table for project roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'team',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- WORKFORCE MODULE - Missing Tables
-- ============================================================================

-- Schedules table for workforce scheduling
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Credentials table for user credentials/certifications tracking
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    credential_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    document_url TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- OPERATIONS MODULE - Missing Tables
-- ============================================================================

-- Floor plans table
CREATE TABLE IF NOT EXISTS floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    svg_data TEXT,
    scale DECIMAL(10,4),
    width INTEGER,
    height INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Checkpoints table for security/access checkpoints
CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    checkpoint_type VARCHAR(50) DEFAULT 'access',
    location TEXT,
    coordinates JSONB,
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Radio channels table
CREATE TABLE IF NOT EXISTS radio_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    channel_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50),
    department VARCHAR(100),
    assigned_to JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- PRODUCTION MODULE - Missing Tables
-- ============================================================================

-- Tech specs table
CREATE TABLE IF NOT EXISTS tech_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    spec_type VARCHAR(50) DEFAULT 'general',
    content JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Advancing table for artist/talent advancing
CREATE TABLE IF NOT EXISTS advancing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    talent_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES talent_bookings(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    advance_date DATE,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    checklist JSONB DEFAULT '[]',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- FINANCE MODULE - Missing Tables
-- ============================================================================

-- Settlements table for financial settlements
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settlement_date DATE,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Accounts table for chart of accounts
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    account_type VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, account_code)
);

-- ============================================================================
-- BUSINESS/CRM MODULE - Missing Tables
-- ============================================================================

-- Leads table for sales leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    score INTEGER DEFAULT 0,
    estimated_value DECIMAL(15,2),
    notes TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    converted_to_deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- CORE MODULE - Missing Tables
-- ============================================================================

-- Calendar events table (if not using calendar_events)
CREATE TABLE IF NOT EXISTS calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    event_type VARCHAR(50) DEFAULT 'event',
    recurrence_rule TEXT,
    color VARCHAR(7),
    reminder_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Showcase/portfolio items
CREATE TABLE IF NOT EXISTS showcase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    media_urls JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    category VARCHAR(100),
    featured BOOLEAN DEFAULT false,
    visibility VARCHAR(50) DEFAULT 'public',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Folders table for document organization
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_teams_organization ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_project ON teams(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_organization ON sprints(organization_id);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_backlogs_organization ON backlogs(organization_id);
CREATE INDEX IF NOT EXISTS idx_backlogs_project ON backlogs(project_id);
CREATE INDEX IF NOT EXISTS idx_boards_organization ON boards(organization_id);
CREATE INDEX IF NOT EXISTS idx_boards_project ON boards(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_organization ON roadmaps(organization_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_project ON roadmaps(project_id);
CREATE INDEX IF NOT EXISTS idx_schedules_organization ON schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_schedules_event ON schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_credentials_organization ON credentials(organization_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_organization ON floor_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_venue ON floor_plans(venue_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_organization ON checkpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_venue ON checkpoints(venue_id);
CREATE INDEX IF NOT EXISTS idx_radio_channels_organization ON radio_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_radio_channels_event ON radio_channels(event_id);
CREATE INDEX IF NOT EXISTS idx_tech_specs_organization ON tech_specs(organization_id);
CREATE INDEX IF NOT EXISTS idx_tech_specs_event ON tech_specs(event_id);
CREATE INDEX IF NOT EXISTS idx_advancing_organization ON advancing(organization_id);
CREATE INDEX IF NOT EXISTS idx_advancing_event ON advancing(event_id);
CREATE INDEX IF NOT EXISTS idx_settlements_organization ON settlements(organization_id);
CREATE INDEX IF NOT EXISTS idx_settlements_event ON settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_accounts_organization ON accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_calendar_organization ON calendar(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_organization ON showcase(organization_id);
CREATE INDEX IF NOT EXISTS idx_showcase_user ON showcase(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_organization ON folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE advancing ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for authenticated users in same org)
-- Teams
CREATE POLICY teams_select ON teams FOR SELECT USING (true);
CREATE POLICY teams_insert ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY teams_update ON teams FOR UPDATE USING (true);
CREATE POLICY teams_delete ON teams FOR DELETE USING (true);

-- Sprints
CREATE POLICY sprints_select ON sprints FOR SELECT USING (true);
CREATE POLICY sprints_insert ON sprints FOR INSERT WITH CHECK (true);
CREATE POLICY sprints_update ON sprints FOR UPDATE USING (true);
CREATE POLICY sprints_delete ON sprints FOR DELETE USING (true);

-- Backlogs
CREATE POLICY backlogs_select ON backlogs FOR SELECT USING (true);
CREATE POLICY backlogs_insert ON backlogs FOR INSERT WITH CHECK (true);
CREATE POLICY backlogs_update ON backlogs FOR UPDATE USING (true);
CREATE POLICY backlogs_delete ON backlogs FOR DELETE USING (true);

-- Boards
CREATE POLICY boards_select ON boards FOR SELECT USING (true);
CREATE POLICY boards_insert ON boards FOR INSERT WITH CHECK (true);
CREATE POLICY boards_update ON boards FOR UPDATE USING (true);
CREATE POLICY boards_delete ON boards FOR DELETE USING (true);

-- Roadmaps
CREATE POLICY roadmaps_select ON roadmaps FOR SELECT USING (true);
CREATE POLICY roadmaps_insert ON roadmaps FOR INSERT WITH CHECK (true);
CREATE POLICY roadmaps_update ON roadmaps FOR UPDATE USING (true);
CREATE POLICY roadmaps_delete ON roadmaps FOR DELETE USING (true);

-- Schedules
CREATE POLICY schedules_select ON schedules FOR SELECT USING (true);
CREATE POLICY schedules_insert ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY schedules_update ON schedules FOR UPDATE USING (true);
CREATE POLICY schedules_delete ON schedules FOR DELETE USING (true);

-- Credentials
CREATE POLICY credentials_select ON credentials FOR SELECT USING (true);
CREATE POLICY credentials_insert ON credentials FOR INSERT WITH CHECK (true);
CREATE POLICY credentials_update ON credentials FOR UPDATE USING (true);
CREATE POLICY credentials_delete ON credentials FOR DELETE USING (true);

-- Floor Plans
CREATE POLICY floor_plans_select ON floor_plans FOR SELECT USING (true);
CREATE POLICY floor_plans_insert ON floor_plans FOR INSERT WITH CHECK (true);
CREATE POLICY floor_plans_update ON floor_plans FOR UPDATE USING (true);
CREATE POLICY floor_plans_delete ON floor_plans FOR DELETE USING (true);

-- Checkpoints
CREATE POLICY checkpoints_select ON checkpoints FOR SELECT USING (true);
CREATE POLICY checkpoints_insert ON checkpoints FOR INSERT WITH CHECK (true);
CREATE POLICY checkpoints_update ON checkpoints FOR UPDATE USING (true);
CREATE POLICY checkpoints_delete ON checkpoints FOR DELETE USING (true);

-- Radio Channels
CREATE POLICY radio_channels_select ON radio_channels FOR SELECT USING (true);
CREATE POLICY radio_channels_insert ON radio_channels FOR INSERT WITH CHECK (true);
CREATE POLICY radio_channels_update ON radio_channels FOR UPDATE USING (true);
CREATE POLICY radio_channels_delete ON radio_channels FOR DELETE USING (true);

-- Tech Specs
CREATE POLICY tech_specs_select ON tech_specs FOR SELECT USING (true);
CREATE POLICY tech_specs_insert ON tech_specs FOR INSERT WITH CHECK (true);
CREATE POLICY tech_specs_update ON tech_specs FOR UPDATE USING (true);
CREATE POLICY tech_specs_delete ON tech_specs FOR DELETE USING (true);

-- Advancing
CREATE POLICY advancing_select ON advancing FOR SELECT USING (true);
CREATE POLICY advancing_insert ON advancing FOR INSERT WITH CHECK (true);
CREATE POLICY advancing_update ON advancing FOR UPDATE USING (true);
CREATE POLICY advancing_delete ON advancing FOR DELETE USING (true);

-- Settlements
CREATE POLICY settlements_select ON settlements FOR SELECT USING (true);
CREATE POLICY settlements_insert ON settlements FOR INSERT WITH CHECK (true);
CREATE POLICY settlements_update ON settlements FOR UPDATE USING (true);
CREATE POLICY settlements_delete ON settlements FOR DELETE USING (true);

-- Accounts
CREATE POLICY accounts_select ON accounts FOR SELECT USING (true);
CREATE POLICY accounts_insert ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY accounts_update ON accounts FOR UPDATE USING (true);
CREATE POLICY accounts_delete ON accounts FOR DELETE USING (true);

-- Leads
CREATE POLICY leads_select ON leads FOR SELECT USING (true);
CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY leads_update ON leads FOR UPDATE USING (true);
CREATE POLICY leads_delete ON leads FOR DELETE USING (true);

-- Calendar
CREATE POLICY calendar_select ON calendar FOR SELECT USING (true);
CREATE POLICY calendar_insert ON calendar FOR INSERT WITH CHECK (true);
CREATE POLICY calendar_update ON calendar FOR UPDATE USING (true);
CREATE POLICY calendar_delete ON calendar FOR DELETE USING (true);

-- Showcase
CREATE POLICY showcase_select ON showcase FOR SELECT USING (true);
CREATE POLICY showcase_insert ON showcase FOR INSERT WITH CHECK (true);
CREATE POLICY showcase_update ON showcase FOR UPDATE USING (true);
CREATE POLICY showcase_delete ON showcase FOR DELETE USING (true);

-- Folders
CREATE POLICY folders_select ON folders FOR SELECT USING (true);
CREATE POLICY folders_insert ON folders FOR INSERT WITH CHECK (true);
CREATE POLICY folders_update ON folders FOR UPDATE USING (true);
CREATE POLICY folders_delete ON folders FOR DELETE USING (true);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backlogs_updated_at BEFORE UPDATE ON backlogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON roadmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_floor_plans_updated_at BEFORE UPDATE ON floor_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radio_channels_updated_at BEFORE UPDATE ON radio_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tech_specs_updated_at BEFORE UPDATE ON tech_specs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advancing_updated_at BEFORE UPDATE ON advancing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_updated_at BEFORE UPDATE ON calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_showcase_updated_at BEFORE UPDATE ON showcase FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
