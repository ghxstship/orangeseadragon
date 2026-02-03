-- ============================================================================
-- LOCATION REGISTRY AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes location_registry as the Single Source of Truth
-- for all location/place references across the platform. Source entities 
-- (venues, locations, venue_spaces) automatically sync to location_registry
-- via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - location_registry owns the unified location index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE LOCATION REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS location_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Location classification
    location_type VARCHAR(50) NOT NULL,    -- 'venue', 'warehouse', 'office', 'space', 'external'
    location_category VARCHAR(50),          -- 'concert_hall', 'stadium', 'storage', etc.
    
    -- Source entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    parent_id UUID,                         -- For hierarchical locations (spaces within venues)
    
    -- Location info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Geo coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    
    -- Capacity
    capacity INTEGER,
    
    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    website VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_partner BOOLEAN DEFAULT FALSE,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    
    -- Metadata
    amenities TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX idx_location_registry_organization ON location_registry(organization_id);
CREATE INDEX idx_location_registry_type ON location_registry(location_type);
CREATE INDEX idx_location_registry_category ON location_registry(location_category);
CREATE INDEX idx_location_registry_entity ON location_registry(entity_type, entity_id);
CREATE INDEX idx_location_registry_parent ON location_registry(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_location_registry_city ON location_registry(city) WHERE city IS NOT NULL;
CREATE INDEX idx_location_registry_geo ON location_registry(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX idx_location_registry_active ON location_registry(is_active);
CREATE INDEX idx_location_registry_search ON location_registry USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(city, '') || ' ' || COALESCE(address, ''))
);

