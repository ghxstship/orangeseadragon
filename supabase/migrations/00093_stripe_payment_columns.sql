-- Migration: Stripe payment integration columns
-- Required by: src/app/api/payments/webhook/route.ts

-- Add Stripe-specific columns to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Add Stripe-specific columns to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create recurring_invoices table for subscription billing
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_template_id UUID REFERENCES invoices(id),
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_run_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  invoices_generated_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_invoices_org ON recurring_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_stripe ON recurring_invoices(stripe_subscription_id);

ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recurring_invoices_org_access" ON recurring_invoices
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Create payment_attempts table for tracking failed payments
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_invoice ON payment_attempts(invoice_id);

ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_attempts_org_access" ON payment_attempts
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Create RPC function for incrementing recurring invoice count
CREATE OR REPLACE FUNCTION increment_recurring_invoice_count(recurring_invoice_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recurring_invoices
  SET invoices_generated_count = invoices_generated_count + 1,
      updated_at = now()
  WHERE id = recurring_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE recurring_invoices IS 'Recurring invoice definitions linked to Stripe subscriptions';
COMMENT ON TABLE payment_attempts IS 'Log of payment attempts including failures for audit trail';
