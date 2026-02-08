-- Migration: Productive.io Invoice Enhancements
-- Created: 2026-02-07
-- Description: Adds invoice types, direction, enhanced statuses,
--              per-line-item tax/discount, payment tracking,
--              and progressive billing support.

-- ============================================================================
-- STEP 1: INVOICE TABLE ENHANCEMENTS
-- ============================================================================

-- Add invoice_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'invoice_type'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_type VARCHAR(20) DEFAULT 'standard'
            CHECK (invoice_type IN ('standard', 'credit', 'proforma', 'recurring'));
    END IF;
END $$;

-- Add direction (receivable vs payable)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'direction'
    ) THEN
        ALTER TABLE invoices ADD COLUMN direction VARCHAR(20) DEFAULT 'receivable'
            CHECK (direction IN ('receivable', 'payable'));
    END IF;
END $$;

-- Add enhanced financial fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN discount_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN amount_paid DECIMAL(14,2) DEFAULT 0;
    END IF;
END $$;

-- Add payment terms
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_terms INTEGER DEFAULT 30;
        ALTER TABLE invoices ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
    END IF;
END $$;

-- Add billing address
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'billing_address'
    ) THEN
        ALTER TABLE invoices ADD COLUMN billing_address TEXT;
        ALTER TABLE invoices ADD COLUMN internal_notes TEXT;
    END IF;
END $$;

-- Add tracking timestamps
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN sent_at TIMESTAMPTZ;
        ALTER TABLE invoices ADD COLUMN viewed_at TIMESTAMPTZ;
        ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add budget/milestone linking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'budget_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL;
        ALTER TABLE invoices ADD COLUMN payment_milestone_id UUID REFERENCES payment_milestones(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add company/contact relations if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'contact_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_direction ON invoices(direction);
CREATE INDEX IF NOT EXISTS idx_invoices_budget ON invoices(budget_id);
CREATE INDEX IF NOT EXISTS idx_invoices_milestone ON invoices(payment_milestone_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);

-- ============================================================================
-- STEP 2: INVOICE LINE ITEMS TABLE ENHANCEMENTS
-- ============================================================================

-- Add per-line tax and discount to invoice_line_items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoice_line_items' AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE invoice_line_items ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 0;
        ALTER TABLE invoice_line_items ADD COLUMN tax_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE invoice_line_items ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0;
        ALTER TABLE invoice_line_items ADD COLUMN discount_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE invoice_line_items ADD COLUMN line_total DECIMAL(14,2) DEFAULT 0;
    END IF;
END $$;

-- Add budget category linking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoice_line_items' AND column_name = 'budget_category_id'
    ) THEN
        ALTER TABLE invoice_line_items ADD COLUMN budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: INVOICE TOTALS RECALCULATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(14,2);
    v_tax DECIMAL(14,2);
    v_discount DECIMAL(14,2);
BEGIN
    -- Calculate totals from line items
    SELECT
        COALESCE(SUM(quantity * unit_price), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(discount_amount), 0)
    INTO v_subtotal, v_tax, v_discount
    FROM invoice_line_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Update invoice totals
    UPDATE invoices SET
        subtotal = v_subtotal,
        tax_amount = v_tax,
        discount_amount = v_discount,
        total_amount = v_subtotal + v_tax - v_discount,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_invoice_totals ON invoice_line_items;
CREATE TRIGGER trg_recalculate_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_invoice_totals();

-- ============================================================================
-- STEP 4: LINE ITEM TOTAL CALCULATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_line_item_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate discount
    NEW.discount_amount := COALESCE(NEW.quantity * NEW.unit_price * (COALESCE(NEW.discount_percent, 0) / 100.0), 0);

    -- Calculate tax on discounted amount
    NEW.tax_amount := COALESCE((NEW.quantity * NEW.unit_price - NEW.discount_amount) * (COALESCE(NEW.tax_rate, 0) / 100.0), 0);

    -- Calculate line total
    NEW.line_total := (NEW.quantity * NEW.unit_price) - NEW.discount_amount + NEW.tax_amount;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_line_item_total ON invoice_line_items;
