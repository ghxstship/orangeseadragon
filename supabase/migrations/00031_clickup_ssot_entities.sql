-- Migration: ClickUp SSOT Entity Implementation - Part 1
-- Created: 2026-01-29
-- Description: Implements missing SSOT entities from ClickUp data model for 3NF compliance
-- Reference: clickupmigration.md

-- ============================================================================
-- ENUM TYPES FOR NEW ENTITIES
-- ============================================================================

-- Production lifecycle statuses (matches ClickUp workflow)
DO $$ BEGIN
    CREATE TYPE production_status AS ENUM (
        'intake', 'scoping', 'proposal', 'awarded', 'design', 
        'fabrication', 'deployment', 'installation', 'show', 
        'strike', 'closeout', 'archived'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Production health indicators
DO $$ BEGIN
    CREATE TYPE production_health AS ENUM ('on_track', 'at_risk', 'critical', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Production types
DO $$ BEGIN
    CREATE TYPE production_type AS ENUM ('stage', 'scenic', 'touring', 'installation', 'activation', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Shipment statuses
DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM (
        'draft', 'pending', 'packed', 'in_transit', 'delivered', 
        'partially_received', 'received', 'returned', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Shipment direction
DO $$ BEGIN
    CREATE TYPE shipment_direction AS ENUM ('outbound', 'inbound', 'transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work order types
DO $$ BEGIN
    CREATE TYPE work_order_type AS ENUM ('install', 'strike', 'maintenance', 'repair', 'inspection');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work order statuses
DO $$ BEGIN
    CREATE TYPE work_order_status AS ENUM (
        'draft', 'scheduled', 'in_progress', 'on_hold', 
        'completed', 'verified', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Permit statuses
DO $$ BEGIN
    CREATE TYPE permit_status AS ENUM (
        'not_required', 'pending', 'submitted', 'under_review', 
        'approved', 'denied', 'expired', 'revoked'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Permit types
DO $$ BEGIN
    CREATE TYPE permit_type AS ENUM (
        'building', 'fire', 'electrical', 'noise', 'street_closure',
        'alcohol', 'food', 'pyrotechnics', 'temporary_structure', 'other'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Availability statuses
DO $$ BEGIN
    CREATE TYPE availability_status AS ENUM ('available', 'unavailable', 'tentative', 'preferred', 'blackout');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Travel request statuses
DO $$ BEGIN
    CREATE TYPE travel_status AS ENUM (
        'draft', 'submitted', 'approved', 'booked', 
        'in_progress', 'completed', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Recruitment pipeline statuses
DO $$ BEGIN
    CREATE TYPE candidate_status AS ENUM (
        'new', 'screening', 'phone_screen', 'interview', 
        'assessment', 'reference_check', 'offer', 'hired', 'rejected', 'withdrawn'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Punch item statuses
DO $$ BEGIN
    CREATE TYPE punch_item_status AS ENUM ('open', 'in_progress', 'pending_review', 'resolved', 'deferred');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Inspection types
DO $$ BEGIN
    CREATE TYPE inspection_type AS ENUM ('qc', 'safety', 'client_walkthrough', 'final_signoff', 'regulatory');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Inspection statuses
DO $$ BEGIN
    CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'passed', 'failed', 'conditional', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PROJECTS DOMAIN - PRODUCTIONS (SSOT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS productions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    production_code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    production_type production_type NOT NULL DEFAULT 'stage',
    client_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    project_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    account_executive_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility VARCHAR(50),
    event_start DATE,
    event_end DATE,
    load_in_date DATE,
    strike_date DATE,
    contract_value DECIMAL(15,2),
    status production_status NOT NULL DEFAULT 'intake',
    health production_health DEFAULT 'on_track',
    drive_folder_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, production_code)
);

CREATE INDEX IF NOT EXISTS idx_productions_org ON productions(organization_id);
CREATE INDEX IF NOT EXISTS idx_productions_status ON productions(status);
CREATE INDEX IF NOT EXISTS idx_productions_client ON productions(client_id);
CREATE INDEX IF NOT EXISTS idx_productions_dates ON productions(event_start, event_end);

-- ============================================================================
-- PROJECTS DOMAIN - ACTIVATIONS (SSOT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activation_code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    activation_type VARCHAR(50),
    client_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    setup_date DATE,
    teardown_date DATE,
    budget_amount DECIMAL(15,2),
    status production_status NOT NULL DEFAULT 'intake',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, activation_code)
);

CREATE INDEX IF NOT EXISTS idx_activations_org ON activations(organization_id);
CREATE INDEX IF NOT EXISTS idx_activations_status ON activations(status);

-- ============================================================================
-- PROJECTS DOMAIN - COMPLIANCE DOCUMENTS
-- ============================================================================

-- Permits
CREATE TABLE IF NOT EXISTS permits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    permit_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    permit_type permit_type NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    issuing_authority VARCHAR(255),
    jurisdiction VARCHAR(100),
    application_date DATE,
    approval_date DATE,
    effective_date DATE,
    expiration_date DATE,
    fee_amount DECIMAL(10,2),
    status permit_status NOT NULL DEFAULT 'pending',
    application_url TEXT,
    permit_url TEXT,
    requirements TEXT,
    conditions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, permit_number)
);

CREATE INDEX IF NOT EXISTS idx_permits_org ON permits(organization_id);
CREATE INDEX IF NOT EXISTS idx_permits_production ON permits(production_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(status);

-- Certificates of Insurance
CREATE TABLE IF NOT EXISTS certificates_of_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID, -- FK to vendors table not defined yet
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    insurance_provider VARCHAR(255),
    policy_number VARCHAR(100),
    coverage_type VARCHAR(100),
    coverage_amount DECIMAL(15,2),
    certificate_holder_name VARCHAR(255),
    certificate_holder_address TEXT,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, certificate_number)
);

CREATE INDEX IF NOT EXISTS idx_coi_org ON certificates_of_insurance(organization_id);
CREATE INDEX IF NOT EXISTS idx_coi_production ON certificates_of_insurance(production_id);

-- Safety Plans
CREATE TABLE IF NOT EXISTS safety_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    plan_type VARCHAR(50),
    version VARCHAR(20) DEFAULT '1.0',
    emergency_contacts JSONB DEFAULT '[]',
    evacuation_procedures TEXT,
    medical_plan TEXT,
    fire_safety TEXT,
    weather_contingency TEXT,
    crowd_management TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'archived')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(organization_id, plan_number)
);

CREATE INDEX IF NOT EXISTS idx_safety_plans_org ON safety_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_production ON safety_plans(production_id);
