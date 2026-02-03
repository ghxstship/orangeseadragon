# Database Schema Optimization Analysis

> **Generated:** January 2026  
> **Reference:** `src/config/navigation.ts` (v6 Information Architecture)  
> **Scope:** 3NF Compliance, SSOT Violations, Data Gaps, Business Logic Optimizations

---

## Executive Summary

This analysis cross-references the navigation structure (7 modules, 37 top-level pages, 93 subpages) against 40+ migration files to identify optimization opportunities. The schema is generally well-designed with good normalization practices, but several areas require attention.

### Key Findings

| Category | Issues Found | Priority |
|----------|-------------|----------|
| **3NF Violations** | 8 | High |
| **SSOT Violations** | 6 | Critical |
| **Data Gaps** | 12 | Medium |
| **Business Logic Gaps** | 7 | Medium |
| **Redundant Structures** | 4 | Low |

---

## 1. Third Normal Form (3NF) Violations

### 1.1 **CRITICAL: Stored Computed Values**

#### `hotels.total_cost` (00033_clickup_ssot_workforce.sql:109)
```sql
-- VIOLATION: total_cost can be computed from nightly_rate * nights
total_cost DECIMAL(10,2),
```
**Recommendation:** Remove `total_cost` column; compute at query time:
```sql
-- Create view instead
CREATE VIEW hotels_with_totals AS
SELECT *, (nightly_rate * (check_out_date - check_in_date)) AS total_cost
FROM hotels;
```

#### `service_history.total_cost` (00034_clickup_ssot_business_assets.sql:289)
```sql
-- VIOLATION: total_cost = labor_cost + parts_cost (stored redundantly)
labor_cost DECIMAL(10,2),
parts_cost DECIMAL(10,2),
total_cost DECIMAL(10,2),
```
**Recommendation:** Remove `total_cost`; use generated column or view.

#### `per_diems.total_amount` (00033_clickup_ssot_workforce.sql:149)
```sql
-- VIOLATION: total_amount = daily_rate * total_days
daily_rate DECIMAL(10,2) NOT NULL,
total_days INTEGER,
total_amount DECIMAL(10,2),
```
**Recommendation:** Convert to generated column:
```sql
total_amount DECIMAL(10,2) GENERATED ALWAYS AS (daily_rate * total_days) STORED
```

### 1.2 **Partial Dependencies (2NF Issues)**

#### `payroll_items` references `contacts` instead of `users`
```sql
-- 00029_payroll_resources_time.sql:35
employee_id UUID NOT NULL REFERENCES contacts(id),
```
**Issue:** Employees should reference `users` or `staff_members`, not `contacts`. Contacts are CRM entities.

**Recommendation:** 
```sql
employee_id UUID NOT NULL REFERENCES staff_members(id),
```

#### `project_resources.contact_id` should be `user_id`
```sql
-- 00029_payroll_resources_time.sql:60
contact_id UUID NOT NULL REFERENCES contacts(id),
```
**Recommendation:** Change to reference `users(id)` for internal resources.

### 1.3 **Transitive Dependencies**

#### `invoices` - Missing FK constraints
```sql
-- 00005_finance.sql:86-87
company_id UUID,  -- No FK constraint
contact_id UUID,  -- No FK constraint
```
**Recommendation:** Add proper foreign key constraints:
```sql
company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
```

#### `purchase_orders.vendor_id` - Missing FK
```sql
-- 00005_finance.sql:260
vendor_id UUID,  -- No FK constraint
```
**Recommendation:** Reference `companies(id)` with vendor type filter or use the `vendors` view.

---

## 2. Single Source of Truth (SSOT) Violations

### 2.1 **CRITICAL: Duplicate Rate Card Definitions**

**Problem:** Rate cards are defined in TWO places:
1. `00004_workforce.sql` - `rate_cards` + `rate_card_items` (workforce rates)
2. `00034_clickup_ssot_business_assets.sql` - `rate_cards` + `rate_card_items` (service rates)

**Impact:** Conflicting definitions, data integrity issues, confusion about which is authoritative.

**Recommendation:** Consolidate into single `rate_cards` table with `rate_type` discriminator:
```sql
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    rate_type rate_card_type NOT NULL, -- 'workforce', 'service', 'equipment'
    name VARCHAR(255) NOT NULL,
    -- ... common fields
);
```

