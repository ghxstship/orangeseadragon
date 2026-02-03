-- Migration: OPERATIONS Module Data Gaps
-- Created: 2026-02-02
-- Description: Create missing tables for OPERATIONS module features
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- VENUE ZONES
-- Navigation: /operations/venues/zones
-- ============================================================================

CREATE TABLE IF NOT EXISTS venue_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    floor_plan_id UUID REFERENCES floor_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    zone_type VARCHAR(50) CHECK (zone_type IN (
        'backstage', 'foh', 'boh', 'vip', 'production', 'public', 
        'restricted', 'loading', 'parking', 'catering', 'medical', 'security'
    )),
    capacity INTEGER,
    access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN (
        'all_access', 'crew', 'vip', 'artist', 'media', 'public', 'restricted'
    )),
    coordinates JSONB, -- polygon coordinates for floor plan overlay
    color VARCHAR(7),
    icon VARCHAR(50),
    amenities TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(venue_id, code)
);

CREATE INDEX IF NOT EXISTS idx_venue_zones_org ON venue_zones(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_zones_venue ON venue_zones(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_zones_floor_plan ON venue_zones(floor_plan_id);
CREATE INDEX IF NOT EXISTS idx_venue_zones_type ON venue_zones(zone_type);
CREATE INDEX IF NOT EXISTS idx_venue_zones_access ON venue_zones(access_level);

-- ============================================================================
-- PUNCH LISTS
-- Navigation: /operations/incidents/punch-lists
-- ============================================================================

CREATE TABLE IF NOT EXISTS punch_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    punch_list_number VARCHAR(50) NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN (
        'pre_event', 'during_event', 'post_event', 'maintenance', 'safety', 'general'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'completed', 'cancelled')),
    due_date DATE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, punch_list_number)
);

CREATE INDEX IF NOT EXISTS idx_punch_lists_org ON punch_lists(organization_id);
CREATE INDEX IF NOT EXISTS idx_punch_lists_event ON punch_lists(event_id);
CREATE INDEX IF NOT EXISTS idx_punch_lists_venue ON punch_lists(venue_id);
CREATE INDEX IF NOT EXISTS idx_punch_lists_status ON punch_lists(status);
CREATE INDEX IF NOT EXISTS idx_punch_lists_assigned ON punch_lists(assigned_to);
CREATE INDEX IF NOT EXISTS idx_punch_lists_due ON punch_lists(due_date) WHERE status NOT IN ('completed', 'cancelled');

