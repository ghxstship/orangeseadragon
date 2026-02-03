-- Migration: Production Advancing Schema
-- Phase 1: Core tables for unified Advancing module
-- See: docs/PRODUCTION_ADVANCING_INTEGRATION_PLAN.md

-- ============================================================================
-- ADVANCE CATEGORIES (Lookup Table)
-- Hierarchical categorization for advance items
-- ============================================================================
CREATE TABLE IF NOT EXISTS advance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    parent_category_id UUID REFERENCES advance_categories(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

COMMENT ON TABLE advance_categories IS 'Hierarchical categories for advance items: technical, logistics, hospitality, staffing, safety, marketing';
COMMENT ON COLUMN advance_categories.organization_id IS 'NULL for system-wide default categories';
COMMENT ON COLUMN advance_categories.code IS 'Machine-readable identifier, e.g., technical.audio, logistics.transportation';

-- ============================================================================
-- PRODUCTION ADVANCES (Primary Entity)
-- Master record for event advance coordination
-- ============================================================================
CREATE TABLE IF NOT EXISTS production_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    advance_code VARCHAR(50) NOT NULL,
    advance_type VARCHAR(50) NOT NULL CHECK (advance_type IN (
        'pre_event', 'load_in', 'show_day', 'strike', 'post_event'
    )),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'pending_approval', 'approved', 'completed', 'cancelled'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
        'critical', 'high', 'medium', 'low'
    )),
    due_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_date TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, advance_code)
);

COMMENT ON TABLE production_advances IS 'Master advance records coordinating all items for an event phase';
COMMENT ON COLUMN production_advances.advance_type IS 'Phase of event: pre_event, load_in, show_day, strike, post_event';
COMMENT ON COLUMN production_advances.metadata IS 'Flexible storage for custom fields and integration data';

-- ============================================================================
-- ADVANCE ITEMS (Line Items)
-- Individual items within a production advance
-- ============================================================================
CREATE TABLE IF NOT EXISTS advance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    production_advance_id UUID NOT NULL REFERENCES production_advances(id) ON DELETE CASCADE,
    category_id UUID REFERENCES advance_categories(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}',
    
    -- Vendor (references companies via vendor view)
    vendor_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Quantities & Costs (3NF: no stored total_cost - computed at query time)
    quantity_required INTEGER DEFAULT 1,
    quantity_confirmed INTEGER DEFAULT 0,
    unit_cost DECIMAL(14,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'requested', 'confirmed', 'in_transit', 'delivered', 
        'installed', 'tested', 'struck', 'returned', 'complete', 'cancelled'
    )),
    
    -- Scheduling
    scheduled_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    load_in_time TIMESTAMPTZ,
    strike_time TIMESTAMPTZ,
    location VARCHAR(255),
    
    -- Dependencies & Critical Path
    dependencies UUID[] DEFAULT '{}',
    is_critical_path BOOLEAN DEFAULT FALSE,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    notes TEXT,
    checklist JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE advance_items IS 'Individual line items within a production advance';
COMMENT ON COLUMN advance_items.specifications IS 'Technical specifications as JSON: {power: "20A", dimensions: "10x10", weight: "500lbs"}';
COMMENT ON COLUMN advance_items.dependencies IS 'Array of advance_item IDs that must complete before this item';
COMMENT ON COLUMN advance_items.checklist IS 'JSON array of checklist items: [{task: "Confirm delivery", done: false}]';
COMMENT ON COLUMN advance_items.attachments IS 'JSON array of document references: [{document_id: uuid, type: "spec_sheet"}]';

-- ============================================================================
-- ADVANCE ITEM FULFILLMENT (Stage Tracking)
-- Tracks progression through fulfillment stages
-- ============================================================================
CREATE TABLE IF NOT EXISTS advance_item_fulfillment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    advance_item_id UUID NOT NULL REFERENCES advance_items(id) ON DELETE CASCADE,
    fulfillment_stage VARCHAR(50) NOT NULL CHECK (fulfillment_stage IN (
        'requested', 'quoted', 'ordered', 'confirmed', 'in_production', 
        'shipped', 'in_transit', 'delivered', 'inspected', 'installed', 
        'tested', 'operational', 'struck', 'returned', 'complete'
    )),
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    expected_completion TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    percentage_complete INTEGER DEFAULT 0 CHECK (percentage_complete BETWEEN 0 AND 100),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    evidence JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(advance_item_id, fulfillment_stage)
);

COMMENT ON TABLE advance_item_fulfillment IS 'Stage-by-stage tracking of advance item fulfillment';
COMMENT ON COLUMN advance_item_fulfillment.evidence IS 'Proof of completion: {photos: [], signatures: [], gps: {}}';