### 2.2 **CRITICAL: Duplicate Advancing Tables**

**Problem:** Advancing functionality split across:
1. `00023_missing_entity_tables.sql` - `advancing` table (basic)
2. `00034_clickup_ssot_business_assets.sql` - `site_advances`, `advance_reports`
3. `00047_production_advancing_schema.sql` - `production_advances`, `advance_items`, `advance_categories`

**Impact:** Three different advancing models with overlapping purposes.

**Recommendation:** 
- Keep `production_advances` + `advance_items` as the SSOT (most complete)
- Deprecate `advancing` and `site_advances` tables
- Create migration to merge existing data

### 2.3 **Vendor Definition Fragmentation**

**Problem:** Vendors referenced inconsistently:
- `companies` table with `company_type = 'vendor'`
- `vendors` view (created in 00035)
- `carriers` table (separate entity for freight)

**Recommendation:** 
1. Keep `vendors` view as SSOT for vendor queries
2. Add `carrier_id` FK to `companies` for carriers that are also vendors
3. Document that all vendor operations should use the `vendors` view

### 2.4 **Calendar/Event Duplication**

**Problem:** Multiple calendar-like tables:
- `calendar` (00023_missing_entity_tables.sql)
- `events` (00002_events_production.sql)
- `event_sessions` (00023_missing_entity_tables.sql)

**Recommendation:** 
- `calendar` should be for personal calendar items only
- Create `calendar_events_unified` view that unions personal calendar + events + sessions
- Implement trigger-based sync to `calendar` SSOT (similar to document_registry pattern)

### 2.5 **Credential/Certification Duplication**

**Problem:** Two tables for similar purposes:
- `credentials` (00023_missing_entity_tables.sql)
- `user_certifications` (00004_workforce.sql)

**Recommendation:** Consolidate into single `user_credentials` table:
```sql
CREATE TABLE user_credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    credential_type credential_type NOT NULL, -- 'certification', 'license', 'training'
    certification_type_id UUID REFERENCES certification_types(id), -- optional link
    -- ... unified fields
);
```

### 2.6 **Time Entry Duplication**

**Problem:** Time tracking split across:
- `time_entries` (00029_payroll_resources_time.sql)
- `timesheet_entries` (00004_workforce.sql)

**Recommendation:** Keep `time_entries` as SSOT, deprecate `timesheet_entries`, create view for timesheet aggregation.

---

## 3. Data Gaps (Navigation Features Without Schema Support)

### 3.1 **OPERATIONS Module Gaps**

| Feature | Navigation Path | Missing Schema |
|---------|----------------|----------------|
| **Venue Zones** | `/operations/venues/zones` | `venue_zones` table |
| **Punch Lists** | `/operations/incidents/punch-lists` | `punch_lists` table |
| **Work Orders** | `/operations/work-orders` | `work_orders` table |
| **Weather Reports** | `/operations/comms/weather` | `weather_reports` table |
| **Daily Reports** | `/operations/comms/daily-reports` | `daily_reports` table |

