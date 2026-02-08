-- Migration: 00094_deep_audit_remediation.sql
-- Purpose: Address findings from deep data layer re-audit
-- Scope: Financial table gaps, missing updated_at on mutable tables, missing currency fields
-- Severity: CRITICAL (financial data integrity) + IMPORTANT (audit trail)

-- ============================================================
-- 1. FINANCIAL TABLES: Add missing currency fields
-- Per spec: All monetary tables MUST have currency for multi-currency support
-- ============================================================

ALTER TABLE billing_invoice_items
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE budget_categories
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE budget_line_items
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE budget_vs_actual
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE event_budgets
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE invoice_line_items
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE payment_attempts
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE payment_methods
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE project_budgets
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE rate_card_items
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE rate_cards
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE rate_cards_unified
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE recurring_invoices
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE service_rate_card_items
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE settlements
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE billing_invoices
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE workforce_rate_card_items
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- ============================================================
-- 2. MUTABLE TABLES: Add missing updated_at
-- Per spec: All mutable (non-append-only) tables MUST have updated_at
-- Only adding to tables that are clearly mutable (have editable fields)
-- ============================================================

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE asset_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE asset_kit_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE blackout_dates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE connections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE deal_team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE discussion_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE document_shares ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE entity_tags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE event_budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE event_venues ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE export_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE import_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE journal_entry_lines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE networking_matches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE offboarding_instance_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE offboarding_template_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE onboarding_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE package_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE partner_contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE performance_goals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE permission_definitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE project_budgets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE pull_list_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE run_of_show_elements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE sequence_enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE service_rate_card_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE session_talent ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE session_tracks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE session_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE subscriber_lists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE task_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE task_dependencies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE thread_participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE training_enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE vendor_contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 3. AUTO-UPDATE TRIGGERS for updated_at
-- Per spec: updated_at must auto-update on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables that received updated_at in this migration
DO $$
DECLARE
  tbl TEXT;
  tbl_list TEXT[] := ARRAY[
    'billing_invoice_items', 'budget_vs_actual', 'event_budgets', 'payment_attempts',
    'project_budgets', 'service_rate_card_items', 'api_keys', 'asset_documents',
    'asset_kit_items', 'blackout_dates', 'connections', 'deal_team_members',
    'direct_messages', 'discussion_subscriptions', 'document_shares', 'email_sends',
    'entity_tags', 'event_venues', 'export_jobs', 'goods_receipts',
    'goods_receipt_items', 'import_jobs', 'journal_entries', 'journal_entry_lines',
    'networking_matches', 'notifications', 'offboarding_instance_items',
    'offboarding_template_items', 'onboarding_items', 'package_items',
    'partner_contacts', 'payroll_items', 'performance_goals', 'permission_definitions',
    'project_members', 'pull_list_items', 'run_of_show_elements',
    'sequence_enrollments', 'sequence_steps', 'session_talent', 'session_tracks',
    'session_types', 'subscriber_lists', 'subscribers', 'task_assignments',
    'task_dependencies', 'thread_participants', 'training_enrollments',
    'user_sessions', 'vendor_contacts'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbl_list LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I; CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 4. FINANCIAL AUDIT HISTORY TABLES
-- Per spec: Financial tables require immutable history for compliance
-- Creating history tables for the 5 most critical financial tables
-- that were missing them
-- ============================================================

CREATE TABLE IF NOT EXISTS billing_invoice_items_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_invoice_item_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB
);

CREATE TABLE IF NOT EXISTS budget_line_items_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_line_item_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB
);

CREATE TABLE IF NOT EXISTS payment_attempts_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_attempt_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB
);

CREATE TABLE IF NOT EXISTS settlements_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB
);

CREATE TABLE IF NOT EXISTS recurring_invoices_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_invoice_id UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB
);

-- History triggers
CREATE OR REPLACE FUNCTION log_financial_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    EXECUTE format(
      'INSERT INTO %I (changed_by, change_type, new_data, %I) VALUES ($1, $2, $3, $4)',
      TG_TABLE_NAME || '_history',
      TG_TABLE_NAME || '_id'  -- e.g. billing_invoice_item_id
    ) USING auth.uid(), 'INSERT', to_jsonb(NEW), NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    EXECUTE format(
      'INSERT INTO %I (changed_by, change_type, old_data, new_data, %I) VALUES ($1, $2, $3, $4, $5)',
      TG_TABLE_NAME || '_history',
      TG_TABLE_NAME || '_id'
    ) USING auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    EXECUTE format(
      'INSERT INTO %I (changed_by, change_type, old_data, %I) VALUES ($1, $2, $3, $4)',
      TG_TABLE_NAME || '_history',
      TG_TABLE_NAME || '_id'
    ) USING auth.uid(), 'DELETE', to_jsonb(OLD), OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply history triggers to financial tables
DO $$
DECLARE
  tbl TEXT;
  tbl_list TEXT[] := ARRAY[
    'billing_invoice_items', 'budget_line_items', 'payment_attempts',
    'settlements', 'recurring_invoices'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbl_list LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_history ON %I; CREATE TRIGGER trg_%s_history AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION log_financial_history();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 5. RLS ON NEW HISTORY TABLES
-- ============================================================

ALTER TABLE billing_invoice_items_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices_history ENABLE ROW LEVEL SECURITY;

-- History tables are read-only for authenticated users (writes via trigger only)
CREATE POLICY "History tables are read-only for authenticated users"
  ON billing_invoice_items_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "History tables are read-only for authenticated users"
  ON budget_line_items_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "History tables are read-only for authenticated users"
  ON payment_attempts_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "History tables are read-only for authenticated users"
  ON settlements_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "History tables are read-only for authenticated users"
  ON recurring_invoices_history FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- 6. INDEXES on new columns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_billing_invoice_items_currency ON billing_invoice_items(currency);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_currency ON budget_line_items(currency);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_currency ON invoice_line_items(currency);
CREATE INDEX IF NOT EXISTS idx_settlements_currency ON settlements(currency);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_currency ON recurring_invoices(currency);

-- History table indexes for lookups
CREATE INDEX IF NOT EXISTS idx_billing_invoice_items_history_item ON billing_invoice_items_history(billing_invoice_item_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_history_item ON budget_line_items_history(budget_line_item_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_history_item ON payment_attempts_history(payment_attempt_id);
CREATE INDEX IF NOT EXISTS idx_settlements_history_item ON settlements_history(settlement_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_history_item ON recurring_invoices_history(recurring_invoice_id);