-- ============================================================================
-- VENDOR RATINGS (Performance Tracking)
-- Post-event vendor performance metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    advance_item_id UUID REFERENCES advance_items(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Ratings (1-5 scale)
    on_time_delivery BOOLEAN,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    
    -- Feedback
    issues_encountered TEXT,
    positive_feedback TEXT,
    improvement_suggestions TEXT,
    
    -- Metadata
    rated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE vendor_ratings IS 'Post-event vendor performance ratings and feedback';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Advance Categories
CREATE INDEX IF NOT EXISTS idx_advance_categories_org ON advance_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_advance_categories_parent ON advance_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_advance_categories_code ON advance_categories(code);

-- Production Advances
CREATE INDEX IF NOT EXISTS idx_production_advances_org ON production_advances(organization_id);
CREATE INDEX IF NOT EXISTS idx_production_advances_event ON production_advances(event_id);
CREATE INDEX IF NOT EXISTS idx_production_advances_status ON production_advances(status);
CREATE INDEX IF NOT EXISTS idx_production_advances_type ON production_advances(advance_type);
CREATE INDEX IF NOT EXISTS idx_production_advances_due ON production_advances(due_date);
CREATE INDEX IF NOT EXISTS idx_production_advances_assigned ON production_advances(assigned_to);

-- Advance Items
CREATE INDEX IF NOT EXISTS idx_advance_items_org ON advance_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_advance ON advance_items(production_advance_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_category ON advance_items(category_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_vendor ON advance_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_status ON advance_items(status);
CREATE INDEX IF NOT EXISTS idx_advance_items_critical ON advance_items(is_critical_path) WHERE is_critical_path = TRUE;
CREATE INDEX IF NOT EXISTS idx_advance_items_delivery ON advance_items(scheduled_delivery);
CREATE INDEX IF NOT EXISTS idx_advance_items_assigned ON advance_items(assigned_to);

-- Fulfillment
CREATE INDEX IF NOT EXISTS idx_fulfillment_item ON advance_item_fulfillment(advance_item_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_stage ON advance_item_fulfillment(fulfillment_stage);
CREATE INDEX IF NOT EXISTS idx_fulfillment_org ON advance_item_fulfillment(organization_id);

-- Vendor Ratings
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_event ON vendor_ratings(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_org ON vendor_ratings(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_item ON vendor_ratings(advance_item_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_advancing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_advance_categories_updated_at
    BEFORE UPDATE ON advance_categories
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

CREATE TRIGGER trg_production_advances_updated_at
    BEFORE UPDATE ON production_advances
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

CREATE TRIGGER trg_advance_items_updated_at
    BEFORE UPDATE ON advance_items
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

CREATE TRIGGER trg_advance_item_fulfillment_updated_at
    BEFORE UPDATE ON advance_item_fulfillment
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

-- ============================================================================
-- COMPUTED VIEWS
-- ============================================================================

-- View with computed total_cost (3NF compliant - no stored redundant data)
CREATE OR REPLACE VIEW advance_items_with_totals AS
SELECT 
    ai.*,
    (ai.quantity_required * ai.unit_cost) AS total_cost,
    (ai.quantity_confirmed * ai.unit_cost) AS confirmed_cost,
    ac.name AS category_name,
    ac.code AS category_code,
    ac.icon AS category_icon,
    ac.color AS category_color,
    c.name AS vendor_name,
    pa.advance_code,
    pa.advance_type,
    pa.status AS advance_status,
    e.name AS event_name,
    e.start_date AS event_start_date
FROM advance_items ai
LEFT JOIN advance_categories ac ON ac.id = ai.category_id
LEFT JOIN companies c ON c.id = ai.vendor_id
LEFT JOIN production_advances pa ON pa.id = ai.production_advance_id
LEFT JOIN events e ON e.id = pa.event_id;

-- View for advance dashboard metrics
CREATE OR REPLACE VIEW advance_dashboard_metrics AS
SELECT 
    pa.id AS advance_id,
    pa.organization_id,
    pa.event_id,
    pa.advance_code,
    pa.advance_type,
    pa.status,
    pa.due_date,
    COUNT(ai.id) AS total_items,
    COUNT(ai.id) FILTER (WHERE ai.status = 'complete') AS completed_items,
    COUNT(ai.id) FILTER (WHERE ai.is_critical_path = TRUE) AS critical_items,
    COUNT(ai.id) FILTER (WHERE ai.is_critical_path = TRUE AND ai.status != 'complete') AS critical_pending,
    SUM(ai.quantity_required * ai.unit_cost) AS total_budget,
    SUM(ai.quantity_confirmed * ai.unit_cost) AS confirmed_budget,
    MIN(ai.scheduled_delivery) AS first_delivery,
    MAX(ai.scheduled_delivery) AS last_delivery
FROM production_advances pa
LEFT JOIN advance_items ai ON ai.production_advance_id = pa.id
WHERE pa.deleted_at IS NULL
GROUP BY pa.id;

-- View for vendor performance aggregates
CREATE OR REPLACE VIEW vendor_performance_summary AS
SELECT 
    vr.vendor_id,
    vr.organization_id,
    c.name AS vendor_name,
    COUNT(vr.id) AS total_ratings,
    AVG(vr.overall_rating)::DECIMAL(3,2) AS avg_overall_rating,
    AVG(vr.quality_rating)::DECIMAL(3,2) AS avg_quality_rating,
    AVG(vr.communication_rating)::DECIMAL(3,2) AS avg_communication_rating,
    AVG(vr.professionalism_rating)::DECIMAL(3,2) AS avg_professionalism_rating,
    AVG(vr.value_rating)::DECIMAL(3,2) AS avg_value_rating,
    COUNT(vr.id) FILTER (WHERE vr.on_time_delivery = TRUE) AS on_time_count,
    COUNT(vr.id) FILTER (WHERE vr.on_time_delivery = FALSE) AS late_count,
    COUNT(vr.id) FILTER (WHERE vr.would_recommend = TRUE) AS recommend_count,
    COUNT(vr.id) FILTER (WHERE vr.would_recommend = FALSE) AS not_recommend_count
FROM vendor_ratings vr
JOIN companies c ON c.id = vr.vendor_id
GROUP BY vr.vendor_id, vr.organization_id, c.name;