CREATE TABLE IF NOT EXISTS punch_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    punch_list_id UUID NOT NULL REFERENCES punch_lists(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    zone_id UUID REFERENCES venue_zones(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'deferred', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    photos JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(punch_list_id, item_number)
);

CREATE INDEX IF NOT EXISTS idx_punch_list_items_list ON punch_list_items(punch_list_id);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_status ON punch_list_items(status);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_assigned ON punch_list_items(assigned_to);

-- ============================================================================
-- WORK ORDERS
-- Navigation: /operations/work-orders
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_type') THEN
        CREATE TYPE work_order_type AS ENUM (
            'repair', 'maintenance', 'installation', 'inspection', 
            'modification', 'emergency', 'preventive', 'other'
        );
    END IF;
END $$;

-- work_orders table already exists from 00032_clickup_ssot_logistics.sql
-- Add missing columns to existing table
ALTER TABLE work_orders 
    ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES venue_zones(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS punch_list_item_id UUID REFERENCES punch_list_items(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(6,2),
    ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(6,2),
    ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS completion_notes TEXT,
    ADD COLUMN IF NOT EXISTS photos_before JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS photos_after JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS signature_url TEXT,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Update title from name if title is null
UPDATE work_orders SET title = name WHERE title IS NULL AND name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_event ON work_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_venue ON work_orders(venue_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled ON work_orders(scheduled_start);

-- ============================================================================
-- WEATHER REPORTS
-- Navigation: /operations/comms/weather
-- ============================================================================

CREATE TABLE IF NOT EXISTS weather_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    report_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    report_type VARCHAR(20) DEFAULT 'current' CHECK (report_type IN ('current', 'forecast', 'alert', 'historical')),
    
    -- Current conditions
    temperature_f DECIMAL(5,2),
    feels_like_f DECIMAL(5,2),
    humidity_percent INTEGER CHECK (humidity_percent BETWEEN 0 AND 100),
    wind_speed_mph DECIMAL(5,2),
    wind_gust_mph DECIMAL(5,2),
    wind_direction VARCHAR(10),
    pressure_mb DECIMAL(7,2),
    visibility_miles DECIMAL(5,2),
    uv_index INTEGER,
    cloud_cover_percent INTEGER CHECK (cloud_cover_percent BETWEEN 0 AND 100),
    
    -- Precipitation
    precipitation_chance INTEGER CHECK (precipitation_chance BETWEEN 0 AND 100),
    precipitation_type VARCHAR(20), -- rain, snow, sleet, hail
    precipitation_amount DECIMAL(5,2),
    
    -- Conditions
    conditions VARCHAR(100),
    conditions_code VARCHAR(20),
    icon_code VARCHAR(20),
    
    -- Alerts
    alerts JSONB DEFAULT '[]', -- [{type, severity, headline, description, expires}]
    
    -- Metadata
    source VARCHAR(50), -- 'openweathermap', 'weatherapi', 'manual'
    source_location VARCHAR(255),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    forecast_for TIMESTAMPTZ, -- for forecast reports
    
    notes TEXT,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_reports_org ON weather_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_weather_reports_event ON weather_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_weather_reports_venue ON weather_reports(venue_id);
CREATE INDEX IF NOT EXISTS idx_weather_reports_datetime ON weather_reports(report_datetime);
CREATE INDEX IF NOT EXISTS idx_weather_reports_type ON weather_reports(report_type);

-- ============================================================================
-- DAILY REPORTS
-- Navigation: /operations/comms/daily-reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_number VARCHAR(50) NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    report_date DATE NOT NULL,
    report_type VARCHAR(50) DEFAULT 'operations' CHECK (report_type IN (
        'operations', 'production', 'safety', 'security', 'executive', 'wrap'
    )),
    
    -- Summary
    title VARCHAR(255),
    executive_summary TEXT,
    
    -- Metrics
    attendance INTEGER,
    ticket_sales INTEGER,
    revenue DECIMAL(14,2),
    expenses DECIMAL(14,2),
    
    -- Operations
    highlights TEXT,
    challenges TEXT,
    issues TEXT,
    resolutions TEXT,
    
    -- Safety
    safety_incidents INTEGER DEFAULT 0,
    medical_incidents INTEGER DEFAULT 0,
    security_incidents INTEGER DEFAULT 0,
    
    -- Weather
    weather_conditions TEXT,
    weather_impact TEXT,
    
    -- Staffing
    staff_count INTEGER,
    contractor_count INTEGER,
    volunteer_count INTEGER,
    
    -- Next steps
    action_items JSONB DEFAULT '[]', -- [{description, assigned_to, due_date}]
    tomorrow_focus TEXT,
    
    -- Attachments
    photos JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'published')),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, report_number)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_org ON daily_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_event ON daily_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_type ON daily_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);

-- Daily report sections for detailed breakdowns
CREATE TABLE IF NOT EXISTS daily_report_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN (
        'operations', 'production', 'safety', 'security', 'catering', 
        'transportation', 'talent', 'vendor', 'custom'
    )),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    metrics JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'success')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_report_sections_report ON daily_report_sections(daily_report_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE venue_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_sections ENABLE ROW LEVEL SECURITY;

-- Venue Zones
CREATE POLICY "venue_zones_org_access" ON venue_zones 
    FOR ALL USING (is_organization_member(organization_id));

-- Punch Lists
CREATE POLICY "punch_lists_org_access" ON punch_lists 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "punch_list_items_org_access" ON punch_list_items 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM punch_lists pl 
            WHERE pl.id = punch_list_items.punch_list_id 
            AND is_organization_member(pl.organization_id)
        )
    );

