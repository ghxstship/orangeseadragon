-- Migration: Phase 3 — Production Automation & Finance Extras
-- Created: 2026-02-07
-- Description: Call sheet auto-generation, wrap reports, budget roll-ups,
--              variance analysis, PO-to-invoice matching, invoice email delivery,
--              equipment ROI, venue performance metrics

-- ============================================================================
-- STEP 1: CALL SHEET AUTO-GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_call_sheet(
    p_production_id UUID,
    p_date DATE,
    p_organization_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_call_sheet_id UUID;
    v_production RECORD;
BEGIN
    -- Get production details
    SELECT * INTO v_production
    FROM productions
    WHERE id = p_production_id AND organization_id = p_organization_id;

    IF v_production IS NULL THEN
        RAISE EXCEPTION 'Production not found';
    END IF;

    -- Create the crew call record
    INSERT INTO crew_calls (
        id, organization_id, production_id, call_date,
        title, status, general_notes
    ) VALUES (
        uuid_generate_v4(), p_organization_id, p_production_id, p_date,
        v_production.name || ' — Call Sheet ' || p_date::TEXT,
        'draft',
        'Auto-generated call sheet'
    ) RETURNING id INTO v_call_sheet_id;

    -- Populate crew call entries from resource bookings for that date
    INSERT INTO crew_call_entries (
        id, crew_call_id, employee_id, role, call_time, notes
    )
    SELECT
        uuid_generate_v4(),
        v_call_sheet_id,
        rb.user_id,
        rb.role,
        rb.start_time::TIME,
        'Auto-populated from resource booking'
    FROM resource_bookings rb
    WHERE rb.project_id = p_production_id
      AND rb.organization_id = p_organization_id
      AND rb.start_date <= p_date
      AND rb.end_date >= p_date
      AND rb.status IN ('confirmed', 'tentative');

    RETURN v_call_sheet_id;
END;
$$;

-- ============================================================================
-- STEP 2: WRAP / FINAL COST REPORT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_wrap_report(
    p_project_id UUID,
    p_organization_id UUID
)
RETURNS TABLE (
    project_name TEXT,
    project_status TEXT,
    budget_total NUMERIC,
    actual_total NUMERIC,
    variance NUMERIC,
    variance_pct NUMERIC,
    labor_cost NUMERIC,
    equipment_cost NUMERIC,
    vendor_cost NUMERIC,
    travel_cost NUMERIC,
    other_cost NUMERIC,
    revenue_total NUMERIC,
    profit NUMERIC,
    profit_margin NUMERIC,
    total_hours_logged NUMERIC,
    total_crew_count BIGINT,
    invoice_total NUMERIC,
    invoice_paid NUMERIC,
    invoice_outstanding NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name::TEXT AS project_name,
        p.status::TEXT AS project_status,
        COALESCE(b.total_budget, 0) AS budget_total,
        COALESCE(b.total_spent, 0) AS actual_total,
        COALESCE(b.total_budget, 0) - COALESCE(b.total_spent, 0) AS variance,
        CASE WHEN COALESCE(b.total_budget, 0) > 0
            THEN ((COALESCE(b.total_budget, 0) - COALESCE(b.total_spent, 0)) / b.total_budget * 100)
            ELSE 0
        END AS variance_pct,
        COALESCE(costs.labor, 0) AS labor_cost,
        COALESCE(costs.equipment, 0) AS equipment_cost,
        COALESCE(costs.vendor, 0) AS vendor_cost,
        COALESCE(costs.travel, 0) AS travel_cost,
        COALESCE(costs.other, 0) AS other_cost,
        COALESCE(rev.total, 0) AS revenue_total,
        COALESCE(rev.total, 0) - COALESCE(b.total_spent, 0) AS profit,
        CASE WHEN COALESCE(rev.total, 0) > 0
            THEN ((COALESCE(rev.total, 0) - COALESCE(b.total_spent, 0)) / rev.total * 100)
            ELSE 0
        END AS profit_margin,
        COALESCE(hours.total, 0) AS total_hours_logged,
        COALESCE(crew.cnt, 0) AS total_crew_count,
        COALESCE(inv.total, 0) AS invoice_total,
        COALESCE(inv.paid, 0) AS invoice_paid,
        COALESCE(inv.total, 0) - COALESCE(inv.paid, 0) AS invoice_outstanding
    FROM projects p
    LEFT JOIN budgets b ON b.project_id = p.id AND b.organization_id = p_organization_id
    LEFT JOIN LATERAL (
        SELECT
            SUM(CASE WHEN e.category = 'labor' THEN e.amount ELSE 0 END) AS labor,
            SUM(CASE WHEN e.category = 'equipment' THEN e.amount ELSE 0 END) AS equipment,
            SUM(CASE WHEN e.category = 'vendor' THEN e.amount ELSE 0 END) AS vendor,
            SUM(CASE WHEN e.category = 'travel' THEN e.amount ELSE 0 END) AS travel,
            SUM(CASE WHEN e.category NOT IN ('labor', 'equipment', 'vendor', 'travel') THEN e.amount ELSE 0 END) AS other
        FROM expenses e
        WHERE e.project_id = p.id AND e.organization_id = p_organization_id
    ) costs ON TRUE
    LEFT JOIN LATERAL (
        SELECT SUM(i.total_amount) AS total
        FROM invoices i
        WHERE i.project_id = p.id
          AND i.organization_id = p_organization_id
          AND i.direction = 'outgoing'
    ) rev ON TRUE
    LEFT JOIN LATERAL (
        SELECT SUM(te.hours) AS total
        FROM time_entries te
        WHERE te.project_id = p.id AND te.organization_id = p_organization_id
    ) hours ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(DISTINCT pr.user_id) AS cnt
        FROM project_resources pr
        WHERE pr.project_id = p.id
    ) crew ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            SUM(i.total_amount) AS total,
            SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) AS paid
        FROM invoices i
        WHERE i.project_id = p.id
          AND i.organization_id = p_organization_id
          AND i.direction = 'outgoing'
    ) inv ON TRUE
    WHERE p.id = p_project_id AND p.organization_id = p_organization_id;
