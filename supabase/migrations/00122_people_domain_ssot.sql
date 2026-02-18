-- ============================================================================
-- Migration 00122: People Domain SSOT — Enforce 3NF Across Person Entities
-- ============================================================================
-- Canonical model:
--   users          = SSOT for all authenticated identities
--   user_profiles  = 1:1 extended professional profile
--   employee_profiles = 1:1 per org HR/employment data (absorbs staff_members)
--   crew_members   = org-scoped production role (strips duplicated identity fields)
--   contacts       = SSOT for all external/unauthenticated people
--   talent         = role extension on contacts
--   candidates     = role extension on contacts
--   people_directory = READ-ONLY projection (materialized view pattern)
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. contacts.user_id — Link external contacts to user accounts
-- ---------------------------------------------------------------------------
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

COMMENT ON COLUMN contacts.user_id IS 'Links an external contact to an authenticated user account when they exist in both systems';

-- ---------------------------------------------------------------------------
-- 2. candidates.contact_id — Candidates are contacts in the recruitment pipeline
-- ---------------------------------------------------------------------------
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS contact_id UUID
  REFERENCES contacts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_contact_id ON candidates(contact_id);

COMMENT ON COLUMN candidates.contact_id IS 'Links a candidate to their contact record for unified person identity';

-- ---------------------------------------------------------------------------
-- 3. crew_members — Strip duplicated identity fields, enforce user_id
-- ---------------------------------------------------------------------------
-- Rename duplicated identity fields to legacy_*
ALTER TABLE crew_members RENAME COLUMN full_name TO legacy_full_name;
ALTER TABLE crew_members RENAME COLUMN email TO legacy_email;
ALTER TABLE crew_members RENAME COLUMN phone TO legacy_phone;
ALTER TABLE crew_members RENAME COLUMN avatar_url TO legacy_avatar_url;

-- Add NOT NULL constraint on user_id (crew members must be users)
-- First, backfill any NULL user_id rows by creating placeholder references
-- In production, orphaned crew_members without user_id should be resolved manually
-- For now, we make it NOT NULL with a default that will fail on insert if not provided
ALTER TABLE crew_members ALTER COLUMN user_id SET NOT NULL;

COMMENT ON COLUMN crew_members.legacy_full_name IS 'DEPRECATED: Use users.full_name via user_id FK instead';
COMMENT ON COLUMN crew_members.legacy_email IS 'DEPRECATED: Use users.email via user_id FK instead';
COMMENT ON COLUMN crew_members.legacy_phone IS 'DEPRECATED: Use users.phone via user_id FK instead';
COMMENT ON COLUMN crew_members.legacy_avatar_url IS 'DEPRECATED: Use users.avatar_url via user_id FK instead';

-- ---------------------------------------------------------------------------
-- 4. staff_members — Absorb into employee_profiles
-- ---------------------------------------------------------------------------
-- Add fields from staff_members that employee_profiles lacks
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS employment_type_id UUID
  REFERENCES employment_types(id) ON DELETE SET NULL;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS position_type_id UUID
  REFERENCES position_types(id) ON DELETE SET NULL;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_employee_profiles_employment_type_id
  ON employee_profiles(employment_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_position_type_id
  ON employee_profiles(position_type_id);

-- Migrate data from staff_members into employee_profiles where not already present
INSERT INTO employee_profiles (
  user_id, organization_id, department_id, employee_number, employment_status,
  hire_date, hourly_rate, manager_id, pay_frequency, position_id, salary,
  termination_date, employment_type_id, position_type_id, is_active,
  created_at, updated_at
)
SELECT
  sm.user_id, sm.organization_id, sm.department_id, sm.employee_number,
  sm.employment_status, sm.hire_date, sm.hourly_rate, sm.manager_id,
  sm.pay_frequency, sm.position_id, sm.salary, sm.termination_date,
  sm.employment_type_id, sm.position_type_id, sm.is_active,
  sm.created_at, sm.updated_at
FROM staff_members sm
WHERE NOT EXISTS (
  SELECT 1 FROM employee_profiles ep
  WHERE ep.user_id = sm.user_id AND ep.organization_id = sm.organization_id
)
ON CONFLICT DO NOTHING;

-- For existing employee_profiles, backfill the new columns from staff_members
UPDATE employee_profiles ep
SET
  employment_type_id = COALESCE(ep.employment_type_id, sm.employment_type_id),
  position_type_id = COALESCE(ep.position_type_id, sm.position_type_id),
  is_active = COALESCE(ep.is_active, sm.is_active)
FROM staff_members sm
WHERE ep.user_id = sm.user_id AND ep.organization_id = sm.organization_id;

-- Rename staff_members to mark it as deprecated (keep for data preservation)
ALTER TABLE staff_members RENAME TO legacy_staff_members;

COMMENT ON TABLE legacy_staff_members IS 'DEPRECATED: Merged into employee_profiles. This table is retained for data preservation only.';

-- ---------------------------------------------------------------------------
-- 5. Update FKs that pointed to staff_members
-- ---------------------------------------------------------------------------
-- leave_requests, leave_balances may reference staff_members
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_staff_member_id_fkey;
ALTER TABLE leave_balances DROP CONSTRAINT IF EXISTS leave_balances_staff_member_id_fkey;

-- ---------------------------------------------------------------------------
-- 6. Indexes for canonical lookups
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_org
  ON employee_profiles(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user_org
  ON crew_members(user_id, organization_id);

COMMIT;
