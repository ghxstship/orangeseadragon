-- ATLVS Platform Database Schema
-- Finance Module Enhancements: Recurring Invoices, Reminders, Quotes, Bank Integration
-- Migration: 00068_finance_enhancements.sql

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurring_frequency') THEN
        CREATE TYPE recurring_frequency AS ENUM ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
        CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_trigger_type') THEN
        CREATE TYPE reminder_trigger_type AS ENUM ('before_due', 'on_due', 'after_due');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bank_connection_status') THEN
        CREATE TYPE bank_connection_status AS ENUM ('active', 'error', 'disconnected', 'pending');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bank_account_type') THEN
        CREATE TYPE bank_account_type AS ENUM ('checking', 'savings', 'credit', 'loan', 'investment');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_match_status') THEN
        CREATE TYPE transaction_match_status AS ENUM ('unmatched', 'suggested', 'confirmed', 'excluded', 'created');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'receipt_scan_status') THEN
        CREATE TYPE receipt_scan_status AS ENUM ('processing', 'completed', 'failed', 'reviewed');
    END IF;
END $$;

-- ============================================================================
-- RECURRING INVOICES
-- ============================================================================

CREATE TABLE recurring_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Schedule configuration
    name VARCHAR(255) NOT NULL,
    frequency recurring_frequency NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    start_date DATE NOT NULL,
    end_date DATE,
    next_run_date DATE NOT NULL,
    last_run_date DATE,
    
    -- Invoice template data (if no template_invoice_id)
    client_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    subtotal DECIMAL(14, 2),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_terms INTEGER DEFAULT 30,
    notes TEXT,
    
    -- Automation settings
    auto_send BOOLEAN DEFAULT FALSE,
    include_payment_link BOOLEAN DEFAULT TRUE,
    send_reminders BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    invoices_generated INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_recurring_invoices_org ON recurring_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_run ON recurring_invoices(next_run_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_client ON recurring_invoices(client_id);

-- Recurring invoice line items (template)
CREATE TABLE recurring_invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recurring_invoice_id UUID NOT NULL REFERENCES recurring_invoices(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 4) NOT NULL DEFAULT 1,
    unit_price DECIMAL(14, 4) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_line_items_invoice ON recurring_invoice_line_items(recurring_invoice_id);

-- ============================================================================
-- PAYMENT REMINDERS
-- ============================================================================

CREATE TABLE reminder_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type reminder_trigger_type NOT NULL,
    trigger_days INTEGER NOT NULL DEFAULT 0,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_templates_org ON reminder_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_active ON reminder_templates(organization_id, is_active) WHERE is_active = TRUE;

-- Invoice reminder schedule (which reminders apply to which invoice)
CREATE TABLE invoice_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    reminder_template_id UUID NOT NULL REFERENCES reminder_templates(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_reminders_invoice ON invoice_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_reminders_scheduled ON invoice_reminders(scheduled_date) WHERE status = 'pending';

-- ============================================================================
-- QUOTES / ESTIMATES
-- ============================================================================

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) NOT NULL,
    
    -- Client/Project
    client_id UUID,
    contact_id UUID,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Quote details
    title VARCHAR(255),
    status quote_status DEFAULT 'draft',
    valid_until DATE NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(14, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(14, 2) DEFAULT 0,
    discount_amount DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Terms
    payment_terms INTEGER DEFAULT 30,
    terms_and_conditions TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Tracking
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    decline_reason TEXT,
    
    -- Conversion
    converted_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(organization_id, quote_number)
);

CREATE INDEX IF NOT EXISTS idx_quotes_org ON quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);
CREATE INDEX IF NOT EXISTS idx_quotes_expiring ON quotes(organization_id, valid_until, status) 
    WHERE status IN ('sent', 'viewed');

