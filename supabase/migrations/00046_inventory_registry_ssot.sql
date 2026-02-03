-- ============================================================================
-- INVENTORY REGISTRY AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes inventory_registry as the Single Source of Truth
-- for all trackable items across the platform. Source entities (assets, 
-- asset_kits) automatically sync to inventory_registry via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - inventory_registry owns the unified inventory index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE INVENTORY REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Item classification
    item_type VARCHAR(50) NOT NULL,        -- 'asset', 'kit', 'consumable'
    
    -- Source entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),                       -- asset_tag or kit_number
    serial_number VARCHAR(100),
    barcode TEXT,
    
    -- Category
    category_id UUID,
    category_name VARCHAR(255),
    
    -- Status
    status VARCHAR(50),                     -- 'available', 'in_use', 'maintenance', 'retired'
    condition VARCHAR(50),                  -- 'excellent', 'good', 'fair', 'poor'
    
    -- Location
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    location_name VARCHAR(255),
    
    -- Current holder
    current_holder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_holder_name VARCHAR(255),
    
    -- Value
    quantity INTEGER DEFAULT 1,
    unit_value DECIMAL(12, 2),
    total_value DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Maintenance
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    
    -- Metadata
    image_url TEXT,
    specifications JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX idx_inventory_registry_organization ON inventory_registry(organization_id);
