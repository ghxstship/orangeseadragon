-- ATLVS Platform Database Schema
-- Events & Live Production Tables

-- ============================================================================
-- EVENTS & PRODUCTION TABLES
-- ============================================================================

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    phase event_phase DEFAULT 'concept',
    visibility visibility_type DEFAULT 'private',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    doors_time TIME,
    start_time TIME,
    end_time TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    venue_id UUID,
    capacity INTEGER,
    expected_attendance INTEGER,
    actual_attendance INTEGER,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_events_organization ON events(organization_id);
CREATE INDEX idx_events_project ON events(project_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_phase ON events(phase);
CREATE INDEX idx_events_type ON events(event_type);

-- Event Days
CREATE TABLE event_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name VARCHAR(255),
    description TEXT,
    doors_time TIME,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, date)
);

CREATE INDEX idx_event_days_event ON event_days(event_id);
CREATE INDEX idx_event_days_date ON event_days(date);

-- Stages
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER,
    dimensions JSONB,
    technical_specs JSONB DEFAULT '{}',
    stage_plot_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_stages_organization ON stages(organization_id);
CREATE INDEX idx_stages_event ON stages(event_id);

-- Show Calls
CREATE TABLE show_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    call_time TIME NOT NULL,
    status show_call_status DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_show_calls_event ON show_calls(event_id);
CREATE INDEX idx_show_calls_day ON show_calls(event_day_id);

-- Runsheets
CREATE TABLE runsheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status runsheet_status DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_runsheets_event ON runsheets(event_id);
CREATE INDEX idx_runsheets_date ON runsheets(date);
CREATE INDEX idx_runsheets_stage ON runsheets(stage_id);

-- Runsheet Items
CREATE TABLE runsheet_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    runsheet_id UUID NOT NULL REFERENCES runsheets(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES runsheet_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    item_type runsheet_item_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_start TIME NOT NULL,
    scheduled_end TIME NOT NULL,
    actual_start TIME,
    actual_end TIME,
    duration_minutes INTEGER,
    status runsheet_item_status DEFAULT 'pending',
    talent_id UUID,
    notes TEXT,
    technical_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_runsheet_items_runsheet ON runsheet_items(runsheet_id);
CREATE INDEX idx_runsheet_items_position ON runsheet_items(runsheet_id, position);

-- Cue Sheets
CREATE TABLE cue_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    runsheet_id UUID REFERENCES runsheets(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    department cue_department NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_cue_sheets_event ON cue_sheets(event_id);
CREATE INDEX idx_cue_sheets_runsheet ON cue_sheets(runsheet_id);
CREATE INDEX idx_cue_sheets_department ON cue_sheets(department);

-- Cues
CREATE TABLE cues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cue_sheet_id UUID NOT NULL REFERENCES cue_sheets(id) ON DELETE CASCADE,
    runsheet_item_id UUID REFERENCES runsheet_items(id) ON DELETE SET NULL,
    cue_number VARCHAR(20) NOT NULL,
    position INTEGER NOT NULL,
    cue_type cue_type DEFAULT 'go',
    trigger_type trigger_type DEFAULT 'manual',
    trigger_time TIME,
    trigger_timecode VARCHAR(20),
    trigger_midi JSONB,
    trigger_osc JSONB,
    description TEXT NOT NULL,
    action TEXT,
    notes TEXT,
    duration_seconds INTEGER,
    is_executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMPTZ,
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cues_cue_sheet ON cues(cue_sheet_id);
CREATE INDEX idx_cues_runsheet_item ON cues(runsheet_item_id);
CREATE INDEX idx_cues_position ON cues(cue_sheet_id, position);

-- Production Notes
CREATE TABLE production_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE CASCADE,
    runsheet_id UUID REFERENCES runsheets(id) ON DELETE SET NULL,
    runsheet_item_id UUID REFERENCES runsheet_items(id) ON DELETE SET NULL,
    department cue_department,
    priority priority_level DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_production_notes_event ON production_notes(event_id);
CREATE INDEX idx_production_notes_runsheet ON production_notes(runsheet_id);
CREATE INDEX idx_production_notes_unresolved ON production_notes(event_id, is_resolved) WHERE is_resolved = FALSE;

-- Incident Reports
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    incident_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity priority_level NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    witnesses TEXT[],
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, incident_number)
);

CREATE INDEX idx_incident_reports_organization ON incident_reports(organization_id);
CREATE INDEX idx_incident_reports_event ON incident_reports(event_id);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity);
