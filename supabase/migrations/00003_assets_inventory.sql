-- ATLVS Platform Database Schema
-- Asset Management & Inventory Tables

-- ============================================================================
-- ASSET MANAGEMENT TABLES
-- ============================================================================

-- Asset Categories
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    depreciation_method depreciation_method DEFAULT 'straight_line',
    useful_life_months INTEGER,
    maintenance_interval_days INTEGER,
    custom_fields JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_asset_categories_organization ON asset_categories(organization_id);
CREATE INDEX idx_asset_categories_parent ON asset_categories(parent_id);

-- Locations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    location_type location_type NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_locations_organization ON locations(organization_id);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_parent ON locations(parent_id);

-- Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    asset_tag VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    status asset_status DEFAULT 'available',
    condition asset_condition DEFAULT 'good',
    purchase_date DATE,
    purchase_price DECIMAL(12, 2),
    purchase_currency VARCHAR(3) DEFAULT 'USD',
    vendor_id UUID,
    warranty_expires DATE,
    depreciation_method depreciation_method DEFAULT 'straight_line',
    useful_life_months INTEGER,
    salvage_value DECIMAL(12, 2),
    current_value DECIMAL(12, 2),
    last_depreciation_date DATE,
    qr_code TEXT,
    barcode TEXT,
    rfid_tag TEXT,
    image_url TEXT,
    specifications JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, asset_tag)
);

CREATE INDEX idx_assets_organization ON assets(organization_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_serial ON assets(serial_number);

-- Asset Kits
CREATE TABLE asset_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    kit_number VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    status asset_status DEFAULT 'available',
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug),
    UNIQUE(organization_id, kit_number)
);

CREATE INDEX idx_asset_kits_organization ON asset_kits(organization_id);
CREATE INDEX idx_asset_kits_status ON asset_kits(status);

-- Asset Kit Items
CREATE TABLE asset_kit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id UUID NOT NULL REFERENCES asset_kits(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kit_id, asset_id)
);

CREATE INDEX idx_asset_kit_items_kit ON asset_kit_items(kit_id);
CREATE INDEX idx_asset_kit_items_asset ON asset_kit_items(asset_id);

-- Asset Check Actions (check-in/check-out)
CREATE TABLE asset_check_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES asset_kits(id) ON DELETE CASCADE,
    action_type check_action_type NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    checked_out_to UUID REFERENCES users(id) ON DELETE SET NULL,
    checked_out_by UUID REFERENCES users(id) ON DELETE SET NULL,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    condition_out asset_condition,
    condition_in asset_condition,
    scan_method scan_method,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (asset_id IS NOT NULL OR kit_id IS NOT NULL)
);

CREATE INDEX idx_asset_check_actions_organization ON asset_check_actions(organization_id);
CREATE INDEX idx_asset_check_actions_asset ON asset_check_actions(asset_id);
CREATE INDEX idx_asset_check_actions_kit ON asset_check_actions(kit_id);
CREATE INDEX idx_asset_check_actions_project ON asset_check_actions(project_id);
CREATE INDEX idx_asset_check_actions_event ON asset_check_actions(event_id);
CREATE INDEX idx_asset_check_actions_user ON asset_check_actions(checked_out_to);

-- Asset Reservations
CREATE TABLE asset_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES asset_kits(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    reserved_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_out', 'returned', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (asset_id IS NOT NULL OR kit_id IS NOT NULL)
);

CREATE INDEX idx_asset_reservations_organization ON asset_reservations(organization_id);
CREATE INDEX idx_asset_reservations_asset ON asset_reservations(asset_id);
CREATE INDEX idx_asset_reservations_kit ON asset_reservations(kit_id);
CREATE INDEX idx_asset_reservations_dates ON asset_reservations(start_date, end_date);
CREATE INDEX idx_asset_reservations_status ON asset_reservations(status);

-- Asset Maintenance
CREATE TABLE asset_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type maintenance_type NOT NULL,
    status maintenance_status DEFAULT 'scheduled',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    vendor_id UUID,
    cost DECIMAL(12, 2),
    cost_currency VARCHAR(3) DEFAULT 'USD',
    parts_used JSONB DEFAULT '[]',
    notes TEXT,
    next_maintenance_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_asset_maintenance_organization ON asset_maintenance(organization_id);
CREATE INDEX idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX idx_asset_maintenance_status ON asset_maintenance(status);
CREATE INDEX idx_asset_maintenance_scheduled ON asset_maintenance(scheduled_date);

-- Inventory Items (consumables)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    quantity_on_hand DECIMAL(12, 4) DEFAULT 0,
    quantity_reserved DECIMAL(12, 4) DEFAULT 0,
    quantity_available DECIMAL(12, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    reorder_point DECIMAL(12, 4),
    reorder_quantity DECIMAL(12, 4),
    unit_cost DECIMAL(12, 4),
    cost_currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    barcode TEXT,
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, sku)
);

CREATE INDEX idx_inventory_items_organization ON inventory_items(organization_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_low_stock ON inventory_items(organization_id) 
    WHERE quantity_on_hand <= reorder_point;

-- Inventory Transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type inventory_transaction_type NOT NULL,
    quantity DECIMAL(12, 4) NOT NULL,
    unit_cost DECIMAL(12, 4),
    total_cost DECIMAL(12, 4),
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_inventory_transactions_organization ON inventory_transactions(organization_id);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_created ON inventory_transactions(created_at);
