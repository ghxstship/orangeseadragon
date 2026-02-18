-- ============================================================================
-- Migration 00125: Places Domain SSOT — Part 2: Data Migration & FK Rewiring
-- ============================================================================
-- Depends on 00124 (enum expansion). Now that new enum values exist,
-- we can use them in INSERT statements.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Add venue-specific columns to locations
-- ---------------------------------------------------------------------------
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE locations ADD COLUMN IF NOT EXISTS venue_type TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS technical_specs JSONB;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS house_rules TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS load_in_info TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS parking_info TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS gallery_urls JSONB;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS zone_type TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS space_type TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_seated INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_standing INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_banquet INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS capacity_theater INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS daily_rate NUMERIC;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS access_level TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS floor_plan_id UUID;

-- ---------------------------------------------------------------------------
-- 2. Migrate venues → locations
-- ---------------------------------------------------------------------------
INSERT INTO locations (
  id, name, slug, location_type, address_id,
  capacity, amenities, venue_type, technical_specs, cover_image_url,
  logo_url, email, phone, website, timezone,
  house_rules, load_in_info, parking_info, gallery_urls, is_partner,
  created_by, organization_id, is_active, description, metadata,
  created_at, updated_at
)
SELECT
  v.id, v.name, v.slug, 'venue'::location_type, v.address_id,
  v.capacity, v.amenities, v.venue_type::text, v.technical_specs, v.cover_image_url,
  v.logo_url, v.email, v.phone, v.website, v.timezone,
  v.house_rules, v.load_in_info, v.parking_info, v.gallery_urls, v.is_partner,
  v.created_by, v.organization_id, v.is_active, v.description, v.metadata,
  v.created_at, v.updated_at