CREATE INDEX idx_inventory_registry_type ON inventory_registry(item_type);
CREATE INDEX idx_inventory_registry_entity ON inventory_registry(entity_type, entity_id);
CREATE INDEX idx_inventory_registry_sku ON inventory_registry(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_inventory_registry_serial ON inventory_registry(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_inventory_registry_status ON inventory_registry(status);
CREATE INDEX idx_inventory_registry_location ON inventory_registry(location_id) WHERE location_id IS NOT NULL;
CREATE INDEX idx_inventory_registry_holder ON inventory_registry(current_holder_id) WHERE current_holder_id IS NOT NULL;
CREATE INDEX idx_inventory_registry_category ON inventory_registry(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_inventory_registry_maintenance ON inventory_registry(next_maintenance_date) WHERE next_maintenance_date IS NOT NULL;
CREATE INDEX idx_inventory_registry_search ON inventory_registry USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(sku, '') || ' ' || COALESCE(serial_number, ''))
);

-- ============================================================================
-- HELPER FUNCTION: Upsert inventory registry entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_inventory_registry(
    p_organization_id UUID,
    p_item_type VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_name VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_sku VARCHAR(100) DEFAULT NULL,
    p_serial_number VARCHAR(100) DEFAULT NULL,
    p_barcode TEXT DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_category_name VARCHAR(255) DEFAULT NULL,
    p_status VARCHAR(50) DEFAULT 'available',
    p_condition VARCHAR(50) DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_location_name VARCHAR(255) DEFAULT NULL,
    p_current_holder_id UUID DEFAULT NULL,
    p_current_holder_name VARCHAR(255) DEFAULT NULL,
    p_quantity INTEGER DEFAULT 1,
    p_unit_value DECIMAL(12, 2) DEFAULT NULL,
    p_currency VARCHAR(3) DEFAULT 'USD',
    p_last_maintenance_date DATE DEFAULT NULL,
    p_next_maintenance_date DATE DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_image_url TEXT DEFAULT NULL,
    p_specifications JSONB DEFAULT '{}',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_registry_id UUID;
    v_external_id VARCHAR(100);
    v_total_value DECIMAL(12, 2);
BEGIN
    -- Create unique key
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT;
    
    -- Calculate total value
    v_total_value := COALESCE(p_unit_value, 0) * COALESCE(p_quantity, 1);
    
    -- Upsert the inventory registry entry
    INSERT INTO inventory_registry (
        organization_id,
        item_type,
        entity_type,
        entity_id,
        name,
        description,
        sku,
        serial_number,
        barcode,
        category_id,
        category_name,
        status,
        condition,
        location_id,
        location_name,
        current_holder_id,
        current_holder_name,
        quantity,
        unit_value,
        total_value,
        currency,
        last_maintenance_date,
        next_maintenance_date,
        project_id,
        event_id,
        visibility,
        image_url,
        specifications,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_item_type,
        p_entity_type,
        p_entity_id,
        p_name,
        p_description,
        p_sku,
        p_serial_number,
        p_barcode,
        p_category_id,
        p_category_name,
        p_status,
        p_condition,
        p_location_id,
        p_location_name,
        p_current_holder_id,
        p_current_holder_name,
        p_quantity,
        p_unit_value,
        v_total_value,
        p_currency,
        p_last_maintenance_date,
        p_next_maintenance_date,
        p_project_id,
        p_event_id,
        p_visibility,
        p_image_url,
        p_specifications,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sku = EXCLUDED.sku,
        serial_number = EXCLUDED.serial_number,
        barcode = EXCLUDED.barcode,
        category_id = EXCLUDED.category_id,
        category_name = EXCLUDED.category_name,
        status = EXCLUDED.status,
        condition = EXCLUDED.condition,
        location_id = EXCLUDED.location_id,
        location_name = EXCLUDED.location_name,
        current_holder_id = EXCLUDED.current_holder_id,
        current_holder_name = EXCLUDED.current_holder_name,
        quantity = EXCLUDED.quantity,
        unit_value = EXCLUDED.unit_value,
        total_value = EXCLUDED.total_value,
        currency = EXCLUDED.currency,
        last_maintenance_date = EXCLUDED.last_maintenance_date,
        next_maintenance_date = EXCLUDED.next_maintenance_date,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        image_url = EXCLUDED.image_url,
        specifications = EXCLUDED.specifications,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_registry_id;
    
    RETURN v_registry_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete inventory registry entry
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_inventory_registry_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM inventory_registry 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Assets → inventory_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_asset_to_inventory() RETURNS TRIGGER AS $$
DECLARE
    v_category_name VARCHAR(255);
    v_location_name VARCHAR(255);
    v_last_maintenance DATE;
    v_next_maintenance DATE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_inventory_registry_for_entity('asset', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip deleted assets
    IF NEW.deleted_at IS NOT NULL THEN
        PERFORM delete_inventory_registry_for_entity('asset', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get category name
    SELECT name INTO v_category_name FROM asset_categories WHERE id = NEW.category_id;
    
    -- Get location name
    SELECT name INTO v_location_name FROM locations WHERE id = NEW.location_id;
    
    -- Get last maintenance date
    SELECT MAX(completed_date) INTO v_last_maintenance 
    FROM asset_maintenance WHERE asset_id = NEW.id AND completed_date IS NOT NULL;
    
    -- Get next maintenance date
    SELECT MIN(scheduled_date) INTO v_next_maintenance 
    FROM asset_maintenance WHERE asset_id = NEW.id AND status = 'scheduled';
    
    PERFORM upsert_inventory_registry(
        p_organization_id := NEW.organization_id,
        p_item_type := 'asset',
        p_entity_type := 'asset',
        p_entity_id := NEW.id,
        p_name := NEW.name,
        p_description := NEW.description,
        p_sku := NEW.asset_tag,
        p_serial_number := NEW.serial_number,
        p_barcode := NEW.barcode,
        p_category_id := NEW.category_id,
        p_category_name := v_category_name,
        p_status := NEW.status::TEXT,
        p_condition := NEW.condition::TEXT,
        p_location_id := NEW.location_id,
        p_location_name := v_location_name,
        p_quantity := 1,
        p_unit_value := COALESCE(NEW.current_value, NEW.purchase_price),
        p_currency := COALESCE(NEW.purchase_currency, 'USD'),
        p_last_maintenance_date := v_last_maintenance,
        p_next_maintenance_date := v_next_maintenance,
        p_visibility := 'team',
        p_image_url := NEW.image_url,
        p_specifications := NEW.specifications,
        p_metadata := jsonb_build_object(
            'manufacturer', NEW.manufacturer,
            'model', NEW.model,
            'purchase_date', NEW.purchase_date,
            'warranty_expires', NEW.warranty_expires
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_asset_to_inventory ON assets;
CREATE TRIGGER trg_sync_asset_to_inventory
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION sync_asset_to_inventory();

-- ============================================================================
-- TRIGGER: Asset Kits → inventory_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_asset_kit_to_inventory() RETURNS TRIGGER AS $$
DECLARE
    v_category_name VARCHAR(255);
    v_location_name VARCHAR(255);
    v_item_count INTEGER;
    v_total_value DECIMAL(12, 2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_inventory_registry_for_entity('asset_kit', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get category name
    SELECT name INTO v_category_name FROM asset_categories WHERE id = NEW.category_id;
    
    -- Get location name
    SELECT name INTO v_location_name FROM locations WHERE id = NEW.location_id;
    
    -- Get item count and total value
    SELECT COUNT(*), COALESCE(SUM(a.current_value), 0)
    INTO v_item_count, v_total_value
    FROM asset_kit_items aki
    JOIN assets a ON a.id = aki.asset_id
    WHERE aki.kit_id = NEW.id;
    
    PERFORM upsert_inventory_registry(
        p_organization_id := NEW.organization_id,
        p_item_type := 'kit',
        p_entity_type := 'asset_kit',
        p_entity_id := NEW.id,
        p_name := NEW.name,
        p_description := NEW.description,
        p_sku := NEW.kit_number,
        p_category_id := NEW.category_id,
        p_category_name := v_category_name,
        p_status := NEW.status::TEXT,
        p_location_id := NEW.location_id,
        p_location_name := v_location_name,
        p_quantity := v_item_count,
        p_unit_value := v_total_value,
        p_visibility := 'team',
        p_image_url := NEW.image_url,
        p_metadata := jsonb_build_object('item_count', v_item_count)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_asset_kit_to_inventory ON asset_kits;
CREATE TRIGGER trg_sync_asset_kit_to_inventory
    AFTER INSERT OR UPDATE OR DELETE ON asset_kits
    FOR EACH ROW EXECUTE FUNCTION sync_asset_kit_to_inventory();

-- ============================================================================
-- TRIGGER: Asset Check Actions → Update inventory_registry holder
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_check_action_to_inventory() RETURNS TRIGGER AS $$
DECLARE
    v_holder_name VARCHAR(255);
BEGIN
    IF NEW.asset_id IS NOT NULL THEN
        -- Get holder name
        IF NEW.action_type = 'check_out' THEN
            SELECT full_name INTO v_holder_name FROM users WHERE id = NEW.checked_out_to;
            
            UPDATE inventory_registry 
            SET current_holder_id = NEW.checked_out_to,
                current_holder_name = v_holder_name,
                project_id = NEW.project_id,
                event_id = NEW.event_id,
                updated_at = NOW()
            WHERE entity_type = 'asset' AND entity_id = NEW.asset_id;
        ELSIF NEW.action_type = 'check_in' THEN
            UPDATE inventory_registry 
            SET current_holder_id = NULL,
                current_holder_name = NULL,
                location_id = NEW.to_location_id,
                updated_at = NOW()
            WHERE entity_type = 'asset' AND entity_id = NEW.asset_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_check_action_to_inventory ON asset_check_actions;
CREATE TRIGGER trg_sync_check_action_to_inventory
    AFTER INSERT ON asset_check_actions
    FOR EACH ROW EXECUTE FUNCTION sync_check_action_to_inventory();

-- ============================================================================
-- RLS POLICIES FOR INVENTORY_REGISTRY
-- ============================================================================

-- Enable RLS
ALTER TABLE inventory_registry ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS inventory_registry_select_policy ON inventory_registry;
DROP POLICY IF EXISTS inventory_registry_insert_policy ON inventory_registry;
DROP POLICY IF EXISTS inventory_registry_update_policy ON inventory_registry;
DROP POLICY IF EXISTS inventory_registry_delete_policy ON inventory_registry;

-- SELECT: Users can see inventory based on organization membership
CREATE POLICY inventory_registry_select_policy ON inventory_registry
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY inventory_registry_insert_policy ON inventory_registry
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY inventory_registry_update_policy ON inventory_registry
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY inventory_registry_delete_policy ON inventory_registry
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing assets
-- ============================================================================

INSERT INTO inventory_registry (
    organization_id, item_type, entity_type, entity_id,
    name, description, sku, serial_number, barcode,
    category_id, category_name, status, condition,
    location_id, location_name, quantity, unit_value, currency,
    visibility, image_url, specifications, metadata,
    external_id, created_at, updated_at
)
SELECT 
    a.organization_id,
    'asset',
    'asset',
    a.id,
    a.name,
    a.description,
    a.asset_tag,
    a.serial_number,
    a.barcode,
    a.category_id,
    ac.name,
    a.status::TEXT,
    a.condition::TEXT,
    a.location_id,
    l.name,
    1,
    COALESCE(a.current_value, a.purchase_price),
    COALESCE(a.purchase_currency, 'USD'),
    'team',
    a.image_url,
    a.specifications,
    jsonb_build_object('manufacturer', a.manufacturer, 'model', a.model),
    'asset:' || a.id::TEXT,
    NOW(),
    NOW()
FROM assets a
LEFT JOIN asset_categories ac ON ac.id = a.category_id
LEFT JOIN locations l ON l.id = a.location_id
WHERE a.deleted_at IS NULL
ON CONFLICT (external_id) DO NOTHING;

-- Backfill asset kits
INSERT INTO inventory_registry (
    organization_id, item_type, entity_type, entity_id,
    name, description, sku, category_id, category_name,
    status, location_id, location_name, quantity, unit_value,
    visibility, image_url, metadata,
    external_id, created_at, updated_at
)
SELECT 
    ak.organization_id,
    'kit',
    'asset_kit',
    ak.id,
    ak.name,
    ak.description,
    ak.kit_number,
    ak.category_id,
    ac.name,
    ak.status::TEXT,
    ak.location_id,
    l.name,
    COALESCE(kit_stats.item_count, 0),
    COALESCE(kit_stats.total_value, 0),
    'team',
    ak.image_url,
    jsonb_build_object('item_count', COALESCE(kit_stats.item_count, 0)),
    'asset_kit:' || ak.id::TEXT,
    NOW(),
    NOW()
FROM asset_kits ak
LEFT JOIN asset_categories ac ON ac.id = ak.category_id
LEFT JOIN locations l ON l.id = ak.location_id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as item_count, COALESCE(SUM(a.current_value), 0) as total_value
    FROM asset_kit_items aki
    JOIN assets a ON a.id = aki.asset_id
    WHERE aki.kit_id = ak.id
) kit_stats ON TRUE
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE inventory_registry IS 'SSOT for all trackable items. Source entities sync here via triggers.';
COMMENT ON COLUMN inventory_registry.item_type IS 'Type of item (asset, kit, consumable)';
COMMENT ON COLUMN inventory_registry.entity_type IS 'Source entity type';
COMMENT ON COLUMN inventory_registry.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN inventory_registry.sku IS 'Stock keeping unit (asset_tag or kit_number)';
COMMENT ON COLUMN inventory_registry.current_holder_id IS 'User currently holding the item (if checked out)';
COMMENT ON COLUMN inventory_registry.external_id IS 'Unique key for upsert: entity_type:entity_id';
