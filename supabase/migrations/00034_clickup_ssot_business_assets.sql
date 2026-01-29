-- Migration: ClickUp SSOT Entity Implementation - Part 4 (Business & Assets)
-- Created: 2026-01-29
-- Description: Service Catalog, Fleet, Tracking, Content Marketing
-- Reference: clickupmigration.md

-- ============================================================================
-- BUSINESS - SERVICE CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    base_price DECIMAL(12,2),
    price_unit VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, service_code)
);

CREATE INDEX idx_services_org ON services(organization_id);
CREATE INDEX idx_services_category ON services(category);

CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    package_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, package_code)
);

CREATE INDEX idx_service_packages_org ON service_packages(organization_id);

CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    included_price DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(package_id, service_id)
);

CREATE TABLE IF NOT EXISTS rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_cards_org ON rate_cards(organization_id);

CREATE TABLE IF NOT EXISTS rate_card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    item_code VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50),
    minimum_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_card_items_card ON rate_card_items(rate_card_id);

-- ============================================================================
-- ASSETS - FLEET & VEHICLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    vehicle_type VARCHAR(50) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(17),
    license_plate VARCHAR(20),
    max_weight_lbs DECIMAL(10,2),
    cargo_volume_cuft DECIMAL(10,2),
    home_facility VARCHAR(100),
    assigned_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    insurance_policy VARCHAR(100),
    insurance_expiration DATE,
    last_service_date DATE,
    next_service_date DATE,
    odometer INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, vehicle_number)
);

CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

CREATE TABLE IF NOT EXISTS carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    carrier_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    mc_number VARCHAR(50),
    dot_number VARCHAR(50),
    service_types JSONB DEFAULT '[]',
    service_regions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    is_preferred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, carrier_code)
);

CREATE INDEX idx_carriers_org ON carriers(organization_id);

CREATE TABLE IF NOT EXISTS freight_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) NOT NULL,
    carrier_id UUID REFERENCES carriers(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    origin VARCHAR(255),
    destination VARCHAR(255),
    weight_lbs DECIMAL(10,2),
    dimensions TEXT,
    service_type VARCHAR(50),
    quoted_price DECIMAL(10,2),
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, quote_number)
);

CREATE INDEX idx_freight_quotes_org ON freight_quotes(organization_id);

-- ============================================================================
-- ASSETS - TRACKING & CUSTODY
-- ============================================================================

CREATE TABLE IF NOT EXISTS gps_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    device_type VARCHAR(50),
    serial_number VARCHAR(100),
    assigned_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')),
    last_ping_at TIMESTAMPTZ,
    last_latitude DECIMAL(10,7),
    last_longitude DECIMAL(10,7),
    battery_level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, device_id)
);

CREATE INDEX idx_gps_devices_org ON gps_devices(organization_id);

CREATE TABLE IF NOT EXISTS location_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    gps_device_id UUID REFERENCES gps_devices(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    altitude DECIMAL(10,2),
    speed DECIMAL(8,2),
    heading INTEGER,
    accuracy DECIMAL(8,2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_location_log_org ON location_log(organization_id);
CREATE INDEX idx_location_log_device ON location_log(gps_device_id);
CREATE INDEX idx_location_log_asset ON location_log(asset_id);
CREATE INDEX idx_location_log_time ON location_log(recorded_at);

CREATE TABLE IF NOT EXISTS custody_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    condition_notes TEXT,
    signature_url TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_custody_log_org ON custody_log(organization_id);
CREATE INDEX idx_custody_log_asset ON custody_log(asset_id);
CREATE INDEX idx_custody_log_time ON custody_log(recorded_at);

CREATE TABLE IF NOT EXISTS missing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_number VARCHAR(50) NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    kit_id UUID REFERENCES asset_kits(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    last_known_location VARCHAR(255),
    last_seen_date DATE,
    last_seen_by UUID REFERENCES users(id) ON DELETE SET NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    estimated_value DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'missing' CHECK (status IN ('missing', 'searching', 'found', 'written_off')),
    found_date DATE,
    found_location VARCHAR(255),
    found_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, report_number)
);

CREATE INDEX idx_missing_items_org ON missing_items(organization_id);
CREATE INDEX idx_missing_items_status ON missing_items(status);

-- ============================================================================
-- ASSETS - MAINTENANCE ENHANCEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pm_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('days', 'weeks', 'months', 'hours', 'miles')),
    frequency_value INTEGER NOT NULL,
    checklist_items JSONB DEFAULT '[]',
    estimated_duration_hours DECIMAL(6,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pm_schedules_org ON pm_schedules(organization_id);

CREATE TABLE IF NOT EXISTS service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    vendor_id UUID, -- FK to vendors table not defined yet
    technician_name VARCHAR(255),
    description TEXT,
    work_performed TEXT,
    parts_used JSONB DEFAULT '[]',
    labor_hours DECIMAL(6,2),
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    odometer_reading INTEGER,
    next_service_date DATE,
    next_service_odometer INTEGER,
    invoice_number VARCHAR(50),
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_service_history_org ON service_history(organization_id);
CREATE INDEX idx_service_history_asset ON service_history(asset_id);
CREATE INDEX idx_service_history_vehicle ON service_history(vehicle_id);
CREATE INDEX idx_service_history_date ON service_history(service_date);

CREATE TABLE IF NOT EXISTS parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    part_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    unit_cost DECIMAL(10,2),
    quantity_on_hand INTEGER DEFAULT 0,
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    location VARCHAR(100),
    bin_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, part_number)
);