-- Quote line items
CREATE TABLE quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12, 4) NOT NULL DEFAULT 1,
    unit_price DECIMAL(14, 4) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(14, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(14, 2) DEFAULT 0,
    line_total DECIMAL(14, 2) NOT NULL,
    budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote ON quote_line_items(quote_id);

-- ============================================================================
-- BANK CONNECTIONS & RECONCILIATION
-- ============================================================================

CREATE TABLE bank_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Provider info
    provider VARCHAR(50) NOT NULL, -- 'plaid', 'yodlee', 'manual'
    provider_account_id VARCHAR(255),
    provider_item_id VARCHAR(255),
    access_token_encrypted TEXT,
    
    -- Account info
    institution_id VARCHAR(100),
    institution_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_mask VARCHAR(10),
    account_type bank_account_type NOT NULL,
    
    -- Status
    status bank_connection_status DEFAULT 'pending',
    last_sync_at TIMESTAMPTZ,
    last_sync_error TEXT,
    sync_cursor TEXT,
    
    -- Linked internal account
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bank_connections_org ON bank_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_status ON bank_connections(status);
CREATE INDEX IF NOT EXISTS idx_bank_connections_sync ON bank_connections(last_sync_at);

-- Imported bank transactions
CREATE TABLE imported_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    
    -- Provider data
    provider_transaction_id VARCHAR(255) NOT NULL,
    
    -- Transaction details
    transaction_date DATE NOT NULL,
    posted_date DATE,
    description TEXT NOT NULL,
    original_description TEXT,
    amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(20), -- 'credit', 'debit'
    
    -- Categorization
    category_suggestion VARCHAR(255),
    merchant_name VARCHAR(255),
    
    -- Matching
    match_status transaction_match_status DEFAULT 'unmatched',
    match_confidence DECIMAL(5, 2),
    matched_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    matched_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    matched_at TIMESTAMPTZ,
    matched_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Created expense/payment (if auto-created)
    created_expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    created_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Metadata
    pending BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(bank_connection_id, provider_transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_imported_transactions_connection ON imported_transactions(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_imported_transactions_date ON imported_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_imported_transactions_status ON imported_transactions(match_status);
CREATE INDEX IF NOT EXISTS idx_imported_transactions_unmatched ON imported_transactions(bank_connection_id, match_status) 
    WHERE match_status = 'unmatched';

-- Reconciliation rules for auto-matching
CREATE TABLE reconciliation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    
    -- Conditions (JSONB array of {field, operator, value})
    conditions JSONB NOT NULL DEFAULT '[]',
    
    -- Actions
    action_type VARCHAR(50) NOT NULL, -- 'categorize', 'match_vendor', 'create_expense'
    action_config JSONB NOT NULL DEFAULT '{}',
    
    -- Priority (lower = higher priority)
    priority INTEGER DEFAULT 100,
    
    -- Stats
    times_applied INTEGER DEFAULT 0,
    last_applied_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_org ON reconciliation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_rules_active ON reconciliation_rules(organization_id, priority) WHERE is_active = TRUE;

-- ============================================================================
-- RECEIPT SCANNING
-- ============================================================================

CREATE TABLE receipt_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- File info
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Extracted data
    extracted_data JSONB DEFAULT '{}',
    -- Expected structure: {vendor, amount, date, currency, tax_amount, line_items[], category_suggestion}
    
    -- Confidence scores
    overall_confidence DECIMAL(5, 2),
    field_confidence JSONB DEFAULT '{}',
    
    -- Status
    status receipt_scan_status DEFAULT 'processing',
    error_message TEXT,
    
    -- Linked expense
    expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    
    -- Processing metadata
    ocr_provider VARCHAR(50),
    processing_time_ms INTEGER,
    raw_ocr_result JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_receipt_scans_org ON receipt_scans(organization_id);
CREATE INDEX IF NOT EXISTS idx_receipt_scans_status ON receipt_scans(status);
CREATE INDEX IF NOT EXISTS idx_receipt_scans_expense ON receipt_scans(expense_id);

-- ============================================================================
-- INVOICE ENHANCEMENTS
-- ============================================================================

-- Add new columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_invoice_id UUID REFERENCES recurring_invoices(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_token VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON invoices(recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_link ON invoices(payment_link_token) WHERE payment_link_token IS NOT NULL;

-- ============================================================================
-- EXPENSE ENHANCEMENTS
-- ============================================================================

-- Add new columns to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_scan_id UUID REFERENCES receipt_scans(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS imported_transaction_id UUID REFERENCES imported_transactions(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS mileage_distance DECIMAL(10, 2);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS mileage_rate DECIMAL(6, 4);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS mileage_amount DECIMAL(14, 2) GENERATED ALWAYS AS (mileage_distance * mileage_rate) STORED;

CREATE INDEX IF NOT EXISTS idx_expenses_receipt_scan ON expenses(receipt_scan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_imported_tx ON expenses(imported_transaction_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to generate next invoice from recurring schedule
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_id UUID)
RETURNS UUID AS $$
DECLARE
    v_recurring recurring_invoices%ROWTYPE;
    v_new_invoice_id UUID;
    v_invoice_number VARCHAR(50);
    v_due_date DATE;
BEGIN
    SELECT * INTO v_recurring FROM recurring_invoices WHERE id = p_recurring_id;
    
    IF NOT FOUND OR NOT v_recurring.is_active THEN
        RETURN NULL;
    END IF;
    
    -- Generate invoice number
    SELECT 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
    INTO v_invoice_number
    FROM invoices WHERE organization_id = v_recurring.organization_id;
    
    -- Calculate due date
    v_due_date := v_recurring.next_run_date + (v_recurring.payment_terms || ' days')::INTERVAL;
    
    -- Create the invoice
    INSERT INTO invoices (
        organization_id, invoice_number, direction, status,
        project_id, company_id, issue_date, due_date,
        subtotal, tax_rate, total_amount, currency, payment_terms,
        notes, recurring_invoice_id, reminder_enabled
    )
    VALUES (
        v_recurring.organization_id, v_invoice_number, 'outgoing', 
        CASE WHEN v_recurring.auto_send THEN 'sent' ELSE 'draft' END,
        v_recurring.project_id, v_recurring.client_id, v_recurring.next_run_date, v_due_date,
        v_recurring.subtotal, v_recurring.tax_rate, 
        v_recurring.subtotal * (1 + v_recurring.tax_rate / 100),
        v_recurring.currency, v_recurring.payment_terms,
        v_recurring.notes, v_recurring.id, v_recurring.send_reminders
    )
    RETURNING id INTO v_new_invoice_id;
    
    -- Copy line items
    INSERT INTO invoice_line_items (invoice_id, position, description, quantity, unit_price, tax_rate, line_total)
    SELECT v_new_invoice_id, position, description, quantity, unit_price, tax_rate,
           quantity * unit_price * (1 + tax_rate / 100)
    FROM recurring_invoice_line_items
    WHERE recurring_invoice_id = p_recurring_id;
    
    -- Update recurring invoice
    UPDATE recurring_invoices
    SET 
        last_run_date = next_run_date,
        next_run_date = CASE frequency
            WHEN 'weekly' THEN next_run_date + INTERVAL '1 week'
            WHEN 'biweekly' THEN next_run_date + INTERVAL '2 weeks'
            WHEN 'monthly' THEN next_run_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN next_run_date + INTERVAL '3 months'
            WHEN 'yearly' THEN next_run_date + INTERVAL '1 year'
        END,
        invoices_generated = invoices_generated + 1,
        updated_at = NOW()
    WHERE id = p_recurring_id;
    
    -- Deactivate if end date reached
    UPDATE recurring_invoices
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_recurring_id 
      AND end_date IS NOT NULL 
      AND next_run_date > end_date;
    
    RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to convert quote to invoice
CREATE OR REPLACE FUNCTION convert_quote_to_invoice(p_quote_id UUID)
RETURNS UUID AS $$
DECLARE
    v_quote quotes%ROWTYPE;
    v_new_invoice_id UUID;
    v_invoice_number VARCHAR(50);
BEGIN
    SELECT * INTO v_quote FROM quotes WHERE id = p_quote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;
    
    IF v_quote.status NOT IN ('accepted', 'sent', 'viewed') THEN
        RAISE EXCEPTION 'Quote must be accepted, sent, or viewed to convert';
    END IF;
    
    IF v_quote.converted_invoice_id IS NOT NULL THEN
        RAISE EXCEPTION 'Quote already converted to invoice';
    END IF;
    
    -- Generate invoice number
    SELECT 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
    INTO v_invoice_number
    FROM invoices WHERE organization_id = v_quote.organization_id;
    
    -- Create the invoice
    INSERT INTO invoices (
        organization_id, invoice_number, direction, status,
        project_id, event_id, company_id, contact_id,
        issue_date, due_date,
        subtotal, tax_rate, tax_amount, discount_amount, total_amount,
        currency, payment_terms, notes, quote_id
    )
    VALUES (
        v_quote.organization_id, v_invoice_number, 'outgoing', 'draft',
        v_quote.project_id, v_quote.event_id, v_quote.client_id, v_quote.contact_id,
        CURRENT_DATE, CURRENT_DATE + (v_quote.payment_terms || ' days')::INTERVAL,
        v_quote.subtotal, v_quote.tax_rate, v_quote.tax_amount, 
        v_quote.discount_amount, v_quote.total_amount,
        v_quote.currency, v_quote.payment_terms, v_quote.notes, v_quote.id
    )
    RETURNING id INTO v_new_invoice_id;
    
    -- Copy line items
    INSERT INTO invoice_line_items (invoice_id, position, description, quantity, unit_price, tax_rate, tax_amount, discount_percent, discount_amount, line_total, budget_category_id)
    SELECT v_new_invoice_id, position, description, quantity, unit_price, tax_rate, tax_amount, discount_percent, discount_amount, line_total, budget_category_id
    FROM quote_line_items
    WHERE quote_id = p_quote_id;
    
    -- Update quote
    UPDATE quotes
    SET 
        status = 'converted',
        converted_invoice_id = v_new_invoice_id,
        converted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_quote_id;
    
    RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule invoice reminders
CREATE OR REPLACE FUNCTION schedule_invoice_reminders()
RETURNS TRIGGER AS $$
BEGIN
    -- Only schedule for outgoing invoices that are sent and have reminders enabled
    IF NEW.direction = 'outgoing' AND NEW.status = 'sent' AND NEW.reminder_enabled = TRUE THEN
        -- Schedule reminders based on active templates
        INSERT INTO invoice_reminders (invoice_id, reminder_template_id, scheduled_date)
        SELECT 
            NEW.id,
            rt.id,
            CASE rt.trigger_type
                WHEN 'before_due' THEN NEW.due_date - (rt.trigger_days || ' days')::INTERVAL
                WHEN 'on_due' THEN NEW.due_date
                WHEN 'after_due' THEN NEW.due_date + (rt.trigger_days || ' days')::INTERVAL
            END
        FROM reminder_templates rt
        WHERE rt.organization_id = NEW.organization_id
          AND rt.is_active = TRUE
          AND NOT EXISTS (
              SELECT 1 FROM invoice_reminders ir 
              WHERE ir.invoice_id = NEW.id AND ir.reminder_template_id = rt.id
          );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schedule_invoice_reminders ON invoices;
CREATE TRIGGER trg_schedule_invoice_reminders
    AFTER INSERT OR UPDATE OF status, reminder_enabled ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION schedule_invoice_reminders();

-- Cancel reminders when invoice is paid
CREATE OR REPLACE FUNCTION cancel_invoice_reminders()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('paid', 'cancelled') AND OLD.status NOT IN ('paid', 'cancelled') THEN
        UPDATE invoice_reminders
        SET status = 'cancelled'
        WHERE invoice_id = NEW.id AND status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cancel_invoice_reminders ON invoices;
CREATE TRIGGER trg_cancel_invoice_reminders
    AFTER UPDATE OF status ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION cancel_invoice_reminders();

-- Auto-expire quotes
CREATE OR REPLACE FUNCTION expire_quotes()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE quotes
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('sent', 'viewed')
      AND valid_until < CURRENT_DATE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DEFAULT REMINDER TEMPLATES
-- ============================================================================

-- Note: These will be inserted per-organization during onboarding
-- This is just a reference for the default templates

COMMENT ON TABLE reminder_templates IS 'Default templates to seed per organization:
1. 3 Days Before Due: "Friendly reminder: Invoice {invoice_number} is due in 3 days"
2. On Due Date: "Invoice {invoice_number} is due today"  
3. 7 Days Overdue: "Overdue notice: Invoice {invoice_number} is 7 days past due"
4. 14 Days Overdue: "Second notice: Invoice {invoice_number} is 14 days past due"
5. 30 Days Overdue: "Final notice: Invoice {invoice_number} is 30 days past due"';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

-- Recurring invoices policies
CREATE POLICY recurring_invoices_org_access ON recurring_invoices
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY recurring_invoice_line_items_access ON recurring_invoice_line_items
    FOR ALL USING (recurring_invoice_id IN (
        SELECT id FROM recurring_invoices WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

-- Reminder templates policies
CREATE POLICY reminder_templates_org_access ON reminder_templates
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY invoice_reminders_access ON invoice_reminders
    FOR ALL USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

-- Quotes policies
CREATE POLICY quotes_org_access ON quotes
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY quote_line_items_access ON quote_line_items
    FOR ALL USING (quote_id IN (
        SELECT id FROM quotes WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

-- Bank connections policies
CREATE POLICY bank_connections_org_access ON bank_connections
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY imported_transactions_access ON imported_transactions
    FOR ALL USING (bank_connection_id IN (
        SELECT id FROM bank_connections WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY reconciliation_rules_org_access ON reconciliation_rules
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Receipt scans policies
CREATE POLICY receipt_scans_org_access ON receipt_scans
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
