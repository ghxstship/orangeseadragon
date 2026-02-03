-- Migration: BUSINESS Module Data Gaps
-- Created: 2026-02-02
-- Description: Create missing tables for BUSINESS module features
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- PRODUCTS (Distinct from catalog_items - what you SELL vs what you OWN)
-- Navigation: /business/products/list
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM (
            'physical', 'digital', 'rental', 'subscription', 'bundle'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM (
            'draft', 'active', 'discontinued', 'out_of_stock', 'archived'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Classification
    category VARCHAR(100),
    subcategory VARCHAR(100),
    product_type product_type DEFAULT 'physical',
    
    -- Pricing
    base_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    tax_class VARCHAR(50),
    is_taxable BOOLEAN DEFAULT TRUE,
    
    -- For rentals - link to owned equipment
    catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL,
    rental_daily_rate DECIMAL(12,2),
    rental_weekly_rate DECIMAL(12,2),
    rental_monthly_rate DECIMAL(12,2),
    
    -- Inventory (for physical products)
    track_inventory BOOLEAN DEFAULT FALSE,
    quantity_on_hand INTEGER DEFAULT 0,
    reorder_point INTEGER,
    
    -- Media
    primary_image_url TEXT,
    gallery_urls JSONB DEFAULT '[]',
    
    -- SEO
    slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Attributes
    attributes JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Dates
    available_from DATE,
    available_until DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, product_code)
);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_catalog_item ON products(catalog_item_id);
CREATE INDEX idx_products_active ON products(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_slug ON products(organization_id, slug);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_code VARCHAR(50) NOT NULL,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    
    -- Variant attributes
    attributes JSONB DEFAULT '{}', -- {color: "red", size: "large"}
    
    -- Pricing (overrides product base price if set)
    price DECIMAL(12,2),
    cost DECIMAL(12,2),
    
    -- Inventory
    quantity_on_hand INTEGER DEFAULT 0,
    
    -- Media
    image_url TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, variant_code)
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- ============================================================================
-- PRICE LISTS
-- Navigation: /business/products/pricing
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'price_list_type') THEN
        CREATE TYPE price_list_type AS ENUM (
            'standard', 'wholesale', 'retail', 'promotional', 'contract', 'vip'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    price_list_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Type and scope
    price_list_type price_list_type DEFAULT 'standard',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE,
    
    -- Discounts (applied to all items if set)
    default_discount_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Restrictions
    minimum_order_amount DECIMAL(12,2),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- For contract pricing
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, price_list_code)
);

CREATE INDEX idx_price_lists_org ON price_lists(organization_id);
CREATE INDEX idx_price_lists_type ON price_lists(price_list_type);
CREATE INDEX idx_price_lists_effective ON price_lists(effective_date, expiration_date);
CREATE INDEX idx_price_lists_company ON price_lists(company_id);
CREATE INDEX idx_price_lists_active ON price_lists(organization_id, is_active) WHERE is_active = TRUE;

-- Price list items
CREATE TABLE IF NOT EXISTS price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    
    -- Item reference (product OR service, not both)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    
    -- Pricing
    unit_price DECIMAL(12,2) NOT NULL,
    minimum_quantity INTEGER DEFAULT 1,
    
    -- Discounts
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Quantity breaks
    quantity_breaks JSONB DEFAULT '[]', -- [{min_qty: 10, price: 90}, {min_qty: 50, price: 80}]
    
    -- Validity (overrides price list dates if set)
    effective_date DATE,
    expiration_date DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT product_or_service CHECK (
        (product_id IS NOT NULL AND service_id IS NULL) OR
        (product_id IS NULL AND service_id IS NOT NULL) OR
        (product_variant_id IS NOT NULL)
    )
);

CREATE INDEX idx_price_list_items_list ON price_list_items(price_list_id);
CREATE INDEX idx_price_list_items_product ON price_list_items(product_id);
CREATE INDEX idx_price_list_items_variant ON price_list_items(product_variant_id);
CREATE INDEX idx_price_list_items_service ON price_list_items(service_id);

