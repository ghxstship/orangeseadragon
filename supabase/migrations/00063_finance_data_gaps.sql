-- Migration: FINANCE Module Data Gaps
-- Created: 2026-02-02
-- Description: Create missing tables for FINANCE module features
-- Reference: docs/DATABASE_SCHEMA_OPTIMIZATION_ANALYSIS.md

-- ============================================================================
-- CREDIT NOTES
-- Navigation: /finance/invoices/credit-notes
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_note_status') THEN
        CREATE TYPE credit_note_status AS ENUM (
            'draft', 'issued', 'applied', 'partially_applied', 'voided'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credit_note_number VARCHAR(50) NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Amounts
    subtotal DECIMAL(14,2) NOT NULL,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) NOT NULL,
    amount_applied DECIMAL(14,2) DEFAULT 0,
    amount_remaining DECIMAL(14,2) GENERATED ALWAYS AS (total_amount - amount_applied) STORED,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Details
    reason TEXT,
    notes TEXT,
    internal_notes TEXT,
    
    -- Status
    status credit_note_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    voided_at TIMESTAMPTZ,
    voided_by UUID REFERENCES users(id) ON DELETE SET NULL,
    void_reason TEXT,
    
    UNIQUE(organization_id, credit_note_number)
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_org ON credit_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice ON credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_company ON credit_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_status ON credit_notes(status);
CREATE INDEX IF NOT EXISTS idx_credit_notes_date ON credit_notes(issue_date);

-- Credit note line items
CREATE TABLE IF NOT EXISTS credit_note_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
    invoice_line_item_id UUID REFERENCES invoice_line_items(id) ON DELETE SET NULL,
    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(12,4) NOT NULL,
    unit_price DECIMAL(14,4) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    line_total DECIMAL(14,2) NOT NULL,
    budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_note_line_items_credit_note ON credit_note_line_items(credit_note_id);

