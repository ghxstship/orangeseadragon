-- ATLVS Platform Database Schema
-- 3NF/SSOT Consolidation Migration
-- Fixes critical normalization issues and adds missing constraints

-- ============================================================================
-- PHASE 1: VENDORS VIEW (Resolve dangling vendor_id references)
-- ============================================================================

-- Create a view for vendors that filters companies by type
-- This provides SSOT while maintaining backward compatibility
CREATE OR REPLACE VIEW vendors AS
SELECT 
    id,
    organization_id,
    name,
    legal_name,
    industry,
    website,
    email,
    phone,
    address,
    city,
    state,
    country,
    postal_code,
    tax_id,
    logo_url,
    description,
    is_active,
    tags,
    custom_fields,
    created_at,
    updated_at,
    created_by
FROM companies
WHERE company_type = 'vendor';

-- ============================================================================
-- PHASE 2: ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add FK for invoices.company_id (if column exists and constraint doesn't)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'company_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_company'
    ) THEN
        ALTER TABLE invoices 
        ADD CONSTRAINT fk_invoices_company 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for invoices.contact_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'contact_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_invoices_contact'
    ) THEN
        ALTER TABLE invoices 
        ADD CONSTRAINT fk_invoices_contact 
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for stages.venue_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stages' AND column_name = 'venue_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_stages_venue'
    ) THEN
        ALTER TABLE stages 
        ADD CONSTRAINT fk_stages_venue 
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for events.venue_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'venue_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_events_venue'
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT fk_events_venue 
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for purchase_orders.vendor_id (references companies)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_orders' AND column_name = 'vendor_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_purchase_orders_vendor'
    ) THEN
        ALTER TABLE purchase_orders 
        ADD CONSTRAINT fk_purchase_orders_vendor 
        FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for assets.vendor_id (references companies)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'vendor_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_assets_vendor'
    ) THEN
        ALTER TABLE assets 
        ADD CONSTRAINT fk_assets_vendor 
        FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for asset_maintenance.vendor_id (references companies)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'asset_maintenance' AND column_name = 'vendor_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_asset_maintenance_vendor'
    ) THEN
        ALTER TABLE asset_maintenance 
        ADD CONSTRAINT fk_asset_maintenance_vendor 
        FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add FK for purchase_requisition_items.preferred_vendor_id (references companies)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchase_requisition_items' AND column_name = 'preferred_vendor_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_purchase_requisition_items_vendor'
    ) THEN
        ALTER TABLE purchase_requisition_items 
        ADD CONSTRAINT fk_purchase_requisition_items_vendor 
        FOREIGN KEY (preferred_vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: CATALOG ITEMS TABLE (Missing SSOT for product catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    unit_of_measure VARCHAR(50) DEFAULT 'each',
    default_unit_cost DECIMAL(12, 4),
    default_rental_rate DECIMAL(12, 4),
    currency VARCHAR(3) DEFAULT 'USD',
    weight_lbs DECIMAL(10, 2),
    dimensions JSONB,
    specifications JSONB DEFAULT '{}',
    image_url TEXT,
    is_rentable BOOLEAN DEFAULT TRUE,
    is_purchasable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_organization ON catalog_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_sku ON catalog_items(sku);

-- Add catalog_item_id to assets if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assets' AND column_name = 'catalog_item_id'
    ) THEN
        ALTER TABLE assets ADD COLUMN catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_assets_catalog_item ON assets(catalog_item_id);
    END IF;
END $$;

-- ============================================================================
-- PHASE 4: EMPLOYEE PROFILES TABLE (HR-specific data extending users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50),
    hire_date DATE,
    termination_date DATE,
    employment_type VARCHAR(50) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern', 'seasonal')),
    employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'terminated', 'suspended')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    work_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    hourly_rate DECIMAL(10, 2),
    salary DECIMAL(12, 2),
    pay_frequency VARCHAR(20) DEFAULT 'biweekly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
    currency VARCHAR(3) DEFAULT 'USD',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),
    shirt_size VARCHAR(10),
    dietary_restrictions TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id),
    UNIQUE(organization_id, employee_number)
);

CREATE INDEX IF NOT EXISTS idx_employee_profiles_organization ON employee_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_department ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_manager ON employee_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_status ON employee_profiles(employment_status);

-- ============================================================================
-- PHASE 5: TRAINING TABLES (Missing from workforce domain)
-- ============================================================================

-- Training Programs (course definitions)
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    program_type VARCHAR(50) DEFAULT 'course' CHECK (program_type IN ('course', 'certification', 'onboarding', 'compliance', 'skill_development')),
    duration_hours DECIMAL(6, 2),
    is_required BOOLEAN DEFAULT FALSE,
    required_for_departments UUID[],
    required_for_positions UUID[],
    certification_type_id UUID REFERENCES certification_types(id) ON DELETE SET NULL,
    passing_score INTEGER CHECK (passing_score BETWEEN 0 AND 100),
    validity_months INTEGER,
    content_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_training_programs_organization ON training_programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_type ON training_programs(program_type);

