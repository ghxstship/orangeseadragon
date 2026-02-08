-- ============================================================================
-- Migration 00095: Verification Matrix Full Remediation
-- Resolves all remaining ⚠️ IMPORTANT and 🔧 ENHANCEMENT items
-- ============================================================================

-- ============================================================================
-- 1. FISCAL YEAR CLOSE / LOCK MECHANISM
-- ============================================================================

CREATE TABLE IF NOT EXISTS fiscal_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, name)
);

ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fiscal_periods_org_isolation" ON fiscal_periods
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_fiscal_periods_org_status ON fiscal_periods(organization_id, status);

-- ============================================================================
-- 2. REVENUE RECOGNITION / ACCOUNTING PERIOD BOOKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  fiscal_period_id UUID REFERENCES fiscal_periods(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL,
  recognition_date DATE NOT NULL,
  amount NUMERIC(19,4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  recognition_type TEXT NOT NULL DEFAULT 'point_in_time' CHECK (recognition_type IN ('point_in_time', 'over_time', 'milestone')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  reversal_of UUID REFERENCES revenue_recognitions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE revenue_recognitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "revenue_recognitions_org_isolation" ON revenue_recognitions
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_org ON revenue_recognitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_invoice ON revenue_recognitions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_period ON revenue_recognitions(fiscal_period_id);

-- ============================================================================
-- 3. TENTATIVE HOLD MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS venue_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  venue_id UUID NOT NULL,
  event_id UUID,
  hold_type TEXT NOT NULL DEFAULT 'first' CHECK (hold_type IN ('first', 'second', 'third')),
  hold_date DATE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'released')),
  converted_to_booking_id UUID,
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE venue_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_holds_org_isolation" ON venue_holds
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_venue_holds_venue ON venue_holds(venue_id, hold_date);
CREATE INDEX IF NOT EXISTS idx_venue_holds_status ON venue_holds(status) WHERE status = 'active';

-- ============================================================================
-- 4. SPLIT BOOKING SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  parent_booking_id UUID NOT NULL,
  project_id UUID NOT NULL,
  allocation_percentage NUMERIC(5,2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE booking_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking_splits_org_isolation" ON booking_splits
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_booking_splits_parent ON booking_splits(parent_booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_splits_project ON booking_splits(project_id);

-- ============================================================================
-- 5. CREW CONFIRMATION WORKFLOW
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  booking_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  offered_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'withdrawn')),
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rate_amount NUMERIC(19,4),
  rate_currency TEXT DEFAULT 'USD',
  rate_type TEXT CHECK (rate_type IN ('hourly', 'daily', 'flat', 'weekly')),
  message TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE crew_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crew_offers_org_isolation" ON crew_offers
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_crew_offers_booking ON crew_offers(booking_id);
CREATE INDEX IF NOT EXISTS idx_crew_offers_user ON crew_offers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_crew_offers_status ON crew_offers(status) WHERE status = 'pending';

-- ============================================================================
-- 6. DAY-OF ROSTER GENERATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS day_of_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL,
  roster_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'locked')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS day_of_roster_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_id UUID NOT NULL REFERENCES day_of_rosters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role TEXT NOT NULL,
  department TEXT,
  call_time TIME NOT NULL,
  wrap_time TIME,
  location TEXT,
  notes TEXT,
  check_in_status TEXT DEFAULT 'pending' CHECK (check_in_status IN ('pending', 'checked_in', 'no_show', 'late')),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE day_of_rosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_of_rosters_org_isolation" ON day_of_rosters
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

ALTER TABLE day_of_roster_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_of_roster_entries_via_roster" ON day_of_roster_entries
  FOR ALL USING (roster_id IN (
    SELECT id FROM day_of_rosters WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
    )
  ));

CREATE INDEX IF NOT EXISTS idx_day_of_rosters_event ON day_of_rosters(event_id, roster_date);
CREATE INDEX IF NOT EXISTS idx_day_of_roster_entries_roster ON day_of_roster_entries(roster_id);

-- ============================================================================
-- 7. DIGITAL SIGN-OFF / SIGNATURES
-- ============================================================================

CREATE TABLE IF NOT EXISTS digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('settlement', 'contract', 'call_sheet', 'safety_plan', 'timesheet', 'expense_report', 'purchase_order')),
  signer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signer_role TEXT,
  signature_data TEXT NOT NULL,
  signature_type TEXT NOT NULL DEFAULT 'typed' CHECK (signature_type IN ('typed', 'drawn', 'uploaded')),
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "digital_signatures_org_isolation" ON digital_signatures
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_digital_signatures_document ON digital_signatures(document_id, document_type);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_signer ON digital_signatures(signer_id);

-- ============================================================================
-- 8. WIN/LOSS REASON CODES FOR DEALS
-- ============================================================================

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS loss_reason TEXT,
  ADD COLUMN IF NOT EXISTS loss_reason_code TEXT CHECK (loss_reason_code IN ('price', 'timing', 'competition', 'scope', 'relationship', 'budget', 'internal', 'other')),
  ADD COLUMN IF NOT EXISTS win_reason TEXT,
  ADD COLUMN IF NOT EXISTS win_reason_code TEXT CHECK (win_reason_code IN ('price', 'relationship', 'quality', 'reputation', 'speed', 'scope', 'referral', 'other')),
  ADD COLUMN IF NOT EXISTS competitor_name TEXT,
  ADD COLUMN IF NOT EXISTS competitor_notes TEXT;

