-- Migration: Phase 4 — Invoice Automation, Conversions & Resource Sync
-- Created: 2026-02-07
-- Description: Invoice auto-creation triggers, quote-to-invoice conversion,
--              settlement-to-invoice generation, absence-to-resource sync,
--              invoice email delivery tracking, multi-entity invoicing

-- ============================================================================
-- STEP 1: INVOICE EMAIL DELIVERY TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Delivery details
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    cc_emails TEXT[],
    bcc_emails TEXT[],

    -- Attachments
    include_pdf BOOLEAN DEFAULT TRUE,
    include_timesheet BOOLEAN DEFAULT FALSE,
    custom_attachments UUID[], -- document IDs

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'opened', 'bounced', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    error_message TEXT,

    -- Provider tracking
    email_provider VARCHAR(50) DEFAULT 'internal',
    provider_message_id VARCHAR(255),

    -- Audit
    sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_org ON invoice_deliveries(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_invoice ON invoice_deliveries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_status ON invoice_deliveries(status);

-- ============================================================================
-- STEP 2: QUOTE-TO-INVOICE CONVERSION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION convert_quote_to_invoice(
    p_quote_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quote RECORD;
    v_invoice_id UUID;
    v_invoice_number TEXT;
BEGIN
    -- Get the quote
    SELECT * INTO v_quote
    FROM quotes
    WHERE id = p_quote_id;

    IF v_quote IS NULL THEN
        RAISE EXCEPTION 'Quote not found';
    END IF;

    IF v_quote.status != 'accepted' THEN
        RAISE EXCEPTION 'Quote must be in accepted status to convert';
    END IF;

    -- Generate invoice number
    SELECT 'INV-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1)::TEXT, 6, '0')
    INTO v_invoice_number
    FROM invoices
    WHERE organization_id = v_quote.organization_id
      AND invoice_number LIKE 'INV-%';

    -- Create the invoice
    INSERT INTO invoices (
        id, organization_id, invoice_number, project_id,
        client_id, status, direction, invoice_type,
        subtotal_amount, tax_amount, discount_amount, total_amount,
        currency, notes, due_date, created_by,
        source_quote_id
    ) VALUES (
        uuid_generate_v4(), v_quote.organization_id, v_invoice_number, v_quote.project_id,
        v_quote.client_id, 'draft', 'outgoing', 'standard',
        v_quote.subtotal_amount, v_quote.tax_amount, v_quote.discount_amount, v_quote.total_amount,
        COALESCE(v_quote.currency, 'USD'), v_quote.notes, CURRENT_DATE + 30,
        p_user_id,
        p_quote_id
    ) RETURNING id INTO v_invoice_id;

    -- Copy quote line items to invoice line items
    INSERT INTO invoice_line_items (
        id, invoice_id, description, quantity, unit_price,
        tax_rate, tax_amount, discount_amount, total_amount,
        sort_order
    )
    SELECT
        uuid_generate_v4(), v_invoice_id, qli.description, qli.quantity, qli.unit_price,
        COALESCE(qli.tax_rate, 0), COALESCE(qli.tax_amount, 0),
        COALESCE(qli.discount_amount, 0), qli.total_amount,
        qli.sort_order
    FROM quote_line_items qli
    WHERE qli.quote_id = p_quote_id
    ORDER BY qli.sort_order;

    -- Update quote status
    UPDATE quotes SET status = 'invoiced', updated_at = NOW() WHERE id = p_quote_id;

    -- Log activity
    INSERT INTO activities (actor_id, action, target_type, target_id, metadata)
    VALUES (p_user_id, 'quote_converted_to_invoice', 'invoice', v_invoice_id,
        jsonb_build_object('quote_id', p_quote_id, 'invoice_number', v_invoice_number));

    RETURN v_invoice_id;
END;
$$;

-- ============================================================================
-- STEP 3: SETTLEMENT-TO-INVOICE GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_from_settlement(
    p_settlement_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_settlement RECORD;
    v_invoice_id UUID;
    v_invoice_number TEXT;
BEGIN
    SELECT * INTO v_settlement
    FROM settlements
    WHERE id = p_settlement_id;

    IF v_settlement IS NULL THEN
        RAISE EXCEPTION 'Settlement not found';
    END IF;

    IF v_settlement.status NOT IN ('approved', 'finalized') THEN
        RAISE EXCEPTION 'Settlement must be approved or finalized';
    END IF;

    -- Generate invoice number
    SELECT 'INV-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1)::TEXT, 6, '0')
    INTO v_invoice_number
    FROM invoices
    WHERE organization_id = v_settlement.organization_id
      AND invoice_number LIKE 'INV-%';

    -- Create the final invoice from settlement
    INSERT INTO invoices (
        id, organization_id, invoice_number, project_id,
        client_id, status, direction, invoice_type,
        subtotal_amount, tax_amount, total_amount,
        currency, notes, due_date, created_by,
        source_settlement_id
    ) VALUES (
        uuid_generate_v4(), v_settlement.organization_id, v_invoice_number,
        v_settlement.project_id, v_settlement.client_id,
        'draft', 'outgoing', 'final',
        v_settlement.net_amount, 0, v_settlement.net_amount,
        COALESCE(v_settlement.currency, 'USD'),
        'Generated from settlement ' || v_settlement.settlement_number,
        CURRENT_DATE + 30,
        p_user_id,
        p_settlement_id
    ) RETURNING id INTO v_invoice_id;

    -- Create line items from settlement breakdown
    INSERT INTO invoice_line_items (
        id, invoice_id, description, quantity, unit_price, total_amount, sort_order
    ) VALUES
        (uuid_generate_v4(), v_invoice_id, 'Total Revenue', 1, v_settlement.revenue_amount, v_settlement.revenue_amount, 1),
        (uuid_generate_v4(), v_invoice_id, 'Less: Total Expenses', 1, -v_settlement.expense_amount, -v_settlement.expense_amount, 2),
        (uuid_generate_v4(), v_invoice_id, 'Net Settlement', 1, v_settlement.net_amount, v_settlement.net_amount, 3);

    -- Log activity
    INSERT INTO activities (actor_id, action, target_type, target_id, metadata)
    VALUES (p_user_id, 'settlement_invoiced', 'invoice', v_invoice_id,
        jsonb_build_object('settlement_id', p_settlement_id, 'invoice_number', v_invoice_number));

    RETURN v_invoice_id;
END;
$$;

-- ============================================================================
-- STEP 4: INVOICE AUTOMATION RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Trigger
    trigger_type VARCHAR(30) NOT NULL
        CHECK (trigger_type IN (
            'milestone_completed', 'phase_completed', 'budget_threshold',
            'date_reached', 'task_completed', 'project_completed',
            'recurring_schedule'
        )),
    trigger_config JSONB DEFAULT '{}',

    -- Invoice template
    invoice_type VARCHAR(20) DEFAULT 'standard',
    invoice_direction VARCHAR(20) DEFAULT 'outgoing',
    amount_type VARCHAR(20) DEFAULT 'fixed'
        CHECK (amount_type IN ('fixed', 'percentage', 'remaining', 'time_based')),
    amount_value NUMERIC(12,2),
    due_days INTEGER DEFAULT 30,
    auto_send BOOLEAN DEFAULT FALSE,

    -- Scope
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,

    -- Metadata
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_auto_rules_org ON invoice_automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_auto_rules_active ON invoice_automation_rules(organization_id, is_active)
    WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_invoice_auto_rules_trigger ON invoice_automation_rules(trigger_type);

-- ============================================================================
-- STEP 5: ABSENCE-TO-RESOURCE PLANNER SYNC
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_absence_to_resource_planner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- When a leave request is approved, create booking conflicts
    IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
        -- Find overlapping resource bookings
        INSERT INTO booking_conflicts (
            id, organization_id, booking_id, conflicting_booking_id,
            conflict_type, severity, auto_detected
        )
        SELECT
            uuid_generate_v4(),
            rb.organization_id,
            rb.id,
            NULL, -- No conflicting booking, it's a leave conflict
            'leave_overlap',
            'high',
            TRUE
        FROM resource_bookings rb
        WHERE rb.user_id = NEW.user_id
          AND rb.organization_id = NEW.organization_id
          AND rb.status IN ('confirmed', 'tentative')
          AND rb.start_date <= NEW.end_date
          AND rb.end_date >= NEW.start_date
          AND NOT EXISTS (
              SELECT 1 FROM booking_conflicts bc
              WHERE bc.booking_id = rb.id
                AND bc.conflict_type = 'leave_overlap'
          );

        -- Optionally mark affected bookings as having a conflict
        UPDATE resource_bookings
        SET has_conflict = TRUE, updated_at = NOW()
        WHERE user_id = NEW.user_id
          AND organization_id = NEW.organization_id
          AND status IN ('confirmed', 'tentative')
          AND start_date <= NEW.end_date
          AND end_date >= NEW.start_date;
    END IF;

    -- When a leave request is cancelled/rejected, remove the conflicts
    IF NEW.status IN ('rejected', 'cancelled') AND OLD.status = 'approved' THEN
        DELETE FROM booking_conflicts
        WHERE booking_id IN (
            SELECT rb.id FROM resource_bookings rb
            WHERE rb.user_id = NEW.user_id
              AND rb.organization_id = NEW.organization_id
              AND rb.start_date <= OLD.end_date
              AND rb.end_date >= OLD.start_date
        )
        AND conflict_type = 'leave_overlap';

        -- Re-check if bookings still have other conflicts
        UPDATE resource_bookings
        SET has_conflict = EXISTS (
            SELECT 1 FROM booking_conflicts bc WHERE bc.booking_id = resource_bookings.id
        ),
        updated_at = NOW()
        WHERE user_id = NEW.user_id
          AND organization_id = NEW.organization_id
          AND start_date <= OLD.end_date
          AND end_date >= OLD.start_date;
    END IF;

    RETURN NEW;
END;
$$;

-- Apply trigger to leave_requests table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sync_absence_resource'
    ) THEN
DROP TRIGGER IF EXISTS trg_sync_absence_resource ON leave_requests;
        CREATE TRIGGER trg_sync_absence_resource
            AFTER UPDATE ON leave_requests
            FOR EACH ROW
            EXECUTE FUNCTION sync_absence_to_resource_planner();
    END IF;
END $$;

-- ============================================================================
-- STEP 6: MULTI-ENTITY / PASS-THROUGH INVOICING
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'source_quote_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS source_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS source_settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_pass_through BOOLEAN DEFAULT FALSE;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pass_through_markup_pct NUMERIC(5,2) DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: VENDOR SPEND ANALYSIS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION report_vendor_spend(
    p_organization_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    vendor_id UUID,
    vendor_name TEXT,
    total_pos BIGINT,
    total_po_amount NUMERIC,
    total_invoices BIGINT,
    total_invoice_amount NUMERIC,
    total_payments NUMERIC,
    outstanding_amount NUMERIC,
    avg_payment_days NUMERIC,
    on_time_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end DATE := COALESCE(p_end_date, CURRENT_DATE);
BEGIN
    RETURN QUERY
    SELECT
        v.id AS vendor_id,
        v.name::TEXT AS vendor_name,
        COUNT(DISTINCT po.id) AS total_pos,
        COALESCE(SUM(DISTINCT po.total_amount), 0) AS total_po_amount,
        COUNT(DISTINCT i.id) AS total_invoices,
        COALESCE(SUM(DISTINCT i.total_amount), 0) AS total_invoice_amount,
        COALESCE(SUM(p.amount), 0) AS total_payments,
        COALESCE(SUM(DISTINCT i.total_amount), 0) - COALESCE(SUM(p.amount), 0) AS outstanding_amount,
        AVG(EXTRACT(EPOCH FROM (p.payment_date - i.created_at)) / 86400)::NUMERIC AS avg_payment_days,
        CASE WHEN COUNT(DISTINCT i.id) > 0
            THEN (COUNT(DISTINCT CASE WHEN i.status = 'paid' AND i.paid_at <= i.due_date THEN i.id END)::NUMERIC
                  / COUNT(DISTINCT i.id) * 100)
            ELSE 0
        END AS on_time_pct
    FROM vendors v
    LEFT JOIN purchase_orders po ON po.vendor_id = v.id
        AND po.organization_id = p_organization_id
        AND po.created_at BETWEEN v_start AND v_end
    LEFT JOIN invoices i ON i.vendor_id = v.id
        AND i.organization_id = p_organization_id
        AND i.direction = 'incoming'
        AND i.created_at BETWEEN v_start AND v_end
    LEFT JOIN payments p ON p.invoice_id = i.id
    WHERE v.organization_id = p_organization_id
    GROUP BY v.id, v.name
    HAVING COUNT(DISTINCT po.id) > 0 OR COUNT(DISTINCT i.id) > 0
    ORDER BY total_invoice_amount DESC;
END;
$$;

-- ============================================================================
-- STEP 8: RLS POLICIES
-- ============================================================================

ALTER TABLE invoice_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoice_deliveries_org_isolation ON invoice_deliveries
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY invoice_auto_rules_org_isolation ON invoice_automation_rules
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