-- Training Assignments (user enrolled in program)
CREATE TABLE IF NOT EXISTS training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired', 'waived')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    passed BOOLEAN,
    attempts INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_training_assignments_organization ON training_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_program ON training_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_user ON training_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_training_assignments_due ON training_assignments(due_date);

-- Training Sessions (scheduled training events)
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) DEFAULT 'in_person' CHECK (session_type IN ('in_person', 'virtual', 'self_paced', 'hybrid')),
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    virtual_meeting_url TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    capacity INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_organization ON training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_program ON training_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_instructor ON training_sessions(instructor_id);

-- Training Session Attendees
CREATE TABLE IF NOT EXISTS training_session_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES training_assignments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
    checked_in_at TIMESTAMPTZ,
    checked_out_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_training_session_attendees_session ON training_session_attendees(session_id);
CREATE INDEX IF NOT EXISTS idx_training_session_attendees_user ON training_session_attendees(user_id);

-- ============================================================================
-- PHASE 6: PERFORMANCE REVIEWS TABLE (Missing from workforce domain)
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type VARCHAR(50) DEFAULT 'annual' CHECK (review_type IN ('annual', 'semi_annual', 'quarterly', 'probationary', '90_day', 'project')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'self_review', 'manager_review', 'calibration', 'completed', 'acknowledged')),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_achieved TEXT,
    goals_for_next_period TEXT,
    manager_comments TEXT,
    employee_comments TEXT,
    self_review_completed_at TIMESTAMPTZ,
    manager_review_completed_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    next_review_date DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Handle both org_id and organization_id column names
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'org_id') THEN
        CREATE INDEX IF NOT EXISTS idx_performance_reviews_organization ON performance_reviews(org_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'organization_id') THEN
        CREATE INDEX IF NOT EXISTS idx_performance_reviews_organization ON performance_reviews(organization_id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer ON performance_reviews(reviewer_id);
-- Handle different column names for period index
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'review_period_start') THEN
        CREATE INDEX IF NOT EXISTS idx_performance_reviews_period ON performance_reviews(review_period_start, review_period_end);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status ON performance_reviews(status);

-- Performance Review Competencies (rating breakdown)
CREATE TABLE IF NOT EXISTS performance_review_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
    competency_name VARCHAR(255) NOT NULL,
    competency_category VARCHAR(100),
    self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
    manager_rating INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
    weight DECIMAL(5, 2) DEFAULT 1.0,
    self_comments TEXT,
    manager_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_review_competencies_review ON performance_review_competencies(review_id);

-- ============================================================================
-- PHASE 7: RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_session_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_competencies ENABLE ROW LEVEL SECURITY;

-- Catalog Items RLS
CREATE POLICY catalog_items_org_isolation ON catalog_items
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Employee Profiles RLS
CREATE POLICY employee_profiles_org_isolation ON employee_profiles
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Training Programs RLS
CREATE POLICY training_programs_org_isolation ON training_programs
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Training Assignments RLS
CREATE POLICY training_assignments_org_isolation ON training_assignments
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Training Sessions RLS
CREATE POLICY training_sessions_org_isolation ON training_sessions
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- Training Session Attendees RLS (via session)
CREATE POLICY training_session_attendees_org_isolation ON training_session_attendees
    FOR ALL USING (session_id IN (
        SELECT id FROM training_sessions WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

-- Performance Reviews RLS - handle both org_id and organization_id
DO $$ 
DECLARE
    org_col TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'org_id') THEN
        org_col := 'org_id';
    ELSE
        org_col := 'organization_id';
    END IF;
    
    EXECUTE format('DROP POLICY IF EXISTS performance_reviews_org_isolation ON performance_reviews');
    EXECUTE format('CREATE POLICY performance_reviews_org_isolation ON performance_reviews FOR ALL USING (is_organization_member(%I))', org_col);
END $$;

-- Performance Review Competencies RLS (via review) - handle both org_id and organization_id
DO $$ 
DECLARE
    org_col TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performance_reviews' AND column_name = 'org_id') THEN
        org_col := 'org_id';
    ELSE
        org_col := 'organization_id';
    END IF;
    
    EXECUTE format('DROP POLICY IF EXISTS performance_review_competencies_org_isolation ON performance_review_competencies');
    EXECUTE format('CREATE POLICY performance_review_competencies_org_isolation ON performance_review_competencies FOR ALL USING (review_id IN (SELECT id FROM performance_reviews WHERE is_organization_member(%I)))', org_col);
END $$;

-- ============================================================================
-- PHASE 8: TRIGGERS FOR updated_at
-- ============================================================================

CREATE TRIGGER update_catalog_items_updated_at
    BEFORE UPDATE ON catalog_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_profiles_updated_at
    BEFORE UPDATE ON employee_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at
    BEFORE UPDATE ON training_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_assignments_updated_at
    BEFORE UPDATE ON training_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
    BEFORE UPDATE ON training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_review_competencies_updated_at
    BEFORE UPDATE ON performance_review_competencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
