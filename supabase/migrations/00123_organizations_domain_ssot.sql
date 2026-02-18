-- ============================================================================
-- Migration 00123: Organizations Domain SSOT — Enforce 3NF Across Org Entities
-- ============================================================================
-- Canonical model:
--   organizations  = SSOT for tenants (the platform customer)
--   companies      = SSOT for all external business entities (CRM)
--   departments    = SSOT for internal org structure
--   teams          = Cross-functional working groups (linked to departments)
--   addresses      = SSOT for all physical addresses (3NF)
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. organizations.address_id — Canonical address reference
-- ---------------------------------------------------------------------------
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_id UUID
  REFERENCES addresses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_address_id ON organizations(address_id);

-- Rename inline address fields to legacy_*
ALTER TABLE organizations RENAME COLUMN address TO legacy_address;
ALTER TABLE organizations RENAME COLUMN city TO legacy_city;
ALTER TABLE organizations RENAME COLUMN state TO legacy_state;
ALTER TABLE organizations RENAME COLUMN country TO legacy_country;
ALTER TABLE organizations RENAME COLUMN postal_code TO legacy_postal_code;

COMMENT ON COLUMN organizations.legacy_address IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN organizations.legacy_city IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN organizations.legacy_state IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN organizations.legacy_country IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN organizations.legacy_postal_code IS 'DEPRECATED: Use addresses table via address_id FK';

-- Backfill: Create address records from existing inline data
INSERT INTO addresses (id, street_line_1, city, state_province, postal_code, country, organization_id, created_at)
SELECT
  gen_random_uuid(),
  o.legacy_address,
  COALESCE(o.legacy_city, 'Unknown'),
  o.legacy_state,
  o.legacy_postal_code,
  o.legacy_country,
  o.id,
  NOW()
FROM organizations o
WHERE o.legacy_address IS NOT NULL
  AND o.address_id IS NULL;

-- Link the newly created addresses back
UPDATE organizations o
SET address_id = a.id
FROM addresses a
WHERE a.organization_id = o.id
  AND a.street_line_1 = o.legacy_address
  AND o.address_id IS NULL;

-- ---------------------------------------------------------------------------
-- 2. companies — Deprecate inline address fields (address_id already exists)
-- ---------------------------------------------------------------------------
ALTER TABLE companies RENAME COLUMN address TO legacy_address;
ALTER TABLE companies RENAME COLUMN city TO legacy_city;
ALTER TABLE companies RENAME COLUMN state TO legacy_state;
ALTER TABLE companies RENAME COLUMN country TO legacy_country;
ALTER TABLE companies RENAME COLUMN postal_code TO legacy_postal_code;

COMMENT ON COLUMN companies.legacy_address IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN companies.legacy_city IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN companies.legacy_state IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN companies.legacy_country IS 'DEPRECATED: Use addresses table via address_id FK';
COMMENT ON COLUMN companies.legacy_postal_code IS 'DEPRECATED: Use addresses table via address_id FK';

-- Backfill: Create address records from existing inline data for companies without address_id
INSERT INTO addresses (id, street_line_1, city, state_province, postal_code, country, organization_id, created_at)
SELECT
  gen_random_uuid(),
  c.legacy_address,
  COALESCE(c.legacy_city, 'Unknown'),
  c.legacy_state,
  c.legacy_postal_code,
  c.legacy_country,
  c.organization_id,
  NOW()
FROM companies c
WHERE c.legacy_address IS NOT NULL
  AND c.address_id IS NULL;

-- Link the newly created addresses back
UPDATE companies c
SET address_id = a.id
FROM addresses a
WHERE a.organization_id = c.organization_id
  AND a.street_line_1 = c.legacy_address
  AND c.address_id IS NULL;

-- ---------------------------------------------------------------------------
-- 3. teams.department_id — Link teams to departments
-- ---------------------------------------------------------------------------
ALTER TABLE teams ADD COLUMN IF NOT EXISTS department_id UUID
  REFERENCES departments(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_teams_department_id ON teams(department_id);

COMMENT ON COLUMN teams.department_id IS 'Links a team to its parent department for org structure hierarchy';

COMMIT;
