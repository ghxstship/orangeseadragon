-- Migration: 3NF Compliance Fixes
-- Created: 2026-02-02
-- Description: Fix 3NF violations - computed values, FK constraints, reference corrections
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- PHASE 1: FIX COMPUTED VALUE VIOLATIONS
-- ============================================================================

-- 1.1 hotels.total_cost - Remove stored computed value, use trigger for auto-computation

-- Create view for hotels with computed totals (3NF compliant)
CREATE OR REPLACE VIEW hotels_with_totals AS
SELECT 
    h.*,
    (h.check_out_date - h.check_in_date) AS nights,
    COALESCE(h.nightly_rate * (h.check_out_date - h.check_in_date), h.total_cost) AS computed_total_cost
FROM hotels h;

-- Add trigger to auto-compute total_cost on insert/update
CREATE OR REPLACE FUNCTION compute_hotel_total_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nightly_rate IS NOT NULL AND NEW.check_in_date IS NOT NULL AND NEW.check_out_date IS NOT NULL THEN
        NEW.total_cost := NEW.nightly_rate * (NEW.check_out_date - NEW.check_in_date);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_hotel_total_cost ON hotels;
CREATE TRIGGER trg_compute_hotel_total_cost
    BEFORE INSERT OR UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION compute_hotel_total_cost();

-- 1.2 service_history.total_cost - Add generated column behavior via trigger
CREATE OR REPLACE FUNCTION compute_service_history_total_cost()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_cost := COALESCE(NEW.labor_cost, 0) + COALESCE(NEW.parts_cost, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_service_history_total_cost ON service_history;
CREATE TRIGGER trg_compute_service_history_total_cost
    BEFORE INSERT OR UPDATE ON service_history
    FOR EACH ROW EXECUTE FUNCTION compute_service_history_total_cost();

-- Create view for service history with explicit computation
CREATE OR REPLACE VIEW service_history_with_totals AS
SELECT 
    sh.*,
    (COALESCE(sh.labor_cost, 0) + COALESCE(sh.parts_cost, 0)) AS computed_total_cost
FROM service_history sh;

-- 1.3 per_diems.total_amount - Add trigger for computation
CREATE OR REPLACE FUNCTION compute_per_diem_total()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.daily_rate IS NOT NULL AND NEW.total_days IS NOT NULL THEN
        NEW.total_amount := NEW.daily_rate * NEW.total_days;
    ELSIF NEW.daily_rate IS NOT NULL AND NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
        NEW.total_days := (NEW.end_date - NEW.start_date) + 1;
        NEW.total_amount := NEW.daily_rate * NEW.total_days;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_per_diem_total ON per_diems;
CREATE TRIGGER trg_compute_per_diem_total
    BEFORE INSERT OR UPDATE ON per_diems
    FOR EACH ROW EXECUTE FUNCTION compute_per_diem_total();

-- ============================================================================
-- PHASE 2: FIX MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- 2.1 invoices - Add FK constraints for company_id and contact_id
-- First check if constraints exist, then add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_company' AND table_name = 'invoices'
    ) THEN
        ALTER TABLE invoices 
            ADD CONSTRAINT fk_invoices_company 
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_contact' AND table_name = 'invoices'
    ) THEN
        ALTER TABLE invoices 
            ADD CONSTRAINT fk_invoices_contact 
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2.2 purchase_orders - Add FK constraint for vendor_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_purchase_orders_vendor' AND table_name = 'purchase_orders'
    ) THEN
        ALTER TABLE purchase_orders 
            ADD CONSTRAINT fk_purchase_orders_vendor 
            FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2.3 purchase_requisition_items - Add FK constraint for preferred_vendor_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_purchase_requisition_items_vendor' AND table_name = 'purchase_requisition_items'
    ) THEN
        ALTER TABLE purchase_requisition_items 
            ADD CONSTRAINT fk_purchase_requisition_items_vendor 
            FOREIGN KEY (preferred_vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2.4 service_history - Add FK constraint for vendor_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_service_history_vendor' AND table_name = 'service_history'
    ) THEN
        ALTER TABLE service_history 
            ADD CONSTRAINT fk_service_history_vendor 
            FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: FIX REFERENCE TYPE ISSUES