FROM venues v
WHERE NOT EXISTS (
  SELECT 1 FROM locations l WHERE l.id = v.id
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Migrate venue_spaces → locations (as children of venue locations)
-- ---------------------------------------------------------------------------
INSERT INTO locations (
  id, name, slug, location_type, parent_id,
  space_type, capacity_seated, capacity_standing, capacity_banquet, capacity_theater,
  amenities, technical_specs, dimensions, floor_plan_url,
  hourly_rate, daily_rate, currency, description,
  organization_id, is_active, created_at, updated_at
)
SELECT
  vs.id,
  vs.name,
  vs.slug,
  'room'::location_type,
  vs.venue_id,
  vs.space_type,
  vs.capacity_seated, vs.capacity_standing, vs.capacity_banquet, vs.capacity_theater,
  vs.amenities, vs.technical_specs, vs.dimensions, vs.floor_plan_url,
  vs.hourly_rate, vs.daily_rate, vs.currency, vs.description,
  v.organization_id,
  COALESCE(vs.is_active, true),
  vs.created_at,
  vs.updated_at
FROM venue_spaces vs
JOIN venues v ON v.id = vs.venue_id
WHERE NOT EXISTS (
  SELECT 1 FROM locations l WHERE l.id = vs.id
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Migrate venue_zones → locations (as children of venue locations)
-- ---------------------------------------------------------------------------
INSERT INTO locations (
  id, name, slug, location_type, parent_id,
  zone_type, capacity, access_level, code, color, icon,
  coordinates, amenities, description, notes, floor_plan_id,
  organization_id, is_active, created_by, created_at, updated_at
)
SELECT
  vz.id,
  vz.name,
  COALESCE(vz.code, LOWER(REGEXP_REPLACE(vz.name, '[^a-zA-Z0-9]+', '-', 'g'))),
  'zone'::location_type,
  vz.venue_id,
  vz.zone_type, vz.capacity, vz.access_level, vz.code, vz.color, vz.icon,
  vz.coordinates, vz.amenities, vz.description, vz.notes, vz.floor_plan_id,
  vz.organization_id,
  COALESCE(vz.is_active, true),
  vz.created_by,
  vz.created_at,
  vz.updated_at
FROM venue_zones vz
JOIN venues v ON v.id = vz.venue_id
WHERE NOT EXISTS (
  SELECT 1 FROM locations l WHERE l.id = vz.id
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. Deprecate inline address fields on locations
-- ---------------------------------------------------------------------------
ALTER TABLE locations RENAME COLUMN address TO legacy_address;
ALTER TABLE locations RENAME COLUMN city TO legacy_city;
ALTER TABLE locations RENAME COLUMN state TO legacy_state;
ALTER TABLE locations RENAME COLUMN country TO legacy_country;
ALTER TABLE locations RENAME COLUMN postal_code TO legacy_postal_code;
ALTER TABLE locations RENAME COLUMN latitude TO legacy_latitude;
ALTER TABLE locations RENAME COLUMN longitude TO legacy_longitude;

COMMENT ON COLUMN locations.legacy_address IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_city IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_state IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_country IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_postal_code IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_latitude IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN locations.legacy_longitude IS 'DEPRECATED: Use addresses table via address_id FK';

-- ---------------------------------------------------------------------------
-- 5b. Update sync_location_to_registry trigger to use address_id FK
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_location_to_registry() RETURNS trigger
    LANGUAGE plpgsql
AS $$
DECLARE
    v_addr RECORD;
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

    -- Resolve address from addresses table via FK
    IF NEW.address_id IS NOT NULL THEN
        SELECT street_line_1, city, state_province, country, postal_code, latitude, longitude
        INTO v_addr
        FROM addresses WHERE id = NEW.address_id;
    ELSE
        -- Fallback to legacy columns
        v_addr.street_line_1 := NEW.legacy_address;
        v_addr.city := NEW.legacy_city;
        v_addr.state_province := NEW.legacy_state;
        v_addr.country := NEW.legacy_country;
        v_addr.postal_code := NEW.legacy_postal_code;
        v_addr.latitude := NEW.legacy_latitude;
        v_addr.longitude := NEW.legacy_longitude;
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
        p_address := v_addr.street_line_1,
        p_city := v_addr.city,
        p_state := v_addr.state_province,
        p_country := v_addr.country,
        p_postal_code := v_addr.postal_code,
        p_latitude := v_addr.latitude,
        p_longitude := v_addr.longitude,
        p_contact_name := NEW.contact_name,
        p_contact_phone := NEW.contact_phone,
        p_contact_email := NEW.contact_email,
        p_is_active := NEW.is_active,
        p_visibility := 'team',
        p_metadata := NEW.metadata
    );

    RETURN NEW;
END;
$$;

-- Backfill: Create address records from existing inline data for locations without address_id
INSERT INTO addresses (id, street_line_1, city, state_province, postal_code, country, latitude, longitude, organization_id, created_at)
SELECT
  gen_random_uuid(),
  l.legacy_address,
  COALESCE(l.legacy_city, 'Unknown'),
  l.legacy_state,
  l.legacy_postal_code,
  l.legacy_country,
  l.legacy_latitude,
  l.legacy_longitude,
  l.organization_id,
  NOW()
FROM locations l
WHERE l.legacy_address IS NOT NULL
  AND l.address_id IS NULL;

-- Link the newly created addresses back
UPDATE locations l
SET address_id = a.id
FROM addresses a
WHERE a.organization_id = l.organization_id
  AND a.street_line_1 = l.legacy_address
  AND COALESCE(a.city, '') = COALESCE(l.legacy_city, '')
  AND l.address_id IS NULL;

-- ---------------------------------------------------------------------------
-- 6. Rewire FKs that pointed to venues → locations
-- ---------------------------------------------------------------------------
ALTER TABLE event_venues DROP CONSTRAINT IF EXISTS event_venues_venue_id_fkey;
ALTER TABLE venue_availability DROP CONSTRAINT IF EXISTS venue_availability_venue_id_fkey;
ALTER TABLE venue_crew_requirements DROP CONSTRAINT IF EXISTS venue_crew_requirements_venue_id_fkey;
ALTER TABLE venue_geofences DROP CONSTRAINT IF EXISTS venue_geofences_venue_id_fkey;
ALTER TABLE venue_holds DROP CONSTRAINT IF EXISTS venue_holds_venue_id_fkey;
ALTER TABLE venue_specs DROP CONSTRAINT IF EXISTS venue_specs_venue_id_fkey;

ALTER TABLE event_venues ADD CONSTRAINT event_venues_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE venue_availability ADD CONSTRAINT venue_availability_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE venue_crew_requirements ADD CONSTRAINT venue_crew_requirements_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE venue_geofences ADD CONSTRAINT venue_geofences_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE venue_holds ADD CONSTRAINT venue_holds_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE venue_specs ADD CONSTRAINT venue_specs_venue_id_fkey
  FOREIGN KEY (venue_id) REFERENCES locations(id) ON DELETE CASCADE;

-- Drop old FKs on venue_spaces and venue_zones (data now in locations)
ALTER TABLE venue_spaces DROP CONSTRAINT IF EXISTS venue_spaces_venue_id_fkey;
ALTER TABLE venue_zones DROP CONSTRAINT IF EXISTS venue_zones_venue_id_fkey;

-- ---------------------------------------------------------------------------
-- 7. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_locations_location_type ON locations(location_type);
CREATE INDEX IF NOT EXISTS idx_locations_venue_type ON locations(venue_type) WHERE venue_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON locations(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_locations_is_partner ON locations(is_partner) WHERE is_partner = true;

COMMIT;