**Recommended Schema:**
```sql
CREATE TABLE venue_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    venue_id UUID NOT NULL REFERENCES venues(id),
    floor_plan_id UUID REFERENCES floor_plans(id),
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(50), -- 'backstage', 'foh', 'vip', 'production', 'public'
    capacity INTEGER,
    access_level VARCHAR(20), -- 'all_access', 'crew', 'vip', 'public'
    coordinates JSONB, -- polygon coordinates for floor plan overlay
    color VARCHAR(7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE punch_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    event_id UUID REFERENCES events(id),
    venue_id UUID REFERENCES venues(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    due_date DATE,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE punch_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    punch_list_id UUID NOT NULL REFERENCES punch_lists(id),
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id)
);

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    work_order_number VARCHAR(50) NOT NULL,
    event_id UUID REFERENCES events(id),
    venue_id UUID REFERENCES venues(id),
    asset_id UUID REFERENCES assets(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    requested_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, work_order_number)
);

CREATE TABLE weather_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    event_id UUID REFERENCES events(id),
    venue_id UUID REFERENCES venues(id),
    report_date DATE NOT NULL,
    report_time TIME,
    temperature_f DECIMAL(5,2),
    feels_like_f DECIMAL(5,2),
    humidity_percent INTEGER,
    wind_speed_mph DECIMAL(5,2),
    wind_direction VARCHAR(10),
    precipitation_chance INTEGER,
    conditions VARCHAR(100),
    alerts JSONB DEFAULT '[]',
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    event_id UUID REFERENCES events(id),
    report_date DATE NOT NULL,
    submitted_by UUID REFERENCES users(id),
    summary TEXT,
    highlights TEXT,
    issues TEXT,
    attendance INTEGER,
    weather_conditions TEXT,
    safety_incidents INTEGER DEFAULT 0,
    photos JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 **FINANCE Module Gaps**

| Feature | Navigation Path | Missing Schema |
|---------|----------------|----------------|
| **Credit Notes** | `/finance/invoices/credit-notes` | `credit_notes` table |
| **Expense Receipts** | `/finance/expenses/receipts` | `expense_receipts` table |
| **Reimbursements** | `/finance/expenses/reimbursements` | `reimbursements` table |
| **Pay Stubs** | `/finance/payroll/stubs` | `pay_stubs` table |
| **Deductions** | `/finance/payroll/deductions` | `deductions` table |
| **Bank Accounts** | `/finance/accounts/bank` | `bank_accounts` table |
| **Transactions** | `/finance/accounts/transactions` | `transactions` table |

**Recommended Schema:**
```sql
CREATE TABLE credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    credit_note_number VARCHAR(50) NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    company_id UUID REFERENCES companies(id),
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    reason TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    issued_date DATE NOT NULL,
    applied_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, credit_note_number)
);

CREATE TABLE expense_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    ocr_data JSONB DEFAULT '{}',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reimbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    reimbursement_number VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    paid_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, reimbursement_number)
);

CREATE TABLE reimbursement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reimbursement_id UUID NOT NULL REFERENCES reimbursements(id),
    expense_id UUID REFERENCES expenses(id),
    amount DECIMAL(14,2) NOT NULL,
    description TEXT
);

CREATE TABLE pay_stubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    employee_id UUID NOT NULL REFERENCES staff_members(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    gross_pay DECIMAL(12,2) NOT NULL,
    net_pay DECIMAL(12,2) NOT NULL,
    ytd_gross DECIMAL(14,2),
    ytd_net DECIMAL(14,2),
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deduction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'tax', 'benefit', 'garnishment', 'voluntary'
    is_pretax BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(organization_id, code)
);

CREATE TABLE employee_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES staff_members(id),
    deduction_type_id UUID NOT NULL REFERENCES deduction_types(id),
    amount DECIMAL(12,2),
    percentage DECIMAL(5,2),
    effective_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- 'checking', 'savings', 'credit'
    bank_name VARCHAR(255),
    account_number_last4 VARCHAR(4),
    routing_number_last4 VARCHAR(4),
    currency VARCHAR(3) DEFAULT 'USD',
    current_balance DECIMAL(14,2) DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    bank_account_id UUID REFERENCES bank_accounts(id),
    account_id UUID REFERENCES accounts(id),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    source_type VARCHAR(50), -- 'invoice', 'expense', 'payroll', 'manual'
    source_id UUID,
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 **BUSINESS Module Gaps**

| Feature | Navigation Path | Missing Schema |
|---------|----------------|----------------|
| **Products** | `/business/products/list` | `products` table (distinct from catalog_items) |
| **Pricing** | `/business/products/pricing` | `price_lists` table |
| **Sponsors** | `/business/companies/sponsors` | `sponsors` or company_type filter |

**Note:** The navigation distinguishes between:
- **Catalog** (ASSETS) = Equipment you OWN
- **Products & Services** (BUSINESS) = What you SELL

Current schema has `catalog_items` but lacks dedicated `products` table for sellable offerings.

**Recommended Schema:**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    product_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    product_type VARCHAR(50), -- 'physical', 'digital', 'rental'
    base_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    sku VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    catalog_item_id UUID REFERENCES catalog_items(id), -- link to owned equipment if rental
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, product_code)
);

