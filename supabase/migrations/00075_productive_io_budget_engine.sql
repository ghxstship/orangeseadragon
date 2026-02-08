-- Migration: Productive.io Budget Engine Parity
-- Created: 2026-02-07
-- Description: Adds budget types, phases, templates, alert thresholds,
--              production-specific categories, profitability tracking,
--              and payment milestones for progressive billing.

-- ============================================================================
-- STEP 1: BUDGET TYPE ENUM & COLUMN
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_pricing_type') THEN
        CREATE TYPE budget_pricing_type AS ENUM (
            'fixed_price',
            'time_and_materials',
            'retainer',
            'hybrid',
            'cost_plus'
        );
    END IF;
END $$;

-- Add budget_type to budgets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'budget_type'
    ) THEN
        ALTER TABLE budgets ADD COLUMN budget_type budget_pricing_type DEFAULT 'fixed_price';
    END IF;
END $$;

-- Add parent_budget_id for hierarchical budgets (per-show vs. tour roll-ups)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'parent_budget_id'
    ) THEN
        ALTER TABLE budgets ADD COLUMN parent_budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add alert threshold columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'alert_threshold_warning'
    ) THEN
        ALTER TABLE budgets ADD COLUMN alert_threshold_warning DECIMAL(5,2) DEFAULT 75.00;
        ALTER TABLE budgets ADD COLUMN alert_threshold_critical DECIMAL(5,2) DEFAULT 90.00;
        ALTER TABLE budgets ADD COLUMN alert_threshold_exceeded DECIMAL(5,2) DEFAULT 100.00;
    END IF;
END $$;

-- Add markup/agency fee fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'markup_type'
    ) THEN
        ALTER TABLE budgets ADD COLUMN markup_type VARCHAR(20) DEFAULT 'percentage' 
            CHECK (markup_type IN ('percentage', 'flat_fee', 'cost_plus', 'none'));
        ALTER TABLE budgets ADD COLUMN markup_value DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE budgets ADD COLUMN agency_fee_amount DECIMAL(14,2) DEFAULT 0;
    END IF;
END $$;

-- Add retainer fields
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'retainer_amount'
    ) THEN
        ALTER TABLE budgets ADD COLUMN retainer_amount DECIMAL(14,2);
        ALTER TABLE budgets ADD COLUMN retainer_hours DECIMAL(8,2);
        ALTER TABLE budgets ADD COLUMN retainer_period VARCHAR(20) 
            CHECK (retainer_period IN ('weekly', 'monthly', 'quarterly', 'annually'));
        ALTER TABLE budgets ADD COLUMN retainer_rollover BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add revenue/profitability tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'revenue_amount'
    ) THEN
        ALTER TABLE budgets ADD COLUMN revenue_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE budgets ADD COLUMN cost_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE budgets ADD COLUMN profit_amount DECIMAL(14,2) GENERATED ALWAYS AS (revenue_amount - cost_amount) STORED;
        ALTER TABLE budgets ADD COLUMN profit_margin DECIMAL(5,2);
    END IF;
END $$;

-- Add invoicing status tracking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'invoiced_amount'
    ) THEN
        ALTER TABLE budgets ADD COLUMN invoiced_amount DECIMAL(14,2) DEFAULT 0;
        ALTER TABLE budgets ADD COLUMN draft_invoice_amount DECIMAL(14,2) DEFAULT 0;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_parent ON budgets(parent_budget_id);
CREATE INDEX IF NOT EXISTS idx_budgets_type ON budgets(budget_type);