-- ============================================================================
-- SPONSORS (Extension of companies with sponsor-specific data)
-- Navigation: /business/companies/sponsors
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sponsor_tier') THEN
        CREATE TYPE sponsor_tier AS ENUM (
            'title', 'presenting', 'platinum', 'gold', 'silver', 'bronze', 
            'supporting', 'media', 'in_kind', 'community'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sponsorship_status') THEN
        CREATE TYPE sponsorship_status AS ENUM (
            'prospect', 'contacted', 'negotiating', 'committed', 'contracted',
            'active', 'fulfilled', 'renewed', 'declined', 'cancelled'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Sponsor details
    sponsor_code VARCHAR(50),
    tier sponsor_tier,
    
    -- Primary contact for sponsorship
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Branding
    logo_url TEXT,
    logo_dark_url TEXT,
    brand_guidelines_url TEXT,
    
    -- Preferences
    preferred_placement TEXT,
    exclusivity_category VARCHAR(100),
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, company_id)
);

CREATE INDEX idx_sponsors_org ON sponsors(organization_id);
CREATE INDEX idx_sponsors_company ON sponsors(company_id);
CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_active ON sponsors(organization_id, is_active) WHERE is_active = TRUE;

-- Sponsorship agreements (per event/production)
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sponsorship_number VARCHAR(50) NOT NULL,
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    
    -- What they're sponsoring
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    production_id UUID REFERENCES productions(id) ON DELETE SET NULL,
    
    -- Terms
    tier sponsor_tier NOT NULL,
    status sponsorship_status DEFAULT 'prospect',
    
    -- Value
    cash_value DECIMAL(14,2) DEFAULT 0,
    in_kind_value DECIMAL(14,2) DEFAULT 0,
    total_value DECIMAL(14,2) GENERATED ALWAYS AS (cash_value + in_kind_value) STORED,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Dates
    contract_date DATE,
    start_date DATE,
    end_date DATE,
    
    -- Deliverables
    deliverables JSONB DEFAULT '[]', -- [{type, description, due_date, status}]
    
    -- Benefits
    benefits JSONB DEFAULT '[]', -- [{type, description, quantity}]
    
    -- Documents
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    
    -- Fulfillment
    fulfillment_status VARCHAR(20) DEFAULT 'pending' CHECK (fulfillment_status IN (
        'pending', 'in_progress', 'completed', 'partial'
    )),
    fulfillment_notes TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, sponsorship_number)
);

CREATE INDEX idx_sponsorships_org ON sponsorships(organization_id);
CREATE INDEX idx_sponsorships_sponsor ON sponsorships(sponsor_id);
CREATE INDEX idx_sponsorships_event ON sponsorships(event_id);
CREATE INDEX idx_sponsorships_production ON sponsorships(production_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);
CREATE INDEX idx_sponsorships_tier ON sponsorships(tier);

-- Sponsorship deliverable tracking
CREATE TABLE IF NOT EXISTS sponsorship_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsorship_id UUID NOT NULL REFERENCES sponsorships(id) ON DELETE CASCADE,
    
    deliverable_type VARCHAR(50) NOT NULL, -- 'logo_placement', 'booth', 'speaking', 'tickets', etc.
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Scheduling
    due_date DATE,
    completed_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled', 'deferred'
    )),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Evidence
    proof_url TEXT,
    photos JSONB DEFAULT '[]',
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sponsorship_deliverables_sponsorship ON sponsorship_deliverables(sponsorship_id);
CREATE INDEX idx_sponsorship_deliverables_status ON sponsorship_deliverables(status);
CREATE INDEX idx_sponsorship_deliverables_due ON sponsorship_deliverables(due_date) 
    WHERE status NOT IN ('completed', 'cancelled');

-- ============================================================================
-- PRODUCT-SERVICE BUNDLES (Packages that combine products and services)
-- Navigation: /business/products/packages
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    bundle_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    bundle_price DECIMAL(12,2), -- If null, sum of components
    discount_percent DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Media
    image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, bundle_code)
);

CREATE INDEX idx_product_bundles_org ON product_bundles(organization_id);

CREATE TABLE IF NOT EXISTS product_bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
    
    -- Item (product OR service)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    
    quantity INTEGER DEFAULT 1,
    
    -- Override pricing
    unit_price DECIMAL(12,2), -- If null, uses product/service price
    
    is_optional BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT bundle_product_or_service CHECK (
        (product_id IS NOT NULL AND service_id IS NULL) OR
        (product_id IS NULL AND service_id IS NOT NULL)
    )
);

