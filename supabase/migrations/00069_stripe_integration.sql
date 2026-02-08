-- ============================================================================
-- Migration: Stripe Payment Integration
-- Description: Add Stripe-related fields to invoices, payments, and companies
-- ============================================================================

-- Add Stripe fields to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_link_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_link_url TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add Stripe fields to companies table for customer sync
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add Stripe fields to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;

-- Add Stripe fields to recurring_invoices table
ALTER TABLE recurring_invoices
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;

-- Create payment_attempts table for tracking failed payments
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stripe_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_link ON invoices(stripe_payment_link_id);
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer ON companies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_stripe_subscription ON recurring_invoices(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_invoice ON payment_attempts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(stripe_event_id);

-- RLS policies for payment_attempts
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment attempts for their tenant"
  ON payment_attempts FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create payment attempts for their tenant"
  ON payment_attempts FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

-- RLS policies for stripe_events
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stripe events for their tenant"
  ON stripe_events FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

-- Function to check if a Stripe event has been processed (idempotency)
CREATE OR REPLACE FUNCTION check_stripe_event_processed(p_event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM stripe_events WHERE stripe_event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a Stripe event as processed
CREATE OR REPLACE FUNCTION mark_stripe_event_processed(
  p_tenant_id UUID,
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO stripe_events (tenant_id, stripe_event_id, event_type, payload)
  VALUES (p_tenant_id, p_event_id, p_event_type, p_payload)
  ON CONFLICT (stripe_event_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment recurring invoice count
CREATE OR REPLACE FUNCTION increment_recurring_invoice_count(p_recurring_invoice_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recurring_invoices
  SET 
    invoices_generated = COALESCE(invoices_generated, 0) + 1,
    updated_at = NOW()
  WHERE id = p_recurring_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE payment_attempts IS 'Tracks all payment attempts including failures for retry logic and analytics';
COMMENT ON TABLE stripe_events IS 'Stores processed Stripe webhook events for idempotency';