-- ============================================================================
-- STEP 2: BUDGET PHASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phase_order INTEGER NOT NULL DEFAULT 0,
    start_date DATE,
    end_date DATE,
    planned_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(14,2) DEFAULT 0,
    variance DECIMAL(14,2) GENERATED ALWAYS AS (planned_amount - actual_amount) STORED,
    status VARCHAR(20) DEFAULT 'planned' 
        CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    production_phase VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_phases_budget ON budget_phases(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_phases_status ON budget_phases(status);
CREATE INDEX IF NOT EXISTS idx_budget_phases_order ON budget_phases(budget_id, phase_order);

-- ============================================================================
-- STEP 3: BUDGET TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget_type budget_pricing_type DEFAULT 'fixed_price',
    production_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    template_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_budget_templates_org ON budget_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_templates_type ON budget_templates(production_type);

-- Budget template line items
CREATE TABLE IF NOT EXISTS budget_template_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES budget_templates(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_amount DECIMAL(14,2),
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_of VARCHAR(50),
    phase_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_template_items_template ON budget_template_line_items(template_id);

-- ============================================================================
-- STEP 4: PAYMENT MILESTONES (Progressive Billing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_order INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2),
    fixed_amount DECIMAL(14,2),
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'manual'
        CHECK (trigger_type IN ('manual', 'date', 'phase_completion', 'deliverable', 'event_date')),
    trigger_date DATE,
    trigger_phase VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'ready', 'invoiced', 'paid', 'cancelled')),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_milestones_budget ON payment_milestones(budget_id);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_status ON payment_milestones(status);
CREATE INDEX IF NOT EXISTS idx_payment_milestones_invoice ON payment_milestones(invoice_id);

-- ============================================================================
-- STEP 5: PRODUCTION-SPECIFIC BUDGET CATEGORIES (Seed Data)
-- ============================================================================

-- Insert production-specific budget categories if they don't exist
INSERT INTO budget_categories (id, organization_id, name, slug, description, category_type, code, is_active)
SELECT 
    uuid_generate_v4(),
    o.id,
    cat.name,
    cat.slug,
    cat.description,
    cat.category_type::budget_category_type,
    cat.code,
    TRUE
FROM organizations o
CROSS JOIN (VALUES
    ('Talent', 'production-talent', 'Artist fees, performer fees, speaker fees', 'expense', 'PROD-TAL'),
    ('Labor - Crew', 'production-labor-crew', 'Stagehand, rigger, electrician, carpenter labor', 'expense', 'PROD-LAB'),
    ('Labor - Staff', 'production-labor-staff', 'Event staff, security, ushers, runners', 'expense', 'PROD-STF'),
    ('Equipment Rental', 'production-equipment-rental', 'Audio, lighting, video, staging equipment rental', 'expense', 'PROD-EQP'),
    ('Venue', 'production-venue', 'Venue rental, facility fees, utilities', 'expense', 'PROD-VEN'),
    ('Catering', 'production-catering', 'Crew meals, green room, hospitality, craft services', 'expense', 'PROD-CAT'),
    ('Transportation', 'production-transportation', 'Trucking, buses, vans, fuel, tolls', 'expense', 'PROD-TRN'),
    ('Lodging', 'production-lodging', 'Hotels, housing for crew and talent', 'expense', 'PROD-LDG'),
    ('Production Supplies', 'production-supplies', 'Consumables, tape, cable, hardware', 'expense', 'PROD-SUP'),
    ('Permits & Insurance', 'production-permits-insurance', 'City permits, fire marshal, liability insurance, COIs', 'expense', 'PROD-PRM'),
    ('Contingency', 'production-contingency', 'Budget contingency reserve (typically 10-15%)', 'expense', 'PROD-CTG'),
    ('Agency Fee', 'production-agency-fee', 'Production management fee, agency markup', 'income', 'PROD-FEE'),
    ('Client Revenue', 'production-client-revenue', 'Client contract value, sponsorship revenue', 'income', 'PROD-REV'),
    ('Décor & Scenic', 'production-decor-scenic', 'Set design, scenic elements, floral, props', 'expense', 'PROD-DEC'),
    ('Marketing & Collateral', 'production-marketing', 'Signage, print, digital assets, swag', 'expense', 'PROD-MKT'),
    ('Weather Contingency', 'production-weather', 'Weather insurance, backup plans, tent/cover costs', 'expense', 'PROD-WTH')
) AS cat(name, slug, description, category_type, code)
WHERE NOT EXISTS (
    SELECT 1 FROM budget_categories bc 
    WHERE bc.organization_id = o.id AND bc.slug = cat.slug
);