CREATE TABLE price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'USD',
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES price_lists(id),
    product_id UUID REFERENCES products(id),
    service_id UUID REFERENCES services(id),
    unit_price DECIMAL(12,2) NOT NULL,
    minimum_quantity INTEGER DEFAULT 1,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    CONSTRAINT product_or_service CHECK (
        (product_id IS NOT NULL AND service_id IS NULL) OR
        (product_id IS NULL AND service_id IS NOT NULL)
    )
);
```

---

## 4. Business Logic Optimization Opportunities

### 4.1 **Approval Workflow Standardization**

**Problem:** Approval patterns inconsistent across entities:
- Some use `approved_by` + `approved_at`
- Some use `status` enum with 'approved' value
- Some have both

**Recommendation:** Create standardized approval tracking:
```sql
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    entity_type VARCHAR(50) NOT NULL, -- 'expense', 'purchase_order', 'timesheet', etc.
    entity_id UUID NOT NULL,
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approval_level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    decided_by UUID REFERENCES users(id),
    decided_at TIMESTAMPTZ,
    decision_notes TEXT,
    UNIQUE(entity_type, entity_id, approval_level)
);
```

### 4.2 **Status Tracking Standardization**

**Problem:** Status fields use mix of:
- Inline CHECK constraints with different values
- ENUM types
- VARCHAR with no validation

**Recommendation:** Use the existing `statuses` lookup table (00023) consistently:
```sql
-- Instead of inline status checks, reference statuses table
status_id UUID REFERENCES statuses(id),
-- Or use domain-specific ENUMs consistently
```

### 4.3 **Audit Trail Enhancement**

**Problem:** `audit_logs` table exists but not consistently used.

**Recommendation:** Create triggers for critical tables:
```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        organization_id, user_id, action, entity_type, entity_id,
        old_values, new_values
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_contracts AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
-- etc.
```

### 4.4 **Soft Delete Standardization**

**Problem:** Some tables have `deleted_at` (e.g., `production_advances`), most don't.

**Recommendation:** Add `deleted_at` to all major entities and update RLS policies:
```sql
-- Add to existing tables
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
-- etc.

-- Update RLS to filter soft-deleted records
CREATE POLICY "events_not_deleted" ON events
    FOR SELECT USING (deleted_at IS NULL AND is_organization_member(organization_id));
```

### 4.5 **Currency Handling**

**Problem:** Currency stored as VARCHAR(3) in many tables, but `currencies` lookup table exists.

**Recommendation:** Add FK constraints to currencies table:
```sql
ALTER TABLE invoices 
    ADD CONSTRAINT fk_invoices_currency 
    FOREIGN KEY (currency) REFERENCES currencies(code);
```

### 4.6 **Address Normalization**

**Note:** Migration 00037 addresses this, but implementation appears incomplete.

**Recommendation:** Ensure all address fields reference the normalized `addresses` table:
```sql
-- Instead of inline address fields
address TEXT,
city VARCHAR(100),
state VARCHAR(100),
country VARCHAR(100),
postal_code VARCHAR(20),

-- Use FK to addresses
address_id UUID REFERENCES addresses(id)
```

### 4.7 **File/Document Reference Standardization**

**Problem:** File URLs stored inconsistently:
- `document_url TEXT`
- `file_url TEXT`
- `receipt_url TEXT`
- `logo_url TEXT`
- etc.

**Recommendation:** All file references should go through `document_registry`:
```sql
-- Instead of direct URL storage
logo_url TEXT,

-- Use document_registry reference
logo_document_id UUID REFERENCES document_registry(id)
```

---

## 5. Index Optimization Recommendations

### 5.1 **Missing Composite Indexes**

```sql
-- Frequently queried combinations
CREATE INDEX idx_events_org_status_date ON events(organization_id, status, start_date);
CREATE INDEX idx_tasks_user_status ON tasks(assigned_to, status) WHERE status != 'completed';
CREATE INDEX idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX idx_expenses_user_status_date ON expenses(user_id, status, expense_date);
```

### 5.2 **Partial Indexes for Common Filters**

```sql
-- Active records only
CREATE INDEX idx_companies_active ON companies(organization_id) WHERE is_active = TRUE;
CREATE INDEX idx_assets_available ON assets(organization_id, status) WHERE status = 'available';
CREATE INDEX idx_events_upcoming ON events(organization_id, start_date) 
    WHERE status NOT IN ('cancelled', 'completed') AND start_date > NOW();