CREATE TRIGGER trg_calculate_line_item_total
    BEFORE INSERT OR UPDATE ON invoice_line_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_line_item_total();

-- ============================================================================
-- STEP 5: PAYMENT TRACKING — UPDATE INVOICE ON PAYMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_invoice_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid DECIMAL(14,2);
    v_invoice_total DECIMAL(14,2);
BEGIN
    -- Sum all payments for this invoice
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
      AND status = 'completed';

    -- Get invoice total
    SELECT COALESCE(total_amount, 0)
    INTO v_invoice_total
    FROM invoices
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Update invoice
    UPDATE invoices SET
        amount_paid = v_total_paid,
        status = CASE
            WHEN v_total_paid >= v_invoice_total THEN 'paid'
            WHEN v_total_paid > 0 THEN 'partially_paid'
            ELSE status
        END,
        paid_at = CASE
            WHEN v_total_paid >= v_invoice_total THEN NOW()
            ELSE paid_at
        END,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_invoice_payment_totals ON payments;
CREATE TRIGGER trg_update_invoice_payment_totals
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    WHEN (COALESCE(NEW.invoice_id, OLD.invoice_id) IS NOT NULL)
    EXECUTE FUNCTION update_invoice_payment_totals();

-- ============================================================================
-- STEP 6: OVERDUE INVOICE DETECTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE invoices SET
        status = 'overdue',
        updated_at = NOW()
    WHERE status = 'sent'
      AND due_date < CURRENT_DATE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: MILESTONE-TO-INVOICE CREATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_invoice_from_milestone(
    p_milestone_id UUID,
    p_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_milestone payment_milestones%ROWTYPE;
    v_budget budgets%ROWTYPE;
    v_invoice_id UUID;
    v_invoice_number VARCHAR(50);
    v_amount DECIMAL(14,2);
BEGIN
    SELECT * INTO v_milestone FROM payment_milestones WHERE id = p_milestone_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
    END IF;

    IF v_milestone.status != 'ready' THEN
        RAISE EXCEPTION 'Milestone is not ready for invoicing (status: %)', v_milestone.status;
    END IF;

    SELECT * INTO v_budget FROM budgets WHERE id = v_milestone.budget_id;

    -- Calculate amount
    IF v_milestone.fixed_amount IS NOT NULL AND v_milestone.fixed_amount > 0 THEN
        v_amount := v_milestone.fixed_amount;
    ELSIF v_milestone.percentage IS NOT NULL THEN
        v_amount := v_budget.total_amount * (v_milestone.percentage / 100.0);
    ELSE
        RAISE EXCEPTION 'Milestone has no amount or percentage defined';
    END IF;

    -- Generate invoice number
    v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');

    -- Create invoice
    INSERT INTO invoices (
        organization_id,
        invoice_number,
        invoice_type,
        direction,
        status,
        project_id,
        budget_id,
        payment_milestone_id,
        total_amount,
        subtotal,
        issue_date,
        due_date,
        payment_terms,
        notes,
        created_by
    ) VALUES (
        v_budget.organization_id,
        v_invoice_number,
        'standard',
        'receivable',
        'draft',
        v_budget.project_id,
        v_budget.id,
        p_milestone_id,
        v_amount,
        v_amount,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        30,
        'Generated from milestone: ' || v_milestone.name,
        p_user_id
    ) RETURNING id INTO v_invoice_id;

    -- Create a single line item for the milestone
    INSERT INTO invoice_line_items (
        invoice_id,
        description,
        quantity,
        unit_price,
        position
    ) VALUES (
        v_invoice_id,
        v_milestone.name,
        1,
        v_amount,
        1
    );

    -- Update milestone status
    UPDATE payment_milestones SET
        status = 'invoiced',
        invoice_id = v_invoice_id,
        updated_at = NOW()
    WHERE id = p_milestone_id;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
