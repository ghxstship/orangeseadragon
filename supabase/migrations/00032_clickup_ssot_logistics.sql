-- Migration: ClickUp SSOT Entity Implementation - Part 2 (Logistics & Operations)
-- Created: 2026-01-29
-- Description: Shipments, Pull Lists, Load Plans, Work Orders, Site Operations
-- Reference: clickupmigration.md

-- ============================================================================
-- LOGISTICS - SHIPMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    shipment_number VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    direction shipment_direction NOT NULL DEFAULT 'outbound',
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    carrier_id UUID, -- FK to vendors table not defined yet
    origin_facility VARCHAR(100),
    origin_address TEXT,
    origin_contact_name VARCHAR(255),
    origin_contact_phone VARCHAR(50),
    destination_facility VARCHAR(100),
    destination_address TEXT,
    destination_contact_name VARCHAR(255),
    destination_contact_phone VARCHAR(50),
    scheduled_pickup_date DATE,
    actual_pickup_date DATE,
    scheduled_delivery_date DATE,
    actual_delivery_date DATE,
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    total_weight_lbs DECIMAL(10,2),
    total_pieces INTEGER,
    pallet_count INTEGER,
    freight_cost DECIMAL(10,2),
    status shipment_status NOT NULL DEFAULT 'draft',
    special_instructions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, shipment_number)
);

CREATE INDEX IF NOT EXISTS idx_shipments_org ON shipments(organization_id);
CREATE INDEX IF NOT EXISTS idx_shipments_production ON shipments(production_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- Shipment Items
CREATE TABLE IF NOT EXISTS shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    kit_id UUID REFERENCES asset_kits(id) ON DELETE SET NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    weight_lbs DECIMAL(10,2),
    condition_out VARCHAR(20),
    condition_in VARCHAR(20),
    is_received BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMPTZ,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id);

-- ============================================================================
-- LOGISTICS - PULL LISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pull_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pull_list_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    warehouse_location VARCHAR(100),
    pull_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, pull_list_number)
);

CREATE INDEX IF NOT EXISTS idx_pull_lists_org ON pull_lists(organization_id);
CREATE INDEX IF NOT EXISTS idx_pull_lists_production ON pull_lists(production_id);

-- Pull List Items
CREATE TABLE IF NOT EXISTS pull_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pull_list_id UUID NOT NULL REFERENCES pull_lists(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    kit_id UUID REFERENCES asset_kits(id) ON DELETE SET NULL,
    catalog_item_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    description TEXT,
    quantity_requested INTEGER NOT NULL DEFAULT 1,
    quantity_pulled INTEGER DEFAULT 0,
    is_pulled BOOLEAN DEFAULT FALSE,
    pulled_at TIMESTAMPTZ,
    pulled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    bin_location VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pull_list_items_list ON pull_list_items(pull_list_id);

-- ============================================================================
-- LOGISTICS - LOAD PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS load_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    load_plan_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    vehicle_type VARCHAR(50),
    vehicle_id UUID,
    trailer_number VARCHAR(50),
    max_weight_lbs DECIMAL(10,2),
    max_volume_cuft DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'loading', 'loaded', 'verified')),
    diagram_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, load_plan_number)
);

CREATE INDEX IF NOT EXISTS idx_load_plans_org ON load_plans(organization_id);

-- ============================================================================
-- WORK ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    work_order_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    work_order_type work_order_type NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    crew_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    crew_size INTEGER,
    status work_order_status NOT NULL DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'medium',
    completion_percentage INTEGER DEFAULT 0,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    scope_of_work TEXT,
    special_requirements TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, work_order_number)
);

CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_production ON work_orders(production_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);

-- ============================================================================
-- SITE OPERATIONS - DAILY REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_site_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_number VARCHAR(50) NOT NULL,
    report_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    report_date DATE NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    weather_conditions VARCHAR(100),
    temperature_high INTEGER,
    temperature_low INTEGER,
    crew_count INTEGER,
    crew_hours DECIMAL(8,2),
    work_completed TEXT,
    work_planned_tomorrow TEXT,
    delays TEXT,
    safety_incidents TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, report_number)
);

