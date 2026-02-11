-- ============================================================================
-- FINANCIAL LEDGER AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes financial_ledger as the Single Source of Truth
-- for all financial transactions across the platform. Source entities 
-- (invoices, payments, expenses, purchase orders) automatically sync to 
-- financial_ledger via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - financial_ledger owns the unified financial index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE FINANCIAL LEDGER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Transaction classification
    transaction_type VARCHAR(50) NOT NULL,  -- 'invoice', 'payment', 'expense', 'purchase_order', 'payroll'
    direction VARCHAR(10) NOT NULL,          -- 'inflow', 'outflow'
    
    -- Source entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    reference_number VARCHAR(100),           -- Invoice/expense/PO number
    
    -- Financial details
    amount DECIMAL(14, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    amount_base DECIMAL(14, 2),              -- Amount in base currency
    
    -- Status
    status VARCHAR(50),                      -- 'draft', 'pending', 'approved', 'paid', 'overdue', 'cancelled'
    
    -- Counterparty
    counterparty_type VARCHAR(50),           -- 'client', 'vendor', 'employee'
    counterparty_id UUID,
    counterparty_name VARCHAR(255),
    
    -- Related entities (for filtering/reporting)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    budget_category_id UUID,
    
    -- Dates
    transaction_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    
    -- Description
    description TEXT,
    notes TEXT,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_financial_ledger_organization ON financial_ledger(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_type ON financial_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_direction ON financial_ledger(direction);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_entity ON financial_ledger(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_status ON financial_ledger(status);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_date ON financial_ledger(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_due_date ON financial_ledger(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_ledger_project ON financial_ledger(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_ledger_event ON financial_ledger(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_ledger_company ON financial_ledger(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financial_ledger_counterparty ON financial_ledger(counterparty_type, counterparty_id);

-- ============================================================================
-- HELPER FUNCTION: Upsert financial ledger entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_financial_ledger(
    p_organization_id UUID,
    p_transaction_type VARCHAR(50),
    p_direction VARCHAR(10),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_reference_number VARCHAR(100),
    p_amount DECIMAL(14, 2),
    p_currency VARCHAR(3) DEFAULT 'USD',
    p_status VARCHAR(50) DEFAULT NULL,
    p_counterparty_type VARCHAR(50) DEFAULT NULL,
    p_counterparty_id UUID DEFAULT NULL,
    p_counterparty_name VARCHAR(255) DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_budget_category_id UUID DEFAULT NULL,
    p_transaction_date DATE DEFAULT CURRENT_DATE,
    p_due_date DATE DEFAULT NULL,
    p_paid_date DATE DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_created_by UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_suffix VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_ledger_id UUID;
    v_external_id VARCHAR(100);
BEGIN
    -- Create unique key for this ledger entry
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT || COALESCE(':' || p_suffix, '');
    
    -- Upsert the financial ledger entry
    INSERT INTO financial_ledger (
        organization_id,
        transaction_type,
        direction,
        entity_type,
        entity_id,
        reference_number,
        amount,
        currency,
        amount_base,
        status,
        counterparty_type,
        counterparty_id,
        counterparty_name,
        project_id,
        event_id,
        company_id,
        budget_category_id,
        transaction_date,
        due_date,
        paid_date,
        description,
        notes,
        visibility,
        created_by,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_transaction_type,
        p_direction,
        p_entity_type,
        p_entity_id,
        p_reference_number,
        p_amount,
        p_currency,
        p_amount,  -- TODO: Apply exchange rate conversion
        p_status,
        p_counterparty_type,
        p_counterparty_id,
        p_counterparty_name,
        p_project_id,
        p_event_id,
        p_company_id,
        p_budget_category_id,
        p_transaction_date,
        p_due_date,
        p_paid_date,
        p_description,
        p_notes,
        p_visibility,
        p_created_by,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        reference_number = EXCLUDED.reference_number,
        amount = EXCLUDED.amount,
        currency = EXCLUDED.currency,
        amount_base = EXCLUDED.amount_base,
        status = EXCLUDED.status,
        counterparty_type = EXCLUDED.counterparty_type,
        counterparty_id = EXCLUDED.counterparty_id,
        counterparty_name = EXCLUDED.counterparty_name,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        company_id = EXCLUDED.company_id,
        budget_category_id = EXCLUDED.budget_category_id,
        transaction_date = EXCLUDED.transaction_date,
        due_date = EXCLUDED.due_date,
        paid_date = EXCLUDED.paid_date,
        description = EXCLUDED.description,
        notes = EXCLUDED.notes,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_ledger_id;
    
    RETURN v_ledger_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete financial ledger entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_financial_ledger_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM financial_ledger 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Invoices → financial_ledger
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_invoice_to_ledger() RETURNS TRIGGER AS $$
DECLARE
    v_company_name VARCHAR(255);
    v_direction VARCHAR(10);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_financial_ledger_for_entity('invoice', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip cancelled invoices
    IF NEW.status = 'cancelled' THEN
        PERFORM delete_financial_ledger_for_entity('invoice', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get company name
    SELECT name INTO v_company_name FROM companies WHERE id = NEW.company_id;
    
    -- Determine direction
    v_direction := CASE NEW.direction 
        WHEN 'receivable' THEN 'inflow'
        WHEN 'payable' THEN 'outflow'
        ELSE 'inflow'
    END;
    
    PERFORM upsert_financial_ledger(
        p_organization_id := NEW.organization_id,
        p_transaction_type := 'invoice',
        p_direction := v_direction,
        p_entity_type := 'invoice',
        p_entity_id := NEW.id,
        p_reference_number := NEW.invoice_number,
        p_amount := NEW.total_amount,
        p_currency := COALESCE(NEW.currency, 'USD'),
        p_status := NEW.status::TEXT,
        p_counterparty_type := CASE NEW.direction WHEN 'receivable' THEN 'client' ELSE 'vendor' END,
        p_counterparty_id := NEW.company_id,
        p_counterparty_name := v_company_name,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_company_id := NEW.company_id,
        p_transaction_date := NEW.issue_date,
        p_due_date := NEW.due_date,
        p_paid_date := NEW.paid_at::DATE,
        p_description := 'Invoice ' || NEW.invoice_number,
        p_notes := NEW.notes,
        p_visibility := 'team',
        p_created_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'invoice_type', NEW.invoice_type,
            'subtotal', NEW.subtotal,
            'tax_amount', NEW.tax_amount,
            'amount_paid', NEW.amount_paid,
            'amount_due', NEW.amount_due
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_to_ledger ON invoices;
CREATE TRIGGER trg_sync_invoice_to_ledger
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION sync_invoice_to_ledger();

-- ============================================================================
-- TRIGGER: Payments → financial_ledger
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_payment_to_ledger() RETURNS TRIGGER AS $$
DECLARE
    v_invoice_direction invoice_direction;
    v_company_id UUID;
    v_company_name VARCHAR(255);
    v_project_id UUID;
    v_event_id UUID;
    v_direction VARCHAR(10);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_financial_ledger_for_entity('payment', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get invoice details if linked
    IF NEW.invoice_id IS NOT NULL THEN
        SELECT direction, company_id, project_id, event_id 
        INTO v_invoice_direction, v_company_id, v_project_id, v_event_id
        FROM invoices WHERE id = NEW.invoice_id;
        
        SELECT name INTO v_company_name FROM companies WHERE id = v_company_id;
        
        v_direction := CASE v_invoice_direction 
            WHEN 'receivable' THEN 'inflow'
            WHEN 'payable' THEN 'outflow'
            ELSE 'inflow'
        END;
    ELSE
        v_direction := 'inflow';
    END IF;
    
    PERFORM upsert_financial_ledger(
        p_organization_id := NEW.organization_id,
        p_transaction_type := 'payment',
        p_direction := v_direction,
        p_entity_type := 'payment',
        p_entity_id := NEW.id,
        p_reference_number := NEW.payment_number,
        p_amount := NEW.amount,
        p_currency := COALESCE(NEW.currency, 'USD'),
        p_status := 'completed',
        p_counterparty_type := CASE v_direction WHEN 'inflow' THEN 'client' ELSE 'vendor' END,
        p_counterparty_id := v_company_id,
        p_counterparty_name := v_company_name,
        p_project_id := v_project_id,
        p_event_id := v_event_id,
        p_company_id := v_company_id,
        p_transaction_date := NEW.payment_date,
        p_paid_date := NEW.payment_date,
        p_description := 'Payment ' || NEW.payment_number,
        p_notes := NEW.notes,
        p_visibility := 'team',
        p_created_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'payment_method', NEW.payment_method,
            'reference_number', NEW.reference_number,
            'invoice_id', NEW.invoice_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_payment_to_ledger ON payments;
CREATE TRIGGER trg_sync_payment_to_ledger
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION sync_payment_to_ledger();

-- ============================================================================
-- TRIGGER: Expenses → financial_ledger
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_expense_to_ledger() RETURNS TRIGGER AS $$
DECLARE
    v_user_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_financial_ledger_for_entity('expense', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip cancelled expenses
    IF NEW.status = 'cancelled' THEN
        PERFORM delete_financial_ledger_for_entity('expense', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get user name
    SELECT COALESCE(display_name, first_name || ' ' || last_name) INTO v_user_name 
    FROM users WHERE id = NEW.user_id;
    
    PERFORM upsert_financial_ledger(
        p_organization_id := NEW.organization_id,
        p_transaction_type := 'expense',
        p_direction := 'outflow',
        p_entity_type := 'expense',
        p_entity_id := NEW.id,
        p_reference_number := NEW.expense_number,
        p_amount := NEW.amount + COALESCE(NEW.tax_amount, 0),
        p_currency := COALESCE(NEW.currency, 'USD'),
        p_status := NEW.status::TEXT,
        p_counterparty_type := 'employee',
        p_counterparty_id := NEW.user_id,
        p_counterparty_name := v_user_name,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_budget_category_id := NEW.category_id,
        p_transaction_date := NEW.expense_date,
        p_paid_date := NEW.reimbursed_at::DATE,
        p_description := NEW.description,
        p_notes := NEW.notes,
        p_visibility := 'team',
        p_created_by := NEW.user_id,
        p_metadata := jsonb_build_object(
            'vendor_name', NEW.vendor_name,
            'is_billable', NEW.is_billable,
            'is_reimbursable', NEW.is_reimbursable,
            'payment_method', NEW.payment_method
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_expense_to_ledger ON expenses;
CREATE TRIGGER trg_sync_expense_to_ledger
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION sync_expense_to_ledger();

-- ============================================================================
-- TRIGGER: Purchase Orders → financial_ledger
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_purchase_order_to_ledger() RETURNS TRIGGER AS $$
DECLARE
    v_vendor_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_financial_ledger_for_entity('purchase_order', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip cancelled POs
    IF NEW.status = 'cancelled' THEN
        PERFORM delete_financial_ledger_for_entity('purchase_order', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get vendor name
    SELECT name INTO v_vendor_name FROM companies WHERE id = NEW.vendor_id;
    
    PERFORM upsert_financial_ledger(
        p_organization_id := NEW.organization_id,
        p_transaction_type := 'purchase_order',
        p_direction := 'outflow',
        p_entity_type := 'purchase_order',
        p_entity_id := NEW.id,
        p_reference_number := NEW.po_number,
        p_amount := NEW.total_amount,
        p_currency := COALESCE(NEW.currency, 'USD'),
        p_status := NEW.status::TEXT,
        p_counterparty_type := 'vendor',
        p_counterparty_id := NEW.vendor_id,
        p_counterparty_name := v_vendor_name,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_company_id := NEW.vendor_id,
        p_transaction_date := NEW.order_date,
        p_due_date := NEW.delivery_date,
        p_description := 'PO ' || NEW.po_number || ': ' || COALESCE(NEW.description, ''),
        p_notes := NEW.notes,
        p_visibility := 'team',
        p_created_by := NEW.created_by,
        p_metadata := jsonb_build_object(
            'subtotal', NEW.subtotal,
            'tax_amount', NEW.tax_amount,
            'shipping_amount', NEW.shipping_amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_purchase_order_to_ledger ON purchase_orders;
CREATE TRIGGER trg_sync_purchase_order_to_ledger
    AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION sync_purchase_order_to_ledger();

-- ============================================================================
-- RLS POLICIES FOR FINANCIAL_LEDGER
-- ============================================================================

-- Enable RLS
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS financial_ledger_select_policy ON financial_ledger;
DROP POLICY IF EXISTS financial_ledger_insert_policy ON financial_ledger;
DROP POLICY IF EXISTS financial_ledger_update_policy ON financial_ledger;
DROP POLICY IF EXISTS financial_ledger_delete_policy ON financial_ledger;

-- SELECT: Users can see financial data based on organization membership
CREATE POLICY financial_ledger_select_policy ON financial_ledger
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
        OR (visibility = 'private' AND created_by = auth.uid())
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY financial_ledger_insert_policy ON financial_ledger
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY financial_ledger_update_policy ON financial_ledger
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY financial_ledger_delete_policy ON financial_ledger
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- ============================================================================
-- BACKFILL: Sync existing invoices
-- ============================================================================

INSERT INTO financial_ledger (
    organization_id, transaction_type, direction, entity_type, entity_id,
    reference_number, amount, currency, status,
    counterparty_type, counterparty_id, counterparty_name,
    project_id, event_id, company_id,
    transaction_date, due_date, paid_date,
    description, notes, visibility, created_by, metadata,
    external_id, created_at, updated_at
)
SELECT 
    i.organization_id,
    'invoice',
    CASE i.direction WHEN 'receivable' THEN 'inflow' ELSE 'outflow' END,
    'invoice',
    i.id,
    i.invoice_number,
    i.total_amount,
    COALESCE(i.currency, 'USD'),
    i.status::TEXT,
    CASE i.direction WHEN 'receivable' THEN 'client' ELSE 'vendor' END,
    i.company_id,
    c.name,
    i.project_id,
    i.event_id,
    i.company_id,
    i.issue_date,
    i.due_date,
    i.paid_at::DATE,
    'Invoice ' || i.invoice_number,
    i.notes,
    'team',
    i.created_by,
    jsonb_build_object('invoice_type', i.invoice_type, 'subtotal', i.subtotal),
    'invoice:' || i.id::TEXT,
    NOW(),
    NOW()
FROM invoices i
LEFT JOIN companies c ON c.id = i.company_id
WHERE i.status != 'cancelled'
ON CONFLICT (external_id) DO NOTHING;

-- Backfill payments
INSERT INTO financial_ledger (
    organization_id, transaction_type, direction, entity_type, entity_id,
    reference_number, amount, currency, status,
    transaction_date, paid_date,
    description, notes, visibility, created_by, metadata,
    external_id, created_at, updated_at
)
SELECT 
    p.organization_id,
    'payment',
    'inflow',
    'payment',
    p.id,
    p.payment_number,
    p.amount,
    COALESCE(p.currency, 'USD'),
    'completed',
    p.payment_date,
    p.payment_date,
    'Payment ' || p.payment_number,
    p.notes,
    'team',
    p.created_by,
    jsonb_build_object('payment_method', p.payment_method, 'invoice_id', p.invoice_id),
    'payment:' || p.id::TEXT,
    NOW(),
    NOW()
FROM payments p
ON CONFLICT (external_id) DO NOTHING;

-- Backfill expenses
INSERT INTO financial_ledger (
    organization_id, transaction_type, direction, entity_type, entity_id,
    reference_number, amount, currency, status,
    counterparty_type, counterparty_id, counterparty_name,
    project_id, event_id, budget_category_id,
    transaction_date, paid_date,
    description, notes, visibility, created_by, metadata,
    external_id, created_at, updated_at
)
SELECT 
    e.organization_id,
    'expense',
    'outflow',
    'expense',
    e.id,
    e.expense_number,
    e.amount + COALESCE(e.tax_amount, 0),
    COALESCE(e.currency, 'USD'),
    e.status::TEXT,
    'employee',
    e.user_id,
    u.full_name,
    e.project_id,
    e.event_id,
    e.category_id,
    e.expense_date,
    e.reimbursed_at::DATE,
    e.description,
    e.notes,
    'team',
    e.user_id,
    jsonb_build_object('vendor_name', e.vendor_name, 'is_billable', e.is_billable),
    'expense:' || e.id::TEXT,
    NOW(),
    NOW()
FROM expenses e
LEFT JOIN users u ON u.id = e.user_id
WHERE e.status NOT IN ('rejected')
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE financial_ledger IS 'SSOT for all financial transactions. Source entities sync here via triggers.';
COMMENT ON COLUMN financial_ledger.transaction_type IS 'Type of transaction (invoice, payment, expense, purchase_order, payroll)';
COMMENT ON COLUMN financial_ledger.direction IS 'Cash flow direction (inflow, outflow)';
COMMENT ON COLUMN financial_ledger.entity_type IS 'Source entity type';
COMMENT ON COLUMN financial_ledger.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN financial_ledger.external_id IS 'Unique key for upsert: entity_type:entity_id[:suffix]';
