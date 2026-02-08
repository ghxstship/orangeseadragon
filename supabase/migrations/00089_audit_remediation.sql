-- ============================================================================
-- Migration 00089: Post-Implementation Audit Remediation
-- ============================================================================
-- Fixes identified in VERIFICATION_MATRIX.md Pass 1:
--   D-001: Add deleted_at soft delete columns to Phase 2-6 tables
--   D-002: Create audit history tables for financial mutation tables
--   D-004/D-005/D-006: Fix monetary precision to NUMERIC(19,4)
--   D-003: Change CASCADE to RESTRICT on media_assets.organization_id
--   D-007: Add created_by where missing
--   D-008: Change CASCADE to RESTRICT on media_assets
-- ============================================================================

BEGIN;

-- ============================================================================
-- D-001: Add deleted_at soft delete columns
-- ============================================================================

ALTER TABLE venue_crew_requirements
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE crew_gig_ratings
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE project_post_mortems
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE lessons_learned
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE vendor_payment_schedules
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE rfp_responses
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE emergency_alerts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE transit_time_cache
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE invoice_deliveries
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE invoice_automation_rules
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE booking_conflicts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial indexes for soft delete filtering (only index non-deleted rows)
CREATE INDEX IF NOT EXISTS idx_venue_crew_requirements_active
  ON venue_crew_requirements (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crew_gig_ratings_active
  ON crew_gig_ratings (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_project_post_mortems_active
  ON project_post_mortems (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_learned_active
  ON lessons_learned (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vendor_payment_schedules_active
  ON vendor_payment_schedules (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rfp_responses_active
  ON rfp_responses (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_active
  ON emergency_alerts (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_media_assets_active
  ON media_assets (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transit_time_cache_active
  ON transit_time_cache (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_active
  ON invoice_deliveries (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_automation_rules_active
  ON invoice_automation_rules (organization_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_booking_conflicts_active
  ON booking_conflicts (organization_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- D-004/D-005/D-006: Fix monetary precision to NUMERIC(19,4)
-- ============================================================================

ALTER TABLE vendor_payment_schedules
  ALTER COLUMN amount TYPE NUMERIC(19,4);

ALTER TABLE rfp_responses
  ALTER COLUMN proposed_amount TYPE NUMERIC(19,4);

ALTER TABLE venue_crew_requirements
  ALTER COLUMN venue_day_rate_override TYPE NUMERIC(19,4);

-- ============================================================================
-- D-002: Create audit history tables for financial mutation tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_payment_schedules_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_payment_schedule_id UUID NOT NULL REFERENCES vendor_payment_schedules(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_automation_rules_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_automation_rule_id UUID NOT NULL REFERENCES invoice_automation_rules(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_scenarios_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for history tables
CREATE INDEX IF NOT EXISTS idx_vps_history_schedule
  ON vendor_payment_schedules_history (vendor_payment_schedule_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_iar_history_rule
  ON invoice_automation_rules_history (invoice_automation_rule_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_bs_history_scenario
  ON budget_scenarios_history (budget_scenario_id, changed_at DESC);

-- RLS on history tables (read-only for org members, write via triggers only)
ALTER TABLE vendor_payment_schedules_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_automation_rules_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_scenarios_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read vendor payment schedule history"
  ON vendor_payment_schedules_history FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org members can read invoice automation rule history"
  ON invoice_automation_rules_history FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org members can read budget scenario history"
  ON budget_scenarios_history FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Audit triggers for financial tables
CREATE OR REPLACE FUNCTION trg_audit_vendor_payment_schedules()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO vendor_payment_schedules_history
      (vendor_payment_schedule_id, organization_id, changed_by, change_type, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO vendor_payment_schedules_history
      (vendor_payment_schedule_id, organization_id, changed_by, change_type, old_values, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'updated', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO vendor_payment_schedules_history
      (vendor_payment_schedule_id, organization_id, changed_by, change_type, old_values)
    VALUES
      (OLD.id, OLD.organization_id, auth.uid(), 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vendor_payment_schedules_audit
  AFTER INSERT OR UPDATE OR DELETE ON vendor_payment_schedules
  FOR EACH ROW EXECUTE FUNCTION trg_audit_vendor_payment_schedules();

CREATE OR REPLACE FUNCTION trg_audit_invoice_automation_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO invoice_automation_rules_history
      (invoice_automation_rule_id, organization_id, changed_by, change_type, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO invoice_automation_rules_history
      (invoice_automation_rule_id, organization_id, changed_by, change_type, old_values, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'updated', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO invoice_automation_rules_history
      (invoice_automation_rule_id, organization_id, changed_by, change_type, old_values)
    VALUES
      (OLD.id, OLD.organization_id, auth.uid(), 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_invoice_automation_rules_audit
  AFTER INSERT OR UPDATE OR DELETE ON invoice_automation_rules
  FOR EACH ROW EXECUTE FUNCTION trg_audit_invoice_automation_rules();

CREATE OR REPLACE FUNCTION trg_audit_budget_scenarios()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO budget_scenarios_history
      (budget_scenario_id, organization_id, changed_by, change_type, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'created', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO budget_scenarios_history
      (budget_scenario_id, organization_id, changed_by, change_type, old_values, new_values)
    VALUES
      (NEW.id, NEW.organization_id, auth.uid(), 'updated', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO budget_scenarios_history
      (budget_scenario_id, organization_id, changed_by, change_type, old_values)
    VALUES
      (OLD.id, OLD.organization_id, auth.uid(), 'deleted', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_budget_scenarios_audit
  AFTER INSERT OR UPDATE OR DELETE ON budget_scenarios
  FOR EACH ROW EXECUTE FUNCTION trg_audit_budget_scenarios();

-- ============================================================================
-- D-007: Add created_by where missing
-- ============================================================================

ALTER TABLE transit_time_cache
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE booking_conflicts
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE emergency_alert_acknowledgments
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================================
-- D-008: Change CASCADE to RESTRICT on media_assets.organization_id
-- ============================================================================

-- Drop existing FK and recreate with RESTRICT
DO $$
BEGIN
  -- media_assets organization_id FK
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'media_assets'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%organization_id%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE media_assets DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'media_assets'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%organization_id%'
      LIMIT 1
    );
  END IF;
END $$;

ALTER TABLE media_assets
  ADD CONSTRAINT media_assets_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;

COMMIT;