CREATE INDEX IF NOT EXISTS idx_daily_site_reports_org ON daily_site_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_site_reports_date ON daily_site_reports(report_date);

-- ============================================================================
-- SITE OPERATIONS - ISSUES & PUNCH ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    issue_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    daily_report_id UUID REFERENCES daily_site_reports(id) ON DELETE SET NULL,
    category VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated', 'closed')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_site_issues_org ON site_issues(organization_id);
CREATE INDEX IF NOT EXISTS idx_site_issues_status ON site_issues(status);

CREATE TABLE IF NOT EXISTS punch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    punch_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    inspection_id UUID,
    location VARCHAR(255),
    area VARCHAR(100),
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    responsible_party VARCHAR(100),
    status punch_item_status NOT NULL DEFAULT 'open',
    due_date DATE,
    resolution TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    photo_urls JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, punch_number)
);

CREATE INDEX IF NOT EXISTS idx_punch_items_org ON punch_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_punch_items_status ON punch_items(status);

-- ============================================================================
-- INSPECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inspection_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    inspection_type inspection_type NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    actual_date DATE,
    inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
    inspector_name VARCHAR(255),
    inspector_company VARCHAR(255),
    status inspection_status NOT NULL DEFAULT 'scheduled',
    result VARCHAR(20),
    findings TEXT,
    recommendations TEXT,
    checklist_items JSONB DEFAULT '[]',
    report_url TEXT,
    signed_off_by UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_off_at TIMESTAMPTZ,
    client_signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, inspection_number)
);

CREATE INDEX IF NOT EXISTS idx_inspections_org ON inspections(organization_id);
CREATE INDEX IF NOT EXISTS idx_inspections_type ON inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);

-- ============================================================================
-- SHOW OPERATIONS - RUN OF SHOW
-- ============================================================================

CREATE TABLE IF NOT EXISTS run_of_show (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'locked', 'archived')),
    version INTEGER DEFAULT 1,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_run_of_show_org ON run_of_show(organization_id);
CREATE INDEX IF NOT EXISTS idx_run_of_show_date ON run_of_show(show_date);

CREATE TABLE IF NOT EXISTS run_of_show_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_of_show_id UUID NOT NULL REFERENCES run_of_show(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER,
    actual_time TIME,
    element_type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_party VARCHAR(255),
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'standby', 'active', 'completed', 'skipped')),
    cue_notes TEXT,
    technical_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ros_elements_ros ON run_of_show_elements(run_of_show_id);

-- Communications Plans
CREATE TABLE IF NOT EXISTS comms_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    radio_channels JSONB DEFAULT '[]',
    phone_tree JSONB DEFAULT '[]',
    emergency_contacts JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'archived')),
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comms_plans_org ON comms_plans(organization_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_site_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_of_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_of_show_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE comms_plans ENABLE ROW LEVEL SECURITY;

-- Create org-based RLS policies for all tables
DROP POLICY IF EXISTS "shipments_org_access" ON shipments;
CREATE POLICY "shipments_org_access" ON shipments FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "pull_lists_org_access" ON pull_lists;
CREATE POLICY "pull_lists_org_access" ON pull_lists FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "load_plans_org_access" ON load_plans;
CREATE POLICY "load_plans_org_access" ON load_plans FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "work_orders_org_access" ON work_orders;
CREATE POLICY "work_orders_org_access" ON work_orders FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "daily_site_reports_org_access" ON daily_site_reports;
CREATE POLICY "daily_site_reports_org_access" ON daily_site_reports FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "site_issues_org_access" ON site_issues;
CREATE POLICY "site_issues_org_access" ON site_issues FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "punch_items_org_access" ON punch_items;
CREATE POLICY "punch_items_org_access" ON punch_items FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "inspections_org_access" ON inspections;
CREATE POLICY "inspections_org_access" ON inspections FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "run_of_show_org_access" ON run_of_show;
CREATE POLICY "run_of_show_org_access" ON run_of_show FOR ALL USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "comms_plans_org_access" ON comms_plans;
CREATE POLICY "comms_plans_org_access" ON comms_plans FOR ALL USING (is_organization_member(organization_id));
