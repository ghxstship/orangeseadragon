-- Migration 00066: Advancing Catalog
-- Adds catalog system for Uber Eats style production advancing selection

-- 1. Advancing Catalog Items (The "Menu")
CREATE TABLE IF NOT EXISTS advancing_catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES advance_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_unit_cost DECIMAL(14,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    specifications_template JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- 2. Expand Advance Items to support catalog tracking
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS catalog_item_id UUID REFERENCES advancing_catalog_items(id) ON DELETE SET NULL;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS requested_delivery_time TIMESTAMPTZ;

-- 3. Add Storefront Preferences to Organization
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS advancing_catalog_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS advancing_theme_config JSONB DEFAULT '{}';

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_catalog_category ON advancing_catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_org ON advancing_catalog_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_advance_items_catalog ON advance_items(catalog_item_id);

-- 5. Updated At Trigger
CREATE TRIGGER trg_advancing_catalog_items_updated_at
    BEFORE UPDATE ON advancing_catalog_items
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

-- Help Text
COMMENT ON TABLE advancing_catalog_items IS 'Stores standard items available for production teams to "order" (advance)';
COMMENT ON COLUMN advance_items.catalog_item_id IS 'Reference to the catalog item if this was ordered from the catalog';