-- Work Orders
DROP POLICY IF EXISTS "work_orders_org_access" ON work_orders;
CREATE POLICY "work_orders_org_access" ON work_orders 
    FOR ALL USING (is_organization_member(organization_id));

-- Weather Reports
CREATE POLICY "weather_reports_org_access" ON weather_reports 
    FOR ALL USING (is_organization_member(organization_id));

-- Daily Reports
CREATE POLICY "daily_reports_org_access" ON daily_reports 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "daily_report_sections_org_access" ON daily_report_sections 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM daily_reports dr 
            WHERE dr.id = daily_report_sections.daily_report_id 
            AND is_organization_member(dr.organization_id)
        )
    );

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_venue_zones_updated_at
    BEFORE UPDATE ON venue_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_punch_lists_updated_at
    BEFORE UPDATE ON punch_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_punch_list_items_updated_at
    BEFORE UPDATE ON punch_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_daily_reports_updated_at
    BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_daily_report_sections_updated_at
    BEFORE UPDATE ON daily_report_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR DASHBOARDS
-- ============================================================================

-- Active work orders summary
CREATE OR REPLACE VIEW work_orders_active_summary AS
SELECT 
    wo.organization_id,
    wo.event_id,
    wo.venue_id,
    COUNT(*) AS total_active,
    COUNT(*) FILTER (WHERE wo.priority = 'critical') AS critical_count,
    COUNT(*) FILTER (WHERE wo.priority = 'high') AS high_count,
    COUNT(*) FILTER (WHERE wo.status = 'draft') AS draft_count,
    COUNT(*) FILTER (WHERE wo.status = 'scheduled') AS scheduled_count,
    COUNT(*) FILTER (WHERE wo.status = 'in_progress') AS in_progress_count,
    COUNT(*) FILTER (WHERE wo.status = 'on_hold') AS on_hold_count,
    AVG(wo.estimated_hours) AS avg_estimated_hours,
    SUM(wo.estimated_cost) AS total_estimated_cost
FROM work_orders wo
WHERE wo.status NOT IN ('completed', 'cancelled')
GROUP BY wo.organization_id, wo.event_id, wo.venue_id;

-- Punch list completion summary
CREATE OR REPLACE VIEW punch_lists_completion_summary AS
SELECT 
    pl.id AS punch_list_id,
    pl.organization_id,
    pl.name,
    pl.status,
    COUNT(pli.id) AS total_items,
    COUNT(pli.id) FILTER (WHERE pli.status = 'completed') AS completed_items,
    COUNT(pli.id) FILTER (WHERE pli.status = 'open') AS open_items,
    COUNT(pli.id) FILTER (WHERE pli.priority = 'critical') AS critical_items,
    ROUND(
        (COUNT(pli.id) FILTER (WHERE pli.status = 'completed')::DECIMAL / 
        NULLIF(COUNT(pli.id), 0) * 100), 2
    ) AS completion_percentage
FROM punch_lists pl
LEFT JOIN punch_list_items pli ON pli.punch_list_id = pl.id
GROUP BY pl.id;

COMMENT ON TABLE venue_zones IS 'Physical zones within venues for access control and floor plan mapping';
COMMENT ON TABLE punch_lists IS 'Punch lists for tracking completion items during events';
COMMENT ON TABLE work_orders IS 'Work orders for on-site repairs and maintenance requests';
COMMENT ON TABLE weather_reports IS 'Weather conditions and forecasts for outdoor events';
COMMENT ON TABLE daily_reports IS 'Daily operational reports for events and productions';