-- ============================================================================
-- HELPER FUNCTION: Upsert location registry entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_location_registry(
    p_organization_id UUID,
    p_location_type VARCHAR(50),
    p_location_category VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_parent_id UUID DEFAULT NULL,
    p_name VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city VARCHAR(100) DEFAULT NULL,
    p_state VARCHAR(100) DEFAULT NULL,
    p_country VARCHAR(100) DEFAULT NULL,
    p_postal_code VARCHAR(20) DEFAULT NULL,
    p_latitude DECIMAL(10, 8) DEFAULT NULL,
    p_longitude DECIMAL(11, 8) DEFAULT NULL,
    p_timezone VARCHAR(50) DEFAULT NULL,
    p_capacity INTEGER DEFAULT NULL,
    p_contact_name VARCHAR(255) DEFAULT NULL,
    p_contact_phone VARCHAR(50) DEFAULT NULL,
    p_contact_email VARCHAR(255) DEFAULT NULL,
    p_website VARCHAR(255) DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT TRUE,
    p_is_partner BOOLEAN DEFAULT FALSE,
    p_visibility visibility_type DEFAULT 'team',
    p_amenities TEXT[] DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_location_id UUID;
    v_external_id VARCHAR(100);
BEGIN
    -- Create unique key for this location entry
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT;
    
    -- Upsert the location registry entry
    INSERT INTO location_registry (
        organization_id,
        location_type,
        location_category,
        entity_type,
        entity_id,
        parent_id,
        name,
        description,
        address,
        city,
        state,
        country,
        postal_code,
        latitude,
        longitude,
        timezone,
        capacity,
        contact_name,
        contact_phone,
        contact_email,
        website,
        is_active,
        is_partner,
        visibility,
        amenities,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_location_type,
        p_location_category,
        p_entity_type,
        p_entity_id,
        p_parent_id,
        p_name,
        p_description,
        p_address,
        p_city,
        p_state,
        p_country,
        p_postal_code,
        p_latitude,
        p_longitude,
        p_timezone,
        p_capacity,
        p_contact_name,
        p_contact_phone,
        p_contact_email,
        p_website,
        p_is_active,
        p_is_partner,
        p_visibility,
        p_amenities,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        location_type = EXCLUDED.location_type,
        location_category = EXCLUDED.location_category,
        parent_id = EXCLUDED.parent_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        country = EXCLUDED.country,
        postal_code = EXCLUDED.postal_code,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        timezone = EXCLUDED.timezone,
        capacity = EXCLUDED.capacity,
        contact_name = EXCLUDED.contact_name,
        contact_phone = EXCLUDED.contact_phone,
        contact_email = EXCLUDED.contact_email,
        website = EXCLUDED.website,
        is_active = EXCLUDED.is_active,
        is_partner = EXCLUDED.is_partner,
        amenities = EXCLUDED.amenities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_location_id;
    
    RETURN v_location_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete location registry entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_location_registry_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM location_registry 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Venues → location_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_venue_to_registry() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_location_registry_for_entity('venue', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip inactive venues
    IF NEW.is_active = FALSE THEN
        PERFORM delete_location_registry_for_entity('venue', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_location_registry(
        p_organization_id := NEW.organization_id,
        p_location_type := 'venue',
        p_location_category := NEW.venue_type::TEXT,
        p_entity_type := 'venue',
        p_entity_id := NEW.id,
        p_name := NEW.name,
        p_description := NEW.description,
        p_address := NEW.address,
        p_city := NEW.city,
        p_state := NEW.state,
        p_country := NEW.country,
        p_postal_code := NEW.postal_code,
        p_latitude := NEW.latitude,
        p_longitude := NEW.longitude,
        p_timezone := NEW.timezone,
        p_capacity := NEW.capacity,
        p_contact_name := NEW.contact_name,
        p_contact_phone := NEW.phone,
        p_contact_email := NEW.email,
        p_website := NEW.website,
        p_is_active := NEW.is_active,
        p_is_partner := NEW.is_partner,
        p_visibility := 'team',
        p_amenities := NEW.amenities,
        p_metadata := NEW.metadata
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_venue_to_registry ON venues;
CREATE TRIGGER trg_sync_venue_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON venues
    FOR EACH ROW EXECUTE FUNCTION sync_venue_to_registry();

-- ============================================================================
-- TRIGGER: Locations → location_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_location_to_registry() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_location_registry_for_entity('location', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip inactive locations
    IF NEW.is_active = FALSE THEN
        PERFORM delete_location_registry_for_entity('location', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_location_registry(
        p_organization_id := NEW.organization_id,
        p_location_type := NEW.location_type::TEXT,
        p_location_category := NEW.location_type::TEXT,
        p_entity_type := 'location',
        p_entity_id := NEW.id,
        p_parent_id := NEW.parent_id,
        p_name := NEW.name,
        p_description := NEW.description,
        p_address := NEW.address,
        p_city := NEW.city,
        p_state := NEW.state,
        p_country := NEW.country,
        p_postal_code := NEW.postal_code,
        p_latitude := NEW.latitude,
        p_longitude := NEW.longitude,
        p_contact_name := NEW.contact_name,
        p_contact_phone := NEW.contact_phone,
        p_contact_email := NEW.contact_email,
        p_is_active := NEW.is_active,
        p_visibility := 'team',
        p_metadata := NEW.metadata
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_location_to_registry ON locations;
CREATE TRIGGER trg_sync_location_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON locations
    FOR EACH ROW EXECUTE FUNCTION sync_location_to_registry();

-- ============================================================================
-- TRIGGER: Venue Spaces → location_registry
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_venue_space_to_registry() RETURNS TRIGGER AS $$
DECLARE
    v_venue RECORD;
    v_parent_registry_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_location_registry_for_entity('venue_space', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip inactive spaces
    IF NEW.is_active = FALSE THEN
        PERFORM delete_location_registry_for_entity('venue_space', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get venue details
    SELECT * INTO v_venue FROM venues WHERE id = NEW.venue_id;
    
    IF v_venue IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get parent registry entry ID
    SELECT id INTO v_parent_registry_id FROM location_registry 
    WHERE entity_type = 'venue' AND entity_id = NEW.venue_id;
    
    PERFORM upsert_location_registry(
        p_organization_id := v_venue.organization_id,
        p_location_type := 'space',
        p_location_category := NEW.space_type::TEXT,
        p_entity_type := 'venue_space',
        p_entity_id := NEW.id,
        p_parent_id := v_parent_registry_id,
        p_name := NEW.name,
        p_description := NEW.description,
        p_address := v_venue.address,
        p_city := v_venue.city,
        p_state := v_venue.state,
        p_country := v_venue.country,
        p_capacity := COALESCE(NEW.capacity_standing, NEW.capacity_seated),
        p_is_active := NEW.is_active,
        p_visibility := 'team',
        p_amenities := NEW.amenities,
        p_metadata := jsonb_build_object(
            'venue_name', v_venue.name,
            'dimensions', NEW.dimensions,
            'capacity_standing', NEW.capacity_standing,
            'capacity_seated', NEW.capacity_seated
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_venue_space_to_registry ON venue_spaces;
CREATE TRIGGER trg_sync_venue_space_to_registry
    AFTER INSERT OR UPDATE OR DELETE ON venue_spaces
    FOR EACH ROW EXECUTE FUNCTION sync_venue_space_to_registry();

-- ============================================================================
-- RLS POLICIES FOR LOCATION_REGISTRY
-- ============================================================================

-- Enable RLS
ALTER TABLE location_registry ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS location_registry_select_policy ON location_registry;
DROP POLICY IF EXISTS location_registry_insert_policy ON location_registry;
DROP POLICY IF EXISTS location_registry_update_policy ON location_registry;
DROP POLICY IF EXISTS location_registry_delete_policy ON location_registry;

-- SELECT: Users can see locations based on organization membership
CREATE POLICY location_registry_select_policy ON location_registry
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
CREATE POLICY location_registry_insert_policy ON location_registry
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY location_registry_update_policy ON location_registry
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY location_registry_delete_policy ON location_registry
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing venues
-- ============================================================================

INSERT INTO location_registry (
    organization_id, location_type, location_category, entity_type, entity_id,
    name, description, address, city, state, country, postal_code,
    latitude, longitude, timezone, capacity,
    contact_name, contact_phone, contact_email, website,
    is_active, is_partner, visibility, amenities, metadata,
    external_id, created_at, updated_at
)
SELECT 
    v.organization_id,
    'venue',
    v.venue_type::TEXT,
    'venue',
    v.id,
    v.name,
    v.description,
    v.address,
    v.city,
    v.state,
    v.country,
    v.postal_code,
    v.latitude,
    v.longitude,
    v.timezone,
    v.capacity,
    v.contact_name,
    v.phone,
    v.email,
    v.website,
    v.is_active,
    v.is_partner,
    'team',
    v.amenities,
    v.metadata,
    'venue:' || v.id::TEXT,
    NOW(),
    NOW()
FROM venues v
WHERE v.is_active = TRUE
ON CONFLICT (external_id) DO NOTHING;

-- Backfill locations
INSERT INTO location_registry (
    organization_id, location_type, location_category, entity_type, entity_id,
    parent_id, name, description, address, city, state, country, postal_code,
    latitude, longitude, contact_name, contact_phone, contact_email,
    is_active, visibility, metadata,
    external_id, created_at, updated_at
)
SELECT 
    l.organization_id,
    l.location_type::TEXT,
    l.location_type::TEXT,
    'location',
    l.id,
    l.parent_id,
    l.name,
    l.description,
    l.address,
    l.city,
    l.state,
    l.country,
    l.postal_code,
    l.latitude,
    l.longitude,
    l.contact_name,
    l.contact_phone,
    l.contact_email,
    l.is_active,
    'team',
    l.metadata,
    'location:' || l.id::TEXT,
    NOW(),
    NOW()
FROM locations l
WHERE l.is_active = TRUE
ON CONFLICT (external_id) DO NOTHING;

-- Backfill venue spaces
INSERT INTO location_registry (
    organization_id, location_type, location_category, entity_type, entity_id,
    parent_id, name, description, address, city, state, country,
    capacity, is_active, visibility, amenities, metadata,
    external_id, created_at, updated_at
)
SELECT 
    v.organization_id,
    'space',
    vs.space_type::TEXT,
    'venue_space',
    vs.id,
    lr.id,
    vs.name,
    vs.description,
    v.address,
    v.city,
    v.state,
    v.country,
    COALESCE(vs.capacity_standing, vs.capacity_seated),
    vs.is_active,
    'team',
    vs.amenities,
    jsonb_build_object('venue_name', v.name, 'capacity_standing', vs.capacity_standing, 'capacity_seated', vs.capacity_seated),
    'venue_space:' || vs.id::TEXT,
    NOW(),
    NOW()
FROM venue_spaces vs
JOIN venues v ON v.id = vs.venue_id
LEFT JOIN location_registry lr ON lr.entity_type = 'venue' AND lr.entity_id = vs.venue_id
WHERE vs.is_active = TRUE
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE location_registry IS 'SSOT for all location/place references. Source entities sync here via triggers.';
COMMENT ON COLUMN location_registry.location_type IS 'Type of location (venue, warehouse, office, space, external)';
COMMENT ON COLUMN location_registry.location_category IS 'Category within type (concert_hall, stadium, storage, etc.)';
COMMENT ON COLUMN location_registry.entity_type IS 'Source entity type';
COMMENT ON COLUMN location_registry.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN location_registry.parent_id IS 'Parent location for hierarchical structures';
COMMENT ON COLUMN location_registry.external_id IS 'Unique key for upsert: entity_type:entity_id';
