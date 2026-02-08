-- ============================================================================
-- Migration: Multi-Currency Support
-- Description: Add currency management, exchange rates, and multi-currency fields
-- ============================================================================

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(3) NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_base_currency BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(20,10) NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(tenant_id, from_currency, to_currency, effective_date)
);

-- Add currency fields to invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(20,10) DEFAULT 1,
ADD COLUMN IF NOT EXISTS base_currency_amount DECIMAL(15,2);

-- Add currency fields to expenses
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(20,10) DEFAULT 1,
ADD COLUMN IF NOT EXISTS base_currency_amount DECIMAL(15,2);

-- Add currency fields to payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(20,10) DEFAULT 1,
ADD COLUMN IF NOT EXISTS base_currency_amount DECIMAL(15,2);

-- Add currency fields to quotes
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(20,10) DEFAULT 1,
ADD COLUMN IF NOT EXISTS base_currency_amount DECIMAL(15,2);

-- Add currency fields to budgets
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

-- Add default currency to tenants
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS supported_currencies VARCHAR(3)[] DEFAULT ARRAY['USD'];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_currencies_tenant ON currencies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_tenant ON exchange_rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_currency ON invoices(currency);
CREATE INDEX IF NOT EXISTS idx_expenses_currency ON expenses(currency);

-- RLS policies for currencies
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view currencies for their tenant"
  ON currencies FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage currencies for their tenant"
  ON currencies FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

-- RLS policies for exchange_rates
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exchange rates for their tenant"
  ON exchange_rates FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage exchange rates for their tenant"
  ON exchange_rates FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
  ));

-- Function to get exchange rate for a specific date
CREATE OR REPLACE FUNCTION get_exchange_rate(
  p_tenant_id UUID,
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(20,10) AS $$
DECLARE
  v_rate DECIMAL(20,10);
BEGIN
  -- If same currency, return 1
  IF p_from_currency = p_to_currency THEN
    RETURN 1;
  END IF;

  -- Get the most recent rate on or before the given date
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE tenant_id = p_tenant_id
    AND from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND effective_date <= p_date
  ORDER BY effective_date DESC
  LIMIT 1;

  -- If no direct rate found, try inverse
  IF v_rate IS NULL THEN
    SELECT 1 / rate INTO v_rate
    FROM exchange_rates
    WHERE tenant_id = p_tenant_id
      AND from_currency = p_to_currency
      AND to_currency = p_from_currency
      AND effective_date <= p_date
    ORDER BY effective_date DESC
    LIMIT 1;
  END IF;

  RETURN COALESCE(v_rate, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert amount between currencies
CREATE OR REPLACE FUNCTION convert_currency(
  p_tenant_id UUID,
  p_amount DECIMAL(15,2),
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_rate DECIMAL(20,10);
BEGIN
  v_rate := get_exchange_rate(p_tenant_id, p_from_currency, p_to_currency, p_date);
  RETURN ROUND(p_amount * v_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-calculate base currency amount on invoices
CREATE OR REPLACE FUNCTION calculate_invoice_base_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_base_currency VARCHAR(3);
BEGIN
  -- Get tenant's base currency
  SELECT base_currency INTO v_base_currency
  FROM tenants
  WHERE id = NEW.tenant_id;

  -- Calculate base currency amount if different currency
  IF NEW.currency != v_base_currency THEN
    NEW.exchange_rate := get_exchange_rate(NEW.tenant_id, NEW.currency, v_base_currency, COALESCE(NEW.issue_date::DATE, CURRENT_DATE));
    NEW.base_currency_amount := ROUND(COALESCE(NEW.amount_due, 0) * NEW.exchange_rate, 2);
  ELSE
    NEW.exchange_rate := 1;
    NEW.base_currency_amount := NEW.amount_due;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_base_amount
  BEFORE INSERT OR UPDATE OF amount_due, currency ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_base_amount();

-- Trigger to auto-calculate base currency amount on expenses
CREATE OR REPLACE FUNCTION calculate_expense_base_amount()
RETURNS TRIGGER AS $$
DECLARE
  v_base_currency VARCHAR(3);
BEGIN
  -- Get tenant's base currency
  SELECT base_currency INTO v_base_currency
  FROM tenants
  WHERE id = NEW.tenant_id;

  -- Calculate base currency amount if different currency
  IF NEW.currency != v_base_currency THEN
    NEW.exchange_rate := get_exchange_rate(NEW.tenant_id, NEW.currency, v_base_currency, COALESCE(NEW.date::DATE, CURRENT_DATE));
    NEW.base_currency_amount := ROUND(COALESCE(NEW.amount, 0) * NEW.exchange_rate, 2);
  ELSE
    NEW.exchange_rate := 1;
    NEW.base_currency_amount := NEW.amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_expense_base_amount
  BEFORE INSERT OR UPDATE OF amount, currency ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION calculate_expense_base_amount();

-- Insert default currencies
INSERT INTO currencies (tenant_id, code, name, symbol, decimal_places, is_base_currency, is_active)
SELECT 
  t.id,
  c.code,
  c.name,
  c.symbol,
  c.decimal_places,
  c.code = 'USD' as is_base_currency,
  TRUE
FROM tenants t
CROSS JOIN (VALUES
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('CAD', 'Canadian Dollar', 'CA$', 2),
  ('AUD', 'Australian Dollar', 'A$', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CHF', 'Swiss Franc', 'CHF', 2),
  ('CNY', 'Chinese Yuan', '¥', 2),
  ('INR', 'Indian Rupee', '₹', 2),
  ('MXN', 'Mexican Peso', 'MX$', 2)
) AS c(code, name, symbol, decimal_places)
ON CONFLICT (tenant_id, code) DO NOTHING;

COMMENT ON TABLE currencies IS 'Supported currencies for each tenant';
COMMENT ON TABLE exchange_rates IS 'Historical exchange rates for currency conversion';
COMMENT ON FUNCTION get_exchange_rate IS 'Get exchange rate between two currencies for a specific date';
COMMENT ON FUNCTION convert_currency IS 'Convert amount from one currency to another';
