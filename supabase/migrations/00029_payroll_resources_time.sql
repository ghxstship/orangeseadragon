-- Migration: Payroll, Resources, and Time Tracking Tables
-- Created: 2026-01-27
-- Description: Tables for payroll processing, project resource allocation, and time tracking

-- ============================================================================
-- PAYROLL
-- ============================================================================

CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  payroll_type TEXT NOT NULL CHECK (payroll_type IN ('regular', 'bonus', 'commission', 'off_cycle')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'pending_approval', 'approved', 'paid', 'cancelled')),
  employee_count INT DEFAULT 0,
  gross_pay DECIMAL(14,2) DEFAULT 0,
  total_deductions DECIMAL(14,2) DEFAULT 0,
  net_pay DECIMAL(14,2) DEFAULT 0,
  approved_by_id UUID REFERENCES contacts(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(org_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);

CREATE TABLE IF NOT EXISTS payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES contacts(id),
  gross_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_withholding DECIMAL(12,2) DEFAULT 0,
  benefits_deduction DECIMAL(12,2) DEFAULT 0,
  other_deductions DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) NOT NULL DEFAULT 0,
  hours_worked DECIMAL(8,2),
  overtime_hours DECIMAL(8,2),
  payment_method TEXT CHECK (payment_method IN ('direct_deposit', 'check', 'cash')),
  bank_account_last4 TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);

-- ============================================================================
-- PROJECT RESOURCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  role TEXT NOT NULL,
  allocation_percent INT NOT NULL DEFAULT 100 CHECK (allocation_percent >= 0 AND allocation_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE,
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'on_hold', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_resources_project ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_contact ON project_resources(contact_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_org ON project_resources(org_id);

-- ============================================================================
-- TIME TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  resource_id UUID REFERENCES project_resources(id),
  date DATE NOT NULL,
  hours DECIMAL(6,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description TEXT NOT NULL,
  billable BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'invoiced')),
  approved_by_id UUID REFERENCES contacts(id),
  approved_at TIMESTAMPTZ,
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(org_id);

-- Weekly time summary view
CREATE OR REPLACE VIEW time_entries_weekly AS
SELECT 
  org_id,
  user_id,
  project_id,
  DATE_TRUNC('week', date) AS week_start,
  SUM(hours) AS total_hours,
  SUM(CASE WHEN billable THEN hours ELSE 0 END) AS billable_hours,
  COUNT(*) AS entry_count
FROM time_entries
GROUP BY org_id, user_id, project_id, DATE_TRUNC('week', date);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Payroll Runs
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payroll_runs_org_read" ON payroll_runs;
CREATE POLICY "payroll_runs_org_read" ON payroll_runs FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "payroll_runs_org_insert" ON payroll_runs;
CREATE POLICY "payroll_runs_org_insert" ON payroll_runs FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "payroll_runs_org_update" ON payroll_runs;
CREATE POLICY "payroll_runs_org_update" ON payroll_runs FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "payroll_runs_org_delete" ON payroll_runs;
CREATE POLICY "payroll_runs_org_delete" ON payroll_runs FOR DELETE USING (is_organization_member(org_id));

-- Project Resources
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_resources_org_read" ON project_resources;
CREATE POLICY "project_resources_org_read" ON project_resources FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "project_resources_org_insert" ON project_resources;
CREATE POLICY "project_resources_org_insert" ON project_resources FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "project_resources_org_update" ON project_resources;
CREATE POLICY "project_resources_org_update" ON project_resources FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "project_resources_org_delete" ON project_resources;
CREATE POLICY "project_resources_org_delete" ON project_resources FOR DELETE USING (is_organization_member(org_id));

-- Time Entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "time_entries_org_read" ON time_entries;
CREATE POLICY "time_entries_org_read" ON time_entries FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "time_entries_org_insert" ON time_entries;
CREATE POLICY "time_entries_org_insert" ON time_entries FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "time_entries_org_update" ON time_entries;
CREATE POLICY "time_entries_org_update" ON time_entries FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "time_entries_org_delete" ON time_entries;
CREATE POLICY "time_entries_org_delete" ON time_entries FOR DELETE USING (is_organization_member(org_id));

COMMIT;