CREATE INDEX idx_product_bundle_items_bundle ON product_bundle_items(bundle_id);
CREATE INDEX idx_product_bundle_items_product ON product_bundle_items(product_id);
CREATE INDEX idx_product_bundle_items_service ON product_bundle_items(service_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Products with pricing from default price list
CREATE OR REPLACE VIEW products_with_pricing AS
SELECT 
    p.*,
    pli.unit_price AS list_price,
    pli.discount_percent,
    (pli.unit_price * (1 - COALESCE(pli.discount_percent, 0) / 100)) AS effective_price,
    pl.name AS price_list_name
FROM products p
LEFT JOIN price_list_items pli ON pli.product_id = p.id AND pli.is_active = TRUE
LEFT JOIN price_lists pl ON pl.id = pli.price_list_id AND pl.is_default = TRUE AND pl.is_active = TRUE
WHERE p.is_active = TRUE;

-- Sponsor summary with total sponsorship value
CREATE OR REPLACE VIEW sponsors_summary AS
SELECT 
    s.id AS sponsor_id,
    s.organization_id,
    c.name AS company_name,
    s.tier,
    s.is_active,
    COUNT(sp.id) AS total_sponsorships,
    COUNT(sp.id) FILTER (WHERE sp.status = 'active') AS active_sponsorships,
    SUM(sp.total_value) AS total_lifetime_value,
    SUM(sp.total_value) FILTER (WHERE sp.status = 'active') AS active_value,
    MAX(sp.end_date) AS latest_sponsorship_end
FROM sponsors s
JOIN companies c ON c.id = s.company_id
LEFT JOIN sponsorships sp ON sp.sponsor_id = s.id
GROUP BY s.id, c.name;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundle_items ENABLE ROW LEVEL SECURITY;

-- Products
CREATE POLICY "products_org_access" ON products 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "product_variants_org_access" ON product_variants 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM products p WHERE p.id = product_variants.product_id 
                AND is_organization_member(p.organization_id))
    );

-- Price Lists
CREATE POLICY "price_lists_org_access" ON price_lists 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "price_list_items_org_access" ON price_list_items 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM price_lists pl WHERE pl.id = price_list_items.price_list_id 
                AND is_organization_member(pl.organization_id))
    );

-- Sponsors
CREATE POLICY "sponsors_org_access" ON sponsors 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "sponsorships_org_access" ON sponsorships 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "sponsorship_deliverables_org_access" ON sponsorship_deliverables 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM sponsorships s WHERE s.id = sponsorship_deliverables.sponsorship_id 
                AND is_organization_member(s.organization_id))
    );

-- Bundles
CREATE POLICY "product_bundles_org_access" ON product_bundles 
    FOR ALL USING (is_organization_member(organization_id));

CREATE POLICY "product_bundle_items_org_access" ON product_bundle_items 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM product_bundles pb WHERE pb.id = product_bundle_items.bundle_id 
                AND is_organization_member(pb.organization_id))
    );

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_price_lists_updated_at
    BEFORE UPDATE ON price_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_price_list_items_updated_at
    BEFORE UPDATE ON price_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_sponsors_updated_at
    BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_sponsorships_updated_at
    BEFORE UPDATE ON sponsorships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_sponsorship_deliverables_updated_at
    BEFORE UPDATE ON sponsorship_deliverables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_bundles_updated_at
    BEFORE UPDATE ON product_bundles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Products for sale (distinct from catalog_items which are owned equipment)';
COMMENT ON TABLE product_variants IS 'Product variations (size, color, etc.)';
COMMENT ON TABLE price_lists IS 'Price lists for different customer segments or time periods';
COMMENT ON TABLE price_list_items IS 'Individual product/service prices within a price list';
COMMENT ON TABLE sponsors IS 'Sponsor profiles linked to companies';
COMMENT ON TABLE sponsorships IS 'Individual sponsorship agreements for events/productions';
COMMENT ON TABLE sponsorship_deliverables IS 'Tracking of sponsorship deliverable fulfillment';
COMMENT ON TABLE product_bundles IS 'Bundled packages of products and services';
