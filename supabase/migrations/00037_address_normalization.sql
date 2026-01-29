-- Migration: Address Normalization
-- Created: 2026-01-29
-- Description: Creates normalized addresses table and migrates inline address fields
--              to foreign key references for 3NF compliance

-- ============================================================================
-- STEP 1: Create addresses table
-- ============================================================================

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Address type for polymorphic use
    address_type VARCHAR(50) DEFAULT 'general' CHECK (address_type IN (
        'general', 'billing', 'shipping', 'venue', 'warehouse', 'office', 'home', 'event'
    )),
    
    -- Address label (e.g., "Main Office", "Warehouse A")
    label VARCHAR(255),
    
    -- Core address fields
    street_line_1 VARCHAR(255) NOT NULL,
    street_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    country_code CHAR(2) DEFAULT 'US',
    
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Validation
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verification_source VARCHAR(50),
    
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_org ON addresses(organization_id);
CREATE INDEX idx_addresses_type ON addresses(address_type);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_country ON addresses(country_code);
CREATE INDEX idx_addresses_geo ON addresses(latitude, longitude) WHERE latitude IS NOT NULL;

-- ============================================================================
-- STEP 2: Add address_id columns to tables with inline addresses
-- ============================================================================

-- Companies table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'address_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
        CREATE INDEX idx_companies_address ON companies(address_id);
    END IF;
END $$;

-- Contacts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'address_id'
    ) THEN
        ALTER TABLE contacts ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
        CREATE INDEX idx_contacts_address ON contacts(address_id);
    END IF;
END $$;

-- Venues table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'address_id'
    ) THEN
        ALTER TABLE venues ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
        CREATE INDEX idx_venues_address ON venues(address_id);
    END IF;
END $$;

-- Locations table (warehouses, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'locations' AND column_name = 'address_id'
    ) THEN
        ALTER TABLE locations ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
        CREATE INDEX idx_locations_address ON locations(address_id);
    END IF;
END $$;

-- Events table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'address_id'
    ) THEN
        ALTER TABLE events ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
        CREATE INDEX idx_events_address ON events(address_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Create migration function to copy inline addresses
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_inline_addresses()
RETURNS void AS $$
DECLARE
    rec RECORD;
    new_address_id UUID;
BEGIN
    -- Migrate companies addresses
    FOR rec IN 
        SELECT id, organization_id, address, city, state, country, postal_code
        FROM companies 
        WHERE address IS NOT NULL 
        AND address_id IS NULL
    LOOP
        INSERT INTO addresses (
            organization_id, address_type, label, street_line_1, city, 
            state_province, country, postal_code
        ) VALUES (
            rec.organization_id, 'billing', 'Primary Address', rec.address, rec.city,
            rec.state, COALESCE(rec.country, 'United States'), rec.postal_code
        ) RETURNING id INTO new_address_id;
        
        UPDATE companies SET address_id = new_address_id WHERE id = rec.id;
    END LOOP;

    -- Migrate contacts addresses
    FOR rec IN 
        SELECT id, organization_id, address, city, state, country, postal_code
        FROM contacts 
        WHERE address IS NOT NULL 
        AND address_id IS NULL
    LOOP
        INSERT INTO addresses (
            organization_id, address_type, label, street_line_1, city,
            state_province, country, postal_code
        ) VALUES (
            rec.organization_id, 'general', 'Contact Address', rec.address, rec.city,
            rec.state, COALESCE(rec.country, 'United States'), rec.postal_code
        ) RETURNING id INTO new_address_id;
        
        UPDATE contacts SET address_id = new_address_id WHERE id = rec.id;
    END LOOP;

    -- Migrate venues addresses
    FOR rec IN 
        SELECT id, organization_id, address, city, state, country, postal_code, latitude, longitude
        FROM venues 
        WHERE address IS NOT NULL 
        AND address_id IS NULL
    LOOP
        INSERT INTO addresses (
            organization_id, address_type, label, street_line_1, city,
            state_province, country, postal_code, latitude, longitude
        ) VALUES (
            rec.organization_id, 'venue', 'Venue Address', rec.address, rec.city,
            rec.state, COALESCE(rec.country, 'United States'), rec.postal_code,
            rec.latitude, rec.longitude
        ) RETURNING id INTO new_address_id;
        
        UPDATE venues SET address_id = new_address_id WHERE id = rec.id;
    END LOOP;

    -- Migrate locations addresses
    FOR rec IN 
        SELECT id, organization_id, address, city, state, country, postal_code
        FROM locations 
        WHERE address IS NOT NULL 
        AND address_id IS NULL
    LOOP
        INSERT INTO addresses (
            organization_id, address_type, label, street_line_1, city,
            state_province, country, postal_code
        ) VALUES (
            rec.organization_id, 'warehouse', 'Location Address', rec.address, rec.city,
            rec.state, COALESCE(rec.country, 'United States'), rec.postal_code
        ) RETURNING id INTO new_address_id;
        
        UPDATE locations SET address_id = new_address_id WHERE id = rec.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration (comment out if you want to run manually)
-- SELECT migrate_inline_addresses();

-- ============================================================================
-- STEP 4: Create view for formatted addresses
-- ============================================================================

CREATE OR REPLACE VIEW formatted_addresses AS
SELECT 
    id,
    organization_id,
    address_type,
    label,
    street_line_1,
    street_line_2,
    city,
    state_province,
    postal_code,
    country,
    country_code,
    latitude,
    longitude,
    -- Single line format
    CONCAT_WS(', ',
        street_line_1,
        NULLIF(street_line_2, ''),
        city,
        CONCAT_WS(' ', state_province, postal_code),
        CASE WHEN country_code != 'US' THEN country END
    ) AS formatted_single_line,
    -- Multi-line format
    CONCAT_WS(E'\n',
        street_line_1,
        NULLIF(street_line_2, ''),
        CONCAT_WS(', ', city, CONCAT_WS(' ', state_province, postal_code)),
        CASE WHEN country_code != 'US' THEN country END
    ) AS formatted_multi_line,
    is_verified,
    is_active,
    created_at,
    updated_at
FROM addresses;

-- ============================================================================
-- STEP 5: RLS Policies
-- ============================================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view addresses in their organization"
    ON addresses FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create addresses in their organization"
    ON addresses FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update addresses in their organization"
    ON addresses FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete addresses in their organization"
    ON addresses FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- STEP 6: Trigger for updated_at
-- ============================================================================

CREATE TRIGGER set_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: Comments
-- ============================================================================

COMMENT ON TABLE addresses IS 'Normalized address storage for 3NF compliance. Replaces inline address fields across multiple tables.';
COMMENT ON COLUMN addresses.address_type IS 'Type of address: general, billing, shipping, venue, warehouse, office, home, event';
COMMENT ON COLUMN addresses.is_verified IS 'Whether address has been verified via geocoding or manual verification';
COMMENT ON FUNCTION migrate_inline_addresses() IS 'One-time migration function to copy inline addresses to normalized table. Run manually after reviewing data.';