END;
$$;

-- ============================================================================
-- STEP 3: BUDGET VARIANCE ANALYSIS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION report_budget_variance(
    p_organization_id UUID,
    p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    category TEXT,
    budgeted NUMERIC,
    actual NUMERIC,
    variance NUMERIC,
    variance_pct NUMERIC,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS project_id,
        p.name::TEXT AS project_name,
        COALESCE(bli.category, 'uncategorized')::TEXT AS category,
        COALESCE(SUM(bli.amount), 0) AS budgeted,
        COALESCE(SUM(e.amount), 0) AS actual,
        COALESCE(SUM(bli.amount), 0) - COALESCE(SUM(e.amount), 0) AS variance,
        CASE WHEN COALESCE(SUM(bli.amount), 0) > 0
            THEN ((COALESCE(SUM(bli.amount), 0) - COALESCE(SUM(e.amount), 0)) / SUM(bli.amount) * 100)
            ELSE 0
        END AS variance_pct,
        CASE
            WHEN COALESCE(SUM(e.amount), 0) > COALESCE(SUM(bli.amount), 0) * 1.1 THEN 'over_budget'
            WHEN COALESCE(SUM(e.amount), 0) > COALESCE(SUM(bli.amount), 0) * 0.9 THEN 'at_risk'
            ELSE 'on_track'
        END::TEXT AS status
    FROM projects p
    JOIN budgets b ON b.project_id = p.id AND b.organization_id = p_organization_id
    LEFT JOIN budget_line_items bli ON bli.budget_id = b.id
    LEFT JOIN expenses e ON e.project_id = p.id
        AND e.organization_id = p_organization_id
        AND e.category = bli.category
    WHERE p.organization_id = p_organization_id
      AND (p_project_id IS NULL OR p.id = p_project_id)
    GROUP BY p.id, p.name, bli.category
    ORDER BY p.name, bli.category;
END;
$$;

-- ============================================================================
-- STEP 4: HIERARCHICAL BUDGET ROLL-UPS
-- ============================================================================

CREATE OR REPLACE FUNCTION report_budget_rollup(
    p_organization_id UUID,
    p_parent_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    parent_project_id UUID,
    depth INTEGER,
    own_budget NUMERIC,
    own_spent NUMERIC,
    rolled_up_budget NUMERIC,
    rolled_up_spent NUMERIC,
    rolled_up_variance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE project_tree AS (
        -- Base: top-level projects (or specific parent)
        SELECT p.id, p.name::TEXT, p.parent_id, 0 AS depth
        FROM projects p
        WHERE p.organization_id = p_organization_id
          AND (p_parent_project_id IS NULL AND p.parent_id IS NULL
               OR p.id = p_parent_project_id)

        UNION ALL

        -- Recursive: child projects
        SELECT p.id, p.name::TEXT, p.parent_id, pt.depth + 1
        FROM projects p
        JOIN project_tree pt ON p.parent_id = pt.id
        WHERE p.organization_id = p_organization_id
    ),
    project_budgets AS (
        SELECT
            pt.id AS project_id,
            pt.name AS project_name,
            pt.parent_id AS parent_project_id,
            pt.depth,
            COALESCE(b.total_budget, 0) AS own_budget,
            COALESCE(b.total_spent, 0) AS own_spent
        FROM project_tree pt
        LEFT JOIN budgets b ON b.project_id = pt.id AND b.organization_id = p_organization_id
    )
    SELECT
        pb.project_id,
        pb.project_name,
        pb.parent_project_id,
        pb.depth,
        pb.own_budget,
        pb.own_spent,
        pb.own_budget + COALESCE(children.child_budget, 0) AS rolled_up_budget,
        pb.own_spent + COALESCE(children.child_spent, 0) AS rolled_up_spent,
        (pb.own_budget + COALESCE(children.child_budget, 0)) -
        (pb.own_spent + COALESCE(children.child_spent, 0)) AS rolled_up_variance
    FROM project_budgets pb
    LEFT JOIN LATERAL (
        SELECT
            SUM(pb2.own_budget) AS child_budget,
            SUM(pb2.own_spent) AS child_spent
        FROM project_budgets pb2
        WHERE pb2.parent_project_id = pb.project_id
    ) children ON TRUE
    ORDER BY pb.depth, pb.project_name;
END;
$$;

-- ============================================================================
-- STEP 5: PO-TO-INVOICE MATCHING
-- ============================================================================

CREATE TABLE IF NOT EXISTS po_invoice_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    match_status VARCHAR(20) DEFAULT 'pending'
        CHECK (match_status IN ('pending', 'matched', 'partial', 'disputed', 'resolved')),
    po_amount NUMERIC(12,2),
    invoice_amount NUMERIC(12,2),
    variance NUMERIC(12,2),
    variance_pct NUMERIC(6,2),
    matched_at TIMESTAMPTZ,
    matched_by UUID REFERENCES users(id) ON DELETE SET NULL,
    dispute_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_po_invoice_match UNIQUE (purchase_order_id, invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_po_invoice_matches_org ON po_invoice_matches(organization_id);
CREATE INDEX IF NOT EXISTS idx_po_invoice_matches_po ON po_invoice_matches(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_invoice_matches_invoice ON po_invoice_matches(invoice_id);
CREATE INDEX IF NOT EXISTS idx_po_invoice_matches_status ON po_invoice_matches(match_status);

-- Auto-match function
CREATE OR REPLACE FUNCTION auto_match_po_invoices(
    p_organization_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_matched INTEGER := 0;
    v_po RECORD;
    v_invoice RECORD;
BEGIN
    FOR v_po IN
        SELECT po.id, po.total_amount, po.vendor_id
        FROM purchase_orders po
        WHERE po.organization_id = p_organization_id
          AND po.status = 'approved'
          AND NOT EXISTS (
              SELECT 1 FROM po_invoice_matches m WHERE m.purchase_order_id = po.id AND m.match_status = 'matched'
          )
    LOOP
        -- Find matching incoming invoice by vendor and similar amount (within 5%)
        SELECT i.* INTO v_invoice
        FROM invoices i
        WHERE i.organization_id = p_organization_id
          AND i.direction = 'incoming'
          AND i.vendor_id = v_po.vendor_id
          AND ABS(i.total_amount - v_po.total_amount) / GREATEST(v_po.total_amount, 0.01) <= 0.05
          AND NOT EXISTS (
              SELECT 1 FROM po_invoice_matches m WHERE m.invoice_id = i.id AND m.match_status = 'matched'
          )
        ORDER BY ABS(i.total_amount - v_po.total_amount) ASC
        LIMIT 1;

        IF v_invoice IS NOT NULL THEN
            INSERT INTO po_invoice_matches (
                organization_id, purchase_order_id, invoice_id,
                match_status, po_amount, invoice_amount,
                variance, variance_pct, matched_at
            ) VALUES (
                p_organization_id, v_po.id, v_invoice.id,
                CASE WHEN v_invoice.total_amount = v_po.total_amount THEN 'matched' ELSE 'partial' END,
                v_po.total_amount, v_invoice.total_amount,
                v_po.total_amount - v_invoice.total_amount,
                CASE WHEN v_po.total_amount > 0
                    THEN ((v_po.total_amount - v_invoice.total_amount) / v_po.total_amount * 100)
                    ELSE 0
                END,
                NOW()
            ) ON CONFLICT (purchase_order_id, invoice_id) DO NOTHING;

            v_matched := v_matched + 1;
        END IF;
    END LOOP;

    RETURN v_matched;
END;
$$;

-- ============================================================================
-- STEP 6: EQUIPMENT ROI TRACKING
-- ============================================================================

CREATE OR REPLACE FUNCTION report_equipment_roi(
    p_organization_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    asset_id UUID,
    asset_name TEXT,
    purchase_cost NUMERIC,
    total_rental_revenue NUMERIC,
    total_maintenance_cost NUMERIC,
    total_bookings BIGINT,
    total_days_used BIGINT,
    utilization_pct NUMERIC,
    roi_pct NUMERIC,
    cost_per_use NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start DATE := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '1 year');
    v_end DATE := COALESCE(p_end_date, CURRENT_DATE);
    v_total_days INTEGER := v_end - v_start + 1;
BEGIN
    RETURN QUERY
    SELECT
        a.id AS asset_id,
        a.name::TEXT AS asset_name,
        COALESCE(a.purchase_price, 0) AS purchase_cost,
        COALESCE(revenue.total, 0) AS total_rental_revenue,
        COALESCE(maint.total, 0) AS total_maintenance_cost,
        COALESCE(usage.booking_count, 0) AS total_bookings,
        COALESCE(usage.days_used, 0) AS total_days_used,
        CASE WHEN v_total_days > 0
            THEN (COALESCE(usage.days_used, 0)::NUMERIC / v_total_days * 100)
            ELSE 0
        END AS utilization_pct,
        CASE WHEN COALESCE(a.purchase_price, 0) > 0
            THEN ((COALESCE(revenue.total, 0) - COALESCE(maint.total, 0)) / a.purchase_price * 100)
            ELSE 0
        END AS roi_pct,
        CASE WHEN COALESCE(usage.booking_count, 0) > 0
            THEN (COALESCE(a.purchase_price, 0) + COALESCE(maint.total, 0)) / usage.booking_count
            ELSE 0
        END AS cost_per_use
    FROM assets a
    LEFT JOIN LATERAL (
        SELECT SUM(e.amount) AS total
        FROM expenses e
        WHERE e.asset_id = a.id
          AND e.category = 'maintenance'
          AND e.expense_date BETWEEN v_start AND v_end
    ) maint ON TRUE
    LEFT JOIN LATERAL (
        SELECT SUM(bli.amount) AS total
        FROM budget_line_items bli
        WHERE bli.asset_id = a.id
          AND bli.category = 'equipment_rental'
    ) revenue ON TRUE
    LEFT JOIN LATERAL (
        SELECT
            COUNT(*) AS booking_count,
            SUM(LEAST(rb.end_date, v_end) - GREATEST(rb.start_date, v_start) + 1) AS days_used
        FROM resource_bookings rb
        WHERE rb.asset_id = a.id
          AND rb.start_date <= v_end
          AND rb.end_date >= v_start
          AND rb.status = 'confirmed'
    ) usage ON TRUE
    WHERE a.organization_id = p_organization_id
    ORDER BY roi_pct DESC NULLS LAST;
END;
$$;

-- ============================================================================
-- STEP 7: VENUE PERFORMANCE METRICS
-- ============================================================================

CREATE OR REPLACE FUNCTION report_venue_performance(
    p_organization_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    venue_id UUID,
    venue_name TEXT,
    total_events BIGINT,
    total_revenue NUMERIC,
    total_cost NUMERIC,
    avg_profit_per_event NUMERIC,
    avg_attendance NUMERIC,
    repeat_client_pct NUMERIC,
    avg_rating NUMERIC
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
        v.id AS venue_id,
        v.name::TEXT AS venue_name,
        COUNT(DISTINCT e.id) AS total_events,
        COALESCE(SUM(inv.total_amount), 0) AS total_revenue,
        COALESCE(SUM(exp.amount), 0) AS total_cost,
        CASE WHEN COUNT(DISTINCT e.id) > 0
            THEN (COALESCE(SUM(inv.total_amount), 0) - COALESCE(SUM(exp.amount), 0)) / COUNT(DISTINCT e.id)
            ELSE 0
        END AS avg_profit_per_event,
        AVG(e.expected_attendance)::NUMERIC AS avg_attendance,
        0::NUMERIC AS repeat_client_pct, -- Placeholder for future enrichment
        COALESCE(AVG(f.rating), 0)::NUMERIC AS avg_rating
    FROM venues v
    LEFT JOIN events e ON e.venue_id = v.id
        AND e.organization_id = p_organization_id
        AND e.start_date BETWEEN v_start AND v_end
    LEFT JOIN invoices inv ON inv.project_id = e.project_id
        AND inv.direction = 'outgoing'
    LEFT JOIN expenses exp ON exp.project_id = e.project_id
    LEFT JOIN feedback f ON f.entity_type = 'venue' AND f.entity_id = v.id
    WHERE v.organization_id = p_organization_id
    GROUP BY v.id, v.name
    ORDER BY total_events DESC;
END;
$$;

-- ============================================================================
-- STEP 8: YEAR-OVER-YEAR COMPARISON FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION report_year_over_year(
    p_organization_id UUID,
    p_metric VARCHAR DEFAULT 'revenue',
    p_years INTEGER DEFAULT 3
)
RETURNS TABLE (
    year INTEGER,
    month INTEGER,
    month_name TEXT,
    current_value NUMERIC,
    previous_year_value NUMERIC,
    yoy_change NUMERIC,
    yoy_change_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_metric = 'revenue' THEN
        RETURN QUERY
        WITH monthly AS (
            SELECT
                EXTRACT(YEAR FROM i.created_at)::INTEGER AS yr,
                EXTRACT(MONTH FROM i.created_at)::INTEGER AS mo,
                TO_CHAR(i.created_at, 'Mon') AS mo_name,
                SUM(i.total_amount) AS total
            FROM invoices i
            WHERE i.organization_id = p_organization_id
              AND i.direction = 'outgoing'
              AND i.created_at >= (CURRENT_DATE - (p_years || ' years')::INTERVAL)
            GROUP BY yr, mo, mo_name
        )
        SELECT
            m.yr,
            m.mo,
            m.mo_name,
            m.total AS current_value,
            COALESCE(prev.total, 0) AS previous_year_value,
            m.total - COALESCE(prev.total, 0) AS yoy_change,
            CASE WHEN COALESCE(prev.total, 0) > 0
                THEN ((m.total - prev.total) / prev.total * 100)
                ELSE 0
            END AS yoy_change_pct
        FROM monthly m
        LEFT JOIN monthly prev ON prev.yr = m.yr - 1 AND prev.mo = m.mo
        ORDER BY m.yr, m.mo;
    ELSIF p_metric = 'expenses' THEN
        RETURN QUERY
        WITH monthly AS (
            SELECT
                EXTRACT(YEAR FROM e.expense_date)::INTEGER AS yr,
                EXTRACT(MONTH FROM e.expense_date)::INTEGER AS mo,
                TO_CHAR(e.expense_date, 'Mon') AS mo_name,
                SUM(e.amount) AS total
            FROM expenses e
            WHERE e.organization_id = p_organization_id
              AND e.expense_date >= (CURRENT_DATE - (p_years || ' years')::INTERVAL)
            GROUP BY yr, mo, mo_name
        )
        SELECT
            m.yr,
            m.mo,
            m.mo_name,
            m.total AS current_value,
            COALESCE(prev.total, 0) AS previous_year_value,
            m.total - COALESCE(prev.total, 0) AS yoy_change,
            CASE WHEN COALESCE(prev.total, 0) > 0
                THEN ((m.total - prev.total) / prev.total * 100)
                ELSE 0
            END AS yoy_change_pct
        FROM monthly m
        LEFT JOIN monthly prev ON prev.yr = m.yr - 1 AND prev.mo = m.mo
        ORDER BY m.yr, m.mo;
    END IF;
END;
$$;

-- ============================================================================
-- STEP 9: RLS POLICIES
-- ============================================================================

ALTER TABLE po_invoice_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY po_invoice_matches_org_isolation ON po_invoice_matches
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