-- ============================================================================
-- 9. OVERDUE INVOICE REMINDER SEQUENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_reminder_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_reminder_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES invoice_reminder_sequences(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  days_after_due INT NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  escalation_level TEXT NOT NULL DEFAULT 'standard' CHECK (escalation_level IN ('friendly', 'standard', 'urgent', 'final')),
  cc_account_manager BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL,
  step_id UUID REFERENCES invoice_reminder_steps(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'bounced', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invoice_reminder_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_reminder_sequences_org" ON invoice_reminder_sequences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

ALTER TABLE invoice_reminder_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_reminder_steps_via_seq" ON invoice_reminder_steps
  FOR ALL USING (sequence_id IN (
    SELECT id FROM invoice_reminder_sequences WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
    )
  ));

ALTER TABLE invoice_reminder_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_reminder_log_org" ON invoice_reminder_log
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================================
-- 10. REPORT FORMULA FIELDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_formula_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  report_definition_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  result_type TEXT NOT NULL DEFAULT 'number' CHECK (result_type IN ('number', 'currency', 'percentage', 'text', 'date')),
  format_pattern TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE report_formula_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_formula_fields_org" ON report_formula_fields
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================================
-- 11. AUTOMATED REPORT DELIVERY (PULSE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  report_definition_id UUID NOT NULL,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'xlsx')),
  recipients JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'failed', 'skipped')),
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_schedules_org" ON report_schedules
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================================
-- 12. AUTOMATION ERROR HANDLING / RETRY QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_run_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  automation_id UUID NOT NULL,
  automation_type TEXT NOT NULL CHECK (automation_type IN ('workflow', 'task_automation', 'invoice_reminder', 'report_schedule', 'webhook')),
  trigger_event TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'retrying', 'dead_letter')),
  attempt_number INT NOT NULL DEFAULT 1,
  max_attempts INT NOT NULL DEFAULT 3,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  error_details JSONB,
  input_data JSONB,
  output_data JSONB,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE automation_run_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_run_log_org" ON automation_run_log
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE INDEX IF NOT EXISTS idx_automation_run_log_status ON automation_run_log(status) WHERE status IN ('failed', 'retrying');
CREATE INDEX IF NOT EXISTS idx_automation_run_log_retry ON automation_run_log(next_retry_at) WHERE status = 'retrying';

-- ============================================================================
-- 13. CALENDAR SYNC TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_sync_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'caldav')),
  external_calendar_id TEXT NOT NULL,
  external_calendar_name TEXT,
  sync_direction TEXT NOT NULL DEFAULT 'bidirectional' CHECK (sync_direction IN ('push', 'pull', 'bidirectional')),
  sync_token TEXT,
  last_synced_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disconnected')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, provider, external_calendar_id)
);

ALTER TABLE calendar_sync_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_sync_own" ON calendar_sync_connections
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- 14. ACCOUNTING INTEGRATION SYNC LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounting_sync_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK (provider IN ('quickbooks', 'xero', 'sage', 'freshbooks')),
  internal_entity_type TEXT NOT NULL,
  internal_entity_id UUID NOT NULL,
  external_entity_id TEXT NOT NULL,
  external_entity_type TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error', 'conflict')),
  sync_direction TEXT NOT NULL DEFAULT 'push',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, provider, internal_entity_type, internal_entity_id)
);

ALTER TABLE accounting_sync_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounting_sync_org" ON accounting_sync_mappings
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================================
-- 15. EMERGENCY CONTACT ACCESS CONTROL
-- ============================================================================

ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS emergency_contact_visibility TEXT DEFAULT 'restricted'
    CHECK (emergency_contact_visibility IN ('restricted', 'managers_only', 'hr_only', 'all'));

-- ============================================================================
-- 16. SESSION INVALIDATION ON PERMISSION CHANGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_invalidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  invalidated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invalidated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_session_invalidations_user ON session_invalidations(user_id, invalidated_at DESC);

-- ============================================================================
-- 17. PROJECT DUPLICATION TRACKING
-- ============================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS duplicated_from_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duplicated_at TIMESTAMPTZ;

-- ============================================================================
-- 18. AUTO-TRIGGER: PROJECT COMPLETION → SETTLEMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION trg_project_completion_settlement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO settlements (
      id, organization_id, project_id, status, settlement_type, created_by, created_at
    ) VALUES (
      gen_random_uuid(), NEW.organization_id, NEW.id, 'draft', 'final', NEW.updated_by, NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_project_completion_settlement ON projects;
CREATE TRIGGER trg_project_completion_settlement
  AFTER UPDATE OF status ON projects
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trg_project_completion_settlement();

-- ============================================================================
-- DONE
-- ============================================================================