-- ============================================================================
-- STEP 6: BUDGET PROFITABILITY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW budget_profitability AS
SELECT 
    b.id,
    b.organization_id,
    b.name,
    b.project_id,
    b.event_id,
    b.budget_type,
    b.total_amount,
    b.revenue_amount,
    b.cost_amount,
    b.profit_amount,
    b.profit_margin,
    b.invoiced_amount,
    b.draft_invoice_amount,
    b.total_amount - COALESCE(b.invoiced_amount, 0) - COALESCE(b.draft_invoice_amount, 0) AS available_to_invoice,
    COALESCE(SUM(bli.actual_amount), 0) AS total_actual_spend,
    COALESCE(SUM(bli.planned_amount), 0) AS total_planned_spend,
    CASE 
        WHEN b.total_amount > 0 THEN ROUND((COALESCE(SUM(bli.actual_amount), 0) / b.total_amount) * 100, 2)
        ELSE 0 
    END AS burn_percentage,
    CASE 
        WHEN b.total_amount > 0 AND COALESCE(SUM(bli.actual_amount), 0) / b.total_amount >= b.alert_threshold_exceeded / 100 THEN 'exceeded'
        WHEN b.total_amount > 0 AND COALESCE(SUM(bli.actual_amount), 0) / b.total_amount >= b.alert_threshold_critical / 100 THEN 'critical'
        WHEN b.total_amount > 0 AND COALESCE(SUM(bli.actual_amount), 0) / b.total_amount >= b.alert_threshold_warning / 100 THEN 'warning'
        ELSE 'healthy'
    END AS health_status,
    b.status,
    b.start_date,
    b.end_date,
    b.created_at
FROM budgets b
LEFT JOIN budget_line_items bli ON bli.budget_id = b.id
GROUP BY b.id;

-- ============================================================================
-- STEP 7: BUDGET BURN RATE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    planned_cumulative DECIMAL(14,2) NOT NULL DEFAULT 0,
    actual_cumulative DECIMAL(14,2) NOT NULL DEFAULT 0,
    committed_amount DECIMAL(14,2) DEFAULT 0,
    forecast_at_completion DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_snapshots_budget ON budget_snapshots(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_snapshots_date ON budget_snapshots(budget_id, snapshot_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_snapshots_unique ON budget_snapshots(budget_id, snapshot_date);

-- ============================================================================
-- STEP 8: RLS POLICIES
-- ============================================================================

-- Budget phases
ALTER TABLE budget_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_phases_org_isolation ON budget_phases
    USING (
        budget_id IN (
            SELECT id FROM budgets WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Budget templates
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_templates_org_isolation ON budget_templates
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

-- Budget template line items
ALTER TABLE budget_template_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_template_items_org_isolation ON budget_template_line_items
    USING (
        template_id IN (
            SELECT id FROM budget_templates WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Payment milestones
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_milestones_org_isolation ON payment_milestones
    USING (
        budget_id IN (
            SELECT id FROM budgets WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Budget snapshots
ALTER TABLE budget_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_snapshots_org_isolation ON budget_snapshots
    USING (
        budget_id IN (
            SELECT id FROM budgets WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- ============================================================================
-- STEP 9: TRIGGERS FOR BUDGET HEALTH MONITORING
-- ============================================================================

-- Function to update budget totals when line items change
CREATE OR REPLACE FUNCTION update_budget_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE budgets SET
        cost_amount = (
            SELECT COALESCE(SUM(actual_amount), 0) 
            FROM budget_line_items 
            WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_budget_line_item_totals ON budget_line_items;
CREATE TRIGGER trg_budget_line_item_totals
    AFTER INSERT OR UPDATE OR DELETE ON budget_line_items
    FOR EACH ROW EXECUTE FUNCTION update_budget_totals();

-- Function to update budget invoiced amounts when invoices change
CREATE OR REPLACE FUNCTION update_budget_invoiced_amounts()
RETURNS TRIGGER AS $$
DECLARE
    v_budget_id UUID;
BEGIN
    -- Get budget_id from the project on the invoice
    SELECT b.id INTO v_budget_id
    FROM budgets b
    WHERE b.project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND b.status = 'active'
    LIMIT 1;
    
    IF v_budget_id IS NOT NULL THEN
        UPDATE budgets SET
            invoiced_amount = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM invoices 
                WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
                AND status IN ('sent', 'viewed', 'partially_paid', 'paid')
            ),
            draft_invoice_amount = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM invoices 
                WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
                AND status = 'draft'
            ),
            updated_at = NOW()
        WHERE id = v_budget_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_invoice_budget_sync ON invoices;
CREATE TRIGGER trg_invoice_budget_sync
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_budget_invoiced_amounts();