-- Credit note applications (tracking which invoices credits are applied to)
CREATE TABLE IF NOT EXISTS credit_note_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_id UUID NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_applied DECIMAL(14,2) NOT NULL,
    applied_date DATE NOT NULL,
    applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(credit_note_id, invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_credit_note_applications_credit_note ON credit_note_applications(credit_note_id);
CREATE INDEX IF NOT EXISTS idx_credit_note_applications_invoice ON credit_note_applications(invoice_id);

-- ============================================================================
-- EXPENSE RECEIPTS
-- Navigation: /finance/expenses/receipts
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    thumbnail_url TEXT,
    
    -- OCR extracted data
    ocr_processed BOOLEAN DEFAULT FALSE,
    ocr_data JSONB DEFAULT '{}',
    ocr_vendor_name VARCHAR(255),
    ocr_date DATE,
    ocr_total DECIMAL(14,2),
    ocr_tax DECIMAL(14,2),
    ocr_currency VARCHAR(3),
    ocr_confidence DECIMAL(5,2),
    
    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expense_receipts_expense ON expense_receipts(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_ocr ON expense_receipts(ocr_processed);

-- ============================================================================
-- REIMBURSEMENTS
-- Navigation: /finance/expenses/reimbursements
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reimbursement_status') THEN
        CREATE TYPE reimbursement_status AS ENUM (
            'draft', 'submitted', 'pending_approval', 'approved', 
            'processing', 'paid', 'rejected', 'cancelled'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reimbursement_number VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Period
    period_start DATE,
    period_end DATE,
    
    -- Amounts
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    approved_amount DECIMAL(14,2) DEFAULT 0,
    paid_amount DECIMAL(14,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    status reimbursement_status DEFAULT 'draft',
    
    -- Submission
    submitted_at TIMESTAMPTZ,
    
    -- Approval
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Payment
    payment_method VARCHAR(50) CHECK (payment_method IN ('direct_deposit', 'check', 'payroll', 'cash', 'other')),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Bank details (for direct deposit)
    bank_account_last4 VARCHAR(4),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, reimbursement_number)
);

CREATE INDEX IF NOT EXISTS idx_reimbursements_org ON reimbursements(organization_id);
CREATE INDEX IF NOT EXISTS idx_reimbursements_user ON reimbursements(user_id);
CREATE INDEX IF NOT EXISTS idx_reimbursements_status ON reimbursements(status);
CREATE INDEX IF NOT EXISTS idx_reimbursements_submitted ON reimbursements(submitted_at);

-- Link expenses to reimbursements
CREATE TABLE IF NOT EXISTS reimbursement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reimbursement_id UUID NOT NULL REFERENCES reimbursements(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    amount DECIMAL(14,2) NOT NULL,
    approved_amount DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reimbursement_id, expense_id)
);

CREATE INDEX IF NOT EXISTS idx_reimbursement_items_reimbursement ON reimbursement_items(reimbursement_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_items_expense ON reimbursement_items(expense_id);

-- ============================================================================
-- PAY STUBS
-- Navigation: /finance/payroll/stubs
-- ============================================================================

CREATE TABLE IF NOT EXISTS pay_stubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE SET NULL,
    payroll_item_id UUID REFERENCES payroll_items(id) ON DELETE SET NULL,
    employee_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    
    -- Pay period
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Hours
    regular_hours DECIMAL(8,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    pto_hours DECIMAL(8,2) DEFAULT 0,
    sick_hours DECIMAL(8,2) DEFAULT 0,
    holiday_hours DECIMAL(8,2) DEFAULT 0,
    
    -- Earnings
    regular_pay DECIMAL(12,2) DEFAULT 0,
    overtime_pay DECIMAL(12,2) DEFAULT 0,
    bonus_pay DECIMAL(12,2) DEFAULT 0,
    commission_pay DECIMAL(12,2) DEFAULT 0,
    other_pay DECIMAL(12,2) DEFAULT 0,
    gross_pay DECIMAL(12,2) NOT NULL,
    
    -- Deductions
    federal_tax DECIMAL(12,2) DEFAULT 0,
    state_tax DECIMAL(12,2) DEFAULT 0,
    local_tax DECIMAL(12,2) DEFAULT 0,
    social_security DECIMAL(12,2) DEFAULT 0,
    medicare DECIMAL(12,2) DEFAULT 0,
    health_insurance DECIMAL(12,2) DEFAULT 0,
    dental_insurance DECIMAL(12,2) DEFAULT 0,
    vision_insurance DECIMAL(12,2) DEFAULT 0,
    retirement_401k DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL,
    
    -- Net
    net_pay DECIMAL(12,2) NOT NULL,
    
    -- YTD totals
    ytd_gross DECIMAL(14,2) DEFAULT 0,
    ytd_federal_tax DECIMAL(14,2) DEFAULT 0,
    ytd_state_tax DECIMAL(14,2) DEFAULT 0,
    ytd_social_security DECIMAL(14,2) DEFAULT 0,
    ytd_medicare DECIMAL(14,2) DEFAULT 0,
    ytd_deductions DECIMAL(14,2) DEFAULT 0,
    ytd_net DECIMAL(14,2) DEFAULT 0,
    
    -- Payment
    payment_method VARCHAR(50),
    bank_account_last4 VARCHAR(4),
    check_number VARCHAR(20),
    
    -- Document
    document_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_stubs_org ON pay_stubs(organization_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_employee ON pay_stubs(employee_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_payroll_run ON pay_stubs(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_pay_date ON pay_stubs(pay_date);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_period ON pay_stubs(pay_period_start, pay_period_end);

-- ============================================================================
-- DEDUCTION TYPES & EMPLOYEE DEDUCTIONS
-- Navigation: /finance/payroll/deductions
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deduction_category') THEN
        CREATE TYPE deduction_category AS ENUM (
            'tax', 'benefit', 'retirement', 'garnishment', 'voluntary', 'other'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS deduction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category deduction_category NOT NULL,
    is_pretax BOOLEAN DEFAULT FALSE,
    is_employer_match BOOLEAN DEFAULT FALSE,
    employer_match_percent DECIMAL(5,2),
    employer_match_limit DECIMAL(12,2),
    annual_limit DECIMAL(12,2),
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_deduction_types_org ON deduction_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_deduction_types_category ON deduction_types(category);

CREATE TABLE IF NOT EXISTS employee_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    deduction_type_id UUID NOT NULL REFERENCES deduction_types(id) ON DELETE CASCADE,
    
    -- Amount (either fixed amount or percentage)
    amount DECIMAL(12,2),
    percentage DECIMAL(5,2),
    
    -- Limits
    per_pay_limit DECIMAL(12,2),
    annual_limit DECIMAL(12,2),
    ytd_amount DECIMAL(14,2) DEFAULT 0,
    
    -- Effective dates
    effective_date DATE NOT NULL,
    end_date DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT amount_or_percentage CHECK (
        (amount IS NOT NULL AND percentage IS NULL) OR
        (amount IS NULL AND percentage IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_employee_deductions_employee ON employee_deductions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_deductions_type ON employee_deductions(deduction_type_id);
CREATE INDEX IF NOT EXISTS idx_employee_deductions_active ON employee_deductions(employee_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- BANK ACCOUNTS
-- Navigation: /finance/accounts/bank
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bank_account_type') THEN
        CREATE TYPE bank_account_type AS ENUM (
            'checking', 'savings', 'money_market', 'credit_card', 'line_of_credit', 'other'
        );
    END IF;
END $$;

-- Extend existing bank_accounts table (originally from 00024_gap_implementation_tables.sql)
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS routing_number_last4 VARCHAR(4);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(14,2);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS current_balance DECIMAL(14,2) DEFAULT 0;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS available_balance DECIMAL(14,2) DEFAULT 0;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS last_reconciled_balance DECIMAL(14,2);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS last_reconciled_date DATE;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS opened_date DATE;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS closed_date DATE;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_gl ON bank_accounts(gl_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(organization_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FINANCIAL TRANSACTIONS
-- Navigation: /finance/accounts/transactions
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
            'deposit', 'withdrawal', 'transfer', 'payment', 'refund', 
            'fee', 'interest', 'adjustment', 'other'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_number VARCHAR(50),
    
    -- Account
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    gl_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    -- Transaction details
    transaction_date DATE NOT NULL,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Description
    description TEXT,
    memo TEXT,
    reference_number VARCHAR(100),
    check_number VARCHAR(20),
    
    -- Categorization
    budget_category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
    
    -- Source entity (polymorphic reference)
    source_type VARCHAR(50), -- 'invoice', 'expense', 'payroll', 'payment', 'manual'
    source_id UUID,
    
    -- Counterparty
    payee_name VARCHAR(255),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    reconciled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Balance tracking
    running_balance DECIMAL(14,2),
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_org ON financial_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_bank ON financial_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_gl ON financial_transactions(gl_account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_source ON financial_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reconciled ON financial_transactions(bank_account_id, reconciled) 
    WHERE reconciled = FALSE;
CREATE INDEX IF NOT EXISTS idx_financial_transactions_company ON financial_transactions(company_id);

-- ============================================================================
-- BANK RECONCILIATION ENHANCEMENTS
-- Navigation: /finance/accounts/reconciliation
-- Note: bank_reconciliations already exists in 00024, we enhance it here
-- ============================================================================

-- Add missing columns to existing bank_reconciliations table
ALTER TABLE bank_reconciliations 
    ADD COLUMN IF NOT EXISTS period_start DATE,
    ADD COLUMN IF NOT EXISTS period_end DATE,
    ADD COLUMN IF NOT EXISTS book_balance_cents INTEGER,
    ADD COLUMN IF NOT EXISTS adjusted_book_balance_cents INTEGER;

-- Create index on bank_account_id if not exists
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_account ON bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_date ON bank_reconciliations(statement_date);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reimbursement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_stubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;

-- Credit Notes
DROP POLICY IF EXISTS "credit_notes_org_access" ON credit_notes;
CREATE POLICY "credit_notes_org_access" ON credit_notes 
    FOR ALL USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS "credit_note_line_items_org_access" ON credit_note_line_items;
CREATE POLICY "credit_note_line_items_org_access" ON credit_note_line_items 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM credit_notes cn WHERE cn.id = credit_note_line_items.credit_note_id 
                AND is_organization_member(cn.organization_id))
    );

DROP POLICY IF EXISTS "credit_note_applications_org_access" ON credit_note_applications;
CREATE POLICY "credit_note_applications_org_access" ON credit_note_applications 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM credit_notes cn WHERE cn.id = credit_note_applications.credit_note_id 
                AND is_organization_member(cn.organization_id))
    );

-- Expense Receipts
DROP POLICY IF EXISTS "expense_receipts_org_access" ON expense_receipts;
CREATE POLICY "expense_receipts_org_access" ON expense_receipts 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM expenses e WHERE e.id = expense_receipts.expense_id 
                AND is_organization_member(e.organization_id))
    );

-- Reimbursements
DROP POLICY IF EXISTS "reimbursements_org_access" ON reimbursements;
CREATE POLICY "reimbursements_org_access" ON reimbursements 
    FOR ALL USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS "reimbursement_items_org_access" ON reimbursement_items;
CREATE POLICY "reimbursement_items_org_access" ON reimbursement_items 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM reimbursements r WHERE r.id = reimbursement_items.reimbursement_id 
                AND is_organization_member(r.organization_id))
    );

-- Pay Stubs
DROP POLICY IF EXISTS "pay_stubs_org_access" ON pay_stubs;
CREATE POLICY "pay_stubs_org_access" ON pay_stubs 
    FOR ALL USING (is_organization_member(organization_id));

-- Deductions
DROP POLICY IF EXISTS "deduction_types_org_access" ON deduction_types;
CREATE POLICY "deduction_types_org_access" ON deduction_types 
    FOR ALL USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS "employee_deductions_org_access" ON employee_deductions;
CREATE POLICY "employee_deductions_org_access" ON employee_deductions 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM staff_members sm WHERE sm.id = employee_deductions.employee_id 
                AND is_organization_member(sm.organization_id))
    );

-- Bank Accounts
DROP POLICY IF EXISTS "bank_accounts_org_access" ON bank_accounts;
CREATE POLICY "bank_accounts_org_access" ON bank_accounts 
    FOR ALL USING (is_organization_member(organization_id));

-- Financial Transactions
DROP POLICY IF EXISTS "financial_transactions_org_access" ON financial_transactions;
CREATE POLICY "financial_transactions_org_access" ON financial_transactions 
    FOR ALL USING (is_organization_member(organization_id));

-- Bank Reconciliations (access via bank_account relationship - no org_id on this table)
-- Note: RLS already defined in 00027_gap_implementation_rls.sql

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_credit_notes_updated_at ON credit_notes;
CREATE TRIGGER trg_credit_notes_updated_at
    BEFORE UPDATE ON credit_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_credit_note_line_items_updated_at ON credit_note_line_items;
CREATE TRIGGER trg_credit_note_line_items_updated_at
    BEFORE UPDATE ON credit_note_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_reimbursements_updated_at ON reimbursements;
CREATE TRIGGER trg_reimbursements_updated_at
    BEFORE UPDATE ON reimbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_pay_stubs_updated_at ON pay_stubs;
CREATE TRIGGER trg_pay_stubs_updated_at
    BEFORE UPDATE ON pay_stubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_deduction_types_updated_at ON deduction_types;
CREATE TRIGGER trg_deduction_types_updated_at
    BEFORE UPDATE ON deduction_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_employee_deductions_updated_at ON employee_deductions;
CREATE TRIGGER trg_employee_deductions_updated_at
    BEFORE UPDATE ON employee_deductions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bank_accounts_updated_at ON bank_accounts;
CREATE TRIGGER trg_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER trg_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bank_reconciliations_updated_at ON bank_reconciliations;
CREATE TRIGGER trg_bank_reconciliations_updated_at
    BEFORE UPDATE ON bank_reconciliations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate reimbursement total from items
CREATE OR REPLACE FUNCTION calculate_reimbursement_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reimbursements r
    SET total_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM reimbursement_items 
        WHERE reimbursement_id = r.id
    )
    WHERE r.id = COALESCE(NEW.reimbursement_id, OLD.reimbursement_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reimbursement_items_total ON reimbursement_items;
CREATE TRIGGER trg_reimbursement_items_total
    AFTER INSERT OR UPDATE OR DELETE ON reimbursement_items
    FOR EACH ROW EXECUTE FUNCTION calculate_reimbursement_total();

-- Function to update credit note amount_applied
CREATE OR REPLACE FUNCTION update_credit_note_applied()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE credit_notes cn
    SET amount_applied = (
        SELECT COALESCE(SUM(amount_applied), 0) 
        FROM credit_note_applications 
        WHERE credit_note_id = cn.id
    ),
    status = CASE 
        WHEN (SELECT COALESCE(SUM(amount_applied), 0) FROM credit_note_applications WHERE credit_note_id = cn.id) >= cn.total_amount 
        THEN 'applied'::credit_note_status
        WHEN (SELECT COALESCE(SUM(amount_applied), 0) FROM credit_note_applications WHERE credit_note_id = cn.id) > 0 
        THEN 'partially_applied'::credit_note_status
        ELSE cn.status
    END
    WHERE cn.id = COALESCE(NEW.credit_note_id, OLD.credit_note_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_credit_note_applications_update ON credit_note_applications;
CREATE TRIGGER trg_credit_note_applications_update
    AFTER INSERT OR UPDATE OR DELETE ON credit_note_applications
    FOR EACH ROW EXECUTE FUNCTION update_credit_note_applied();

COMMENT ON TABLE credit_notes IS 'Credit notes for invoice adjustments and refunds';
COMMENT ON TABLE expense_receipts IS 'Receipt attachments and OCR data for expenses';
COMMENT ON TABLE reimbursements IS 'Employee expense reimbursement requests';
COMMENT ON TABLE pay_stubs IS 'Individual pay stub records for employees';
COMMENT ON TABLE deduction_types IS 'Types of payroll deductions (tax, benefit, etc.)';
COMMENT ON TABLE employee_deductions IS 'Employee-specific deduction configurations';
COMMENT ON TABLE bank_accounts IS 'Organization bank accounts for financial tracking';
COMMENT ON TABLE financial_transactions IS 'Individual financial transactions for bank accounts';
COMMENT ON TABLE bank_reconciliations IS 'Bank statement reconciliation records';