CREATE INDEX idx_parts_inventory_org ON parts_inventory(organization_id);

-- ============================================================================
-- ASSETS - SITE ADVANCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    advance_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    advance_date DATE,
    advance_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, advance_number)
);

CREATE INDEX idx_site_advances_org ON site_advances(organization_id);
CREATE INDEX idx_site_advances_production ON site_advances(production_id);

CREATE TABLE IF NOT EXISTS advance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_advance_id UUID NOT NULL REFERENCES site_advances(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    power_info TEXT,
    rigging_info TEXT,
    loading_dock_info TEXT,
    parking_info TEXT,
    dressing_room_info TEXT,
    catering_info TEXT,
    wifi_info TEXT,
    security_info TEXT,
    site_photos JSONB DEFAULT '[]',
    issues_found TEXT,
    recommendations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advance_reports_advance ON advance_reports(site_advance_id);

CREATE TABLE IF NOT EXISTS venue_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    spec_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    stage_dimensions TEXT,
    rigging_capacity TEXT,
    power_specs TEXT,
    loading_info TEXT,
    house_equipment JSONB DEFAULT '[]',
    restrictions TEXT,
    floor_plan_url TEXT,
    tech_pack_url TEXT,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_venue_specs_org ON venue_specs(organization_id);
CREATE INDEX idx_venue_specs_venue ON venue_specs(venue_id);

-- ============================================================================
-- BUSINESS - CONTENT MARKETING
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    description TEXT,
    body TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    featured_image_url TEXT,
    tags JSONB DEFAULT '[]',
    seo_title VARCHAR(255),
    seo_description TEXT,
    slug VARCHAR(255),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_content_items_org ON content_items(organization_id);
CREATE INDEX idx_content_items_type ON content_items(content_type);
CREATE INDEX idx_content_items_status ON content_items(status);

CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    testimonial TEXT,
    testimonial_author VARCHAR(255),
    testimonial_title VARCHAR(255),
    featured_image_url TEXT,
    gallery_urls JSONB DEFAULT '[]',
    video_url TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_case_studies_org ON case_studies(organization_id);
CREATE INDEX idx_case_studies_status ON case_studies(status);

CREATE TABLE IF NOT EXISTS press_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    body TEXT NOT NULL,
    release_date DATE,
    embargo_until TIMESTAMPTZ,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    boilerplate TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'distributed', 'archived')),
    distribution_list JSONB DEFAULT '[]',
    distributed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_press_releases_org ON press_releases(organization_id);
CREATE INDEX idx_press_releases_date ON press_releases(release_date);

-- ============================================================================
-- BUSINESS - BRAND KIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    primary_colors JSONB DEFAULT '[]',
    secondary_colors JSONB DEFAULT '[]',
    typography JSONB DEFAULT '{}',
    logo_usage TEXT,
    voice_tone TEXT,
    dos_donts TEXT,
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_brand_guidelines_org ON brand_guidelines(organization_id);

CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_guideline_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_format VARCHAR(20),
    dimensions VARCHAR(50),
    file_size_bytes INTEGER,
    usage_rights TEXT,
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_brand_assets_org ON brand_assets(organization_id);
CREATE INDEX idx_brand_assets_type ON brand_assets(asset_type);

CREATE TABLE IF NOT EXISTS brand_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    brand_guideline_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    description TEXT,
    file_url TEXT,
    preview_url TEXT,
    editable_fields JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_brand_templates_org ON brand_templates(organization_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_org_access" ON services FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "service_packages_org_access" ON service_packages FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "rate_cards_org_access" ON rate_cards FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "vehicles_org_access" ON vehicles FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "carriers_org_access" ON carriers FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "freight_quotes_org_access" ON freight_quotes FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "gps_devices_org_access" ON gps_devices FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "location_log_org_access" ON location_log FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "custody_log_org_access" ON custody_log FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "missing_items_org_access" ON missing_items FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "pm_schedules_org_access" ON pm_schedules FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "service_history_org_access" ON service_history FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "parts_inventory_org_access" ON parts_inventory FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "site_advances_org_access" ON site_advances FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "advance_reports_org_access" ON advance_reports FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "venue_specs_org_access" ON venue_specs FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "content_items_org_access" ON content_items FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "case_studies_org_access" ON case_studies FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "press_releases_org_access" ON press_releases FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "brand_guidelines_org_access" ON brand_guidelines FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "brand_assets_org_access" ON brand_assets FOR ALL USING (is_organization_member(organization_id));
CREATE POLICY "brand_templates_org_access" ON brand_templates FOR ALL USING (is_organization_member(organization_id));