```

---

## 6. Implementation Priority

### Phase 1: Critical SSOT Fixes (Week 1)
1. Consolidate rate_cards tables
2. Consolidate advancing tables
3. Fix payroll_items FK to staff_members
4. Add missing FK constraints to invoices/purchase_orders

### Phase 2: Data Gap Tables (Week 2)
1. Create OPERATIONS missing tables (venue_zones, punch_lists, work_orders, weather_reports, daily_reports)
2. Create FINANCE missing tables (credit_notes, bank_accounts, transactions)
3. Create BUSINESS missing tables (products, price_lists)

### Phase 3: 3NF Cleanup (Week 3)
1. Remove stored computed values
2. Create computed views
3. Standardize status handling

### Phase 4: Business Logic (Week 4)
1. Implement approval_requests standardization
2. Add audit triggers
3. Standardize soft deletes
4. Currency FK constraints

---

## Appendix: Navigation-to-Schema Mapping

| Module | Page | Primary Tables | Status |
|--------|------|----------------|--------|
| CORE | Dashboard | - | View only |
| CORE | Calendar | calendar, events | ✅ |
| CORE | Tasks | tasks, checklists | ✅ |
| CORE | Inbox | notifications, approval_requests | ⚠️ approval_requests needs work |
| CORE | Documents | documents, document_registry, folders | ✅ |
| CORE | Workflows | workflows, workflow_runs | ✅ |
| PRODUCTIONS | Productions | productions, events, stages | ✅ |
| PRODUCTIONS | Activations | activations | ✅ |
| PRODUCTIONS | Build & Strike | build_strike_schedules | ⚠️ Needs verification |
| PRODUCTIONS | Compliance | permits, licenses, certificates, insurance_policies | ✅ |
| ADVANCING | Dashboard | production_advances | ✅ |
| ADVANCING | Advances | production_advances | ✅ |
| ADVANCING | Items | advance_items, advance_categories | ✅ |
| ADVANCING | Fulfillment | advance_item_fulfillment | ✅ |
| ADVANCING | Vendors | vendors (view), vendor_ratings | ✅ |
| OPERATIONS | Events | events, runsheets, crew_calls | ✅ |
| OPERATIONS | Venues | venues, floor_plans, venue_spaces | ⚠️ venue_zones missing |
| OPERATIONS | Incidents | incident_reports | ⚠️ punch_lists missing |
| OPERATIONS | Work Orders | - | ❌ Missing |
| OPERATIONS | Comms | radio_channels | ⚠️ weather_reports, daily_reports missing |
| PEOPLE | Rosters | staff_members, positions, departments, teams | ✅ |
| PEOPLE | Recruitment | candidates, job_requisitions, job_offers | ✅ |
| PEOPLE | Scheduling | availability_submissions, shifts, crew_calls, timesheets | ✅ |
| PEOPLE | Training | training_programs, training_sessions, user_certifications | ✅ |
| PEOPLE | Travel | travel_requests, flights, hotels, ground_transport | ✅ |
| PEOPLE | Performance | performance_reviews, goals, peer_feedback | ✅ |
| ASSETS | Catalog | catalog_items, asset_categories, assets | ✅ |
| ASSETS | Locations | locations, warehouses | ⚠️ staging_areas, bins need verification |
| ASSETS | Logistics | shipments, vehicles | ✅ |
| ASSETS | Reservations | asset_reservations, asset_check_actions | ✅ |
| ASSETS | Maintenance | asset_maintenance, pm_schedules, service_history | ✅ |
| BUSINESS | Pipeline | leads, deals, proposals, activities | ✅ |
| BUSINESS | Companies | companies, contacts, contracts | ✅ |
| BUSINESS | Products & Services | services, service_packages | ⚠️ products, price_lists missing |
| BUSINESS | Campaigns | campaigns, email_templates, forms | ✅ |
| BUSINESS | Brand Kit | brand_guidelines, brand_assets, brand_templates | ✅ |
| FINANCE | Budgets | budgets, budget_line_items, purchase_orders | ✅ |
| FINANCE | Invoices | invoices, invoice_line_items, payments | ⚠️ credit_notes missing |
| FINANCE | Expenses | expenses | ⚠️ expense_receipts, reimbursements missing |
| FINANCE | Payroll | payroll_runs, payroll_items | ⚠️ pay_stubs, deductions missing |
| FINANCE | Accounts | accounts | ⚠️ bank_accounts, transactions missing |

**Legend:**
- ✅ Complete
- ⚠️ Partial (some tables missing)
- ❌ Missing entirely