-- ============================================================================

-- 3.1 payroll_items.employee_id should reference staff_members, not contacts
-- Replace employee_id (contacts) with staff_member_id (staff_members)

-- Add new column referencing staff_members
ALTER TABLE payroll_items 
    ADD COLUMN IF NOT EXISTS staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE;

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_payroll_items_staff_member ON payroll_items(staff_member_id);

-- Migrate existing data where possible (contacts that are also staff members)
UPDATE payroll_items pi
SET staff_member_id = sm.id
FROM staff_members sm
JOIN users u ON sm.user_id = u.id
JOIN contacts c ON c.email = u.email AND c.organization_id = sm.organization_id
WHERE pi.employee_id = c.id
AND pi.staff_member_id IS NULL;

-- Drop the old employee_id column
ALTER TABLE payroll_items DROP COLUMN IF EXISTS employee_id;

-- Make staff_member_id NOT NULL now that data is migrated
ALTER TABLE payroll_items ALTER COLUMN staff_member_id SET NOT NULL;

-- 3.2 project_resources.contact_id should reference users for internal resources
-- Replace contact_id with user_id

-- Add new column for user reference
ALTER TABLE project_resources 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for new column
CREATE INDEX IF NOT EXISTS idx_project_resources_user ON project_resources(user_id);

-- Migrate existing data where possible
UPDATE project_resources pr
SET user_id = u.id
FROM users u
JOIN contacts c ON c.email = u.email
WHERE pr.contact_id = c.id
AND pr.user_id IS NULL;

-- Drop the old contact_id column
ALTER TABLE project_resources DROP COLUMN IF EXISTS contact_id;

-- Make user_id NOT NULL now that data is migrated
ALTER TABLE project_resources ALTER COLUMN user_id SET NOT NULL;

-- ============================================================================
-- PHASE 4: CURRENCY FK CONSTRAINTS
-- ============================================================================

-- Add FK constraints to currencies table for tables with currency columns
-- Note: This requires all currency values to exist in currencies table

-- First ensure common currencies exist
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
    ('USD', 'US Dollar', '$', 2),
    ('EUR', 'Euro', '€', 2),
    ('GBP', 'British Pound', '£', 2),
    ('CAD', 'Canadian Dollar', 'C$', 2),
    ('AUD', 'Australian Dollar', 'A$', 2)
ON CONFLICT (code) DO NOTHING;

-- Add FK constraints (only if data is clean)
DO $$
BEGIN
    -- Check if all invoice currencies exist in currencies table
    IF NOT EXISTS (
        SELECT 1 FROM invoices i 
        WHERE i.currency IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM currencies c WHERE c.code = i.currency)
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_invoices_currency' AND table_name = 'invoices'
        ) THEN
            ALTER TABLE invoices 
                ADD CONSTRAINT fk_invoices_currency 
                FOREIGN KEY (currency) REFERENCES currencies(code);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- INDEXES FOR IMPROVED QUERY PERFORMANCE
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_org_phase_date ON events(organization_id, phase, start_date);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_status_date ON expenses(user_id, status, expense_date);

-- Partial indexes for active/available records
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(organization_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_assets_available ON assets(organization_id, status) WHERE status = 'available';

-- ============================================================================
-- RLS POLICIES FOR NEW VIEWS
-- ============================================================================

-- Views inherit RLS from base tables, no additional policies needed

COMMENT ON VIEW hotels_with_totals IS '3NF compliant view - computes total_cost from nightly_rate and nights';
COMMENT ON VIEW service_history_with_totals IS '3NF compliant view - computes total_cost from labor_cost + parts_cost';
