-- ATLVS Platform Database Schema
-- Phase 2: Database Schema (3NF)
-- This migration creates the core tables for the unified operations platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Subscription & Billing
CREATE TYPE subscription_tier AS ENUM ('core', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

-- Member Status
CREATE TYPE member_status AS ENUM ('active', 'invited', 'suspended', 'deactivated');

-- Project & Task
CREATE TYPE project_status AS ENUM ('draft', 'planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived');
CREATE TYPE visibility_type AS ENUM ('private', 'team', 'organization', 'public');
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');
CREATE TYPE task_type AS ENUM ('task', 'bug', 'feature', 'epic', 'story', 'milestone');
CREATE TYPE dependency_type AS ENUM ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish');

-- Events & Production
CREATE TYPE event_type AS ENUM ('festival', 'conference', 'concert', 'activation', 'corporate', 'wedding', 'private', 'tour', 'production');
CREATE TYPE event_phase AS ENUM ('concept', 'planning', 'pre_production', 'setup', 'active', 'live', 'teardown', 'post_mortem', 'archived');
CREATE TYPE show_call_status AS ENUM ('draft', 'published', 'active', 'completed');
CREATE TYPE runsheet_status AS ENUM ('draft', 'approved', 'active', 'locked');
CREATE TYPE runsheet_item_type AS ENUM ('performance', 'transition', 'break', 'announcement', 'technical', 'ceremony', 'speech', 'other');
CREATE TYPE runsheet_item_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'delayed');
CREATE TYPE cue_department AS ENUM ('lighting', 'audio', 'video', 'pyro', 'sfx', 'rigging', 'staging');
CREATE TYPE cue_type AS ENUM ('go', 'standby', 'warning', 'hold', 'cut');
CREATE TYPE trigger_type AS ENUM ('manual', 'timecode', 'midi', 'osc', 'follow');

-- Assets
CREATE TYPE asset_status AS ENUM ('available', 'in_use', 'maintenance', 'reserved', 'retired', 'lost', 'damaged');
CREATE TYPE asset_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'broken');
CREATE TYPE depreciation_method AS ENUM ('straight_line', 'declining_balance', 'none');
CREATE TYPE location_type AS ENUM ('warehouse', 'venue', 'vehicle', 'office', 'external', 'virtual');
CREATE TYPE check_action_type AS ENUM ('check_out', 'check_in', 'transfer', 'reserve', 'release');
CREATE TYPE scan_method AS ENUM ('qr', 'barcode', 'rfid', 'nfc', 'manual');
CREATE TYPE maintenance_type AS ENUM ('preventive', 'corrective', 'inspection', 'calibration');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE inventory_transaction_type AS ENUM ('receipt', 'issue', 'adjustment', 'transfer', 'return', 'waste');

-- Workforce
CREATE TYPE crew_call_status AS ENUM ('draft', 'published', 'confirmed', 'active', 'completed', 'cancelled');
CREATE TYPE rate_type AS ENUM ('hourly', 'daily', 'flat');
CREATE TYPE assignment_status AS ENUM ('invited', 'confirmed', 'declined', 'checked_in', 'checked_out', 'no_show');
CREATE TYPE shift_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'paid');
CREATE TYPE certification_status AS ENUM ('pending', 'active', 'expired', 'revoked');
CREATE TYPE availability_type AS ENUM ('available', 'unavailable', 'tentative', 'preferred');

-- Finance
CREATE TYPE budget_period_type AS ENUM ('annual', 'quarterly', 'monthly', 'project', 'event');
CREATE TYPE budget_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'closed');
CREATE TYPE budget_category_type AS ENUM ('income', 'expense', 'capital');
CREATE TYPE invoice_type AS ENUM ('standard', 'credit', 'proforma', 'recurring');
CREATE TYPE invoice_direction AS ENUM ('receivable', 'payable');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled', 'disputed');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'check', 'cash', 'paypal', 'stripe', 'other');
CREATE TYPE expense_status AS ENUM ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'reimbursed');
CREATE TYPE requisition_priority AS ENUM ('urgent', 'high', 'normal', 'low');
CREATE TYPE requisition_status AS ENUM ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'ordered', 'received', 'cancelled');
CREATE TYPE po_status AS ENUM ('draft', 'sent', 'acknowledged', 'partially_received', 'received', 'invoiced', 'paid', 'cancelled');
CREATE TYPE contract_type AS ENUM ('vendor', 'client', 'employment', 'nda', 'service', 'licensing', 'rental', 'sponsorship');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated', 'renewed');
CREATE TYPE renewal_type AS ENUM ('none', 'auto', 'manual');
CREATE TYPE counterparty_type AS ENUM ('company', 'contact', 'vendor', 'user');

-- CRM & Business
CREATE TYPE company_type AS ENUM ('prospect', 'client', 'partner', 'vendor', 'competitor');
CREATE TYPE deal_type AS ENUM ('new_business', 'expansion', 'renewal', 'other');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'demo', 'proposal');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired');

-- Venues
CREATE TYPE venue_type AS ENUM ('indoor', 'outdoor', 'hybrid', 'virtual');

-- Content
CREATE TYPE media_status AS ENUM ('processing', 'active', 'archived');
CREATE TYPE brand_guideline_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE campaign_type AS ENUM ('launch', 'awareness', 'engagement', 'conversion', 'retention', 'event', 'seasonal');
CREATE TYPE campaign_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE material_type AS ENUM ('flyer', 'poster', 'banner', 'social_post', 'email', 'video', 'brochure', 'presentation', 'press_release');
CREATE TYPE material_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'archived');
CREATE TYPE social_platform AS ENUM ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'threads');
CREATE TYPE social_post_status AS ENUM ('draft', 'scheduled', 'published', 'failed', 'deleted');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');

-- Talent
CREATE TYPE talent_type AS ENUM ('dj', 'band', 'solo_artist', 'speaker', 'mc', 'performer', 'comedian', 'other');
CREATE TYPE booking_status AS ENUM ('available', 'limited', 'unavailable');
CREATE TYPE talent_booking_status AS ENUM ('inquiry', 'negotiating', 'confirmed', 'contracted', 'cancelled', 'completed');
CREATE TYPE performance_type AS ENUM ('headliner', 'support', 'opener', 'special_guest', 'resident');
CREATE TYPE fee_type AS ENUM ('flat', 'guarantee', 'vs_percentage', 'guarantee_plus_percentage');
CREATE TYPE rider_type AS ENUM ('technical', 'hospitality', 'combined');
CREATE TYPE rider_status AS ENUM ('draft', 'submitted', 'approved', 'signed');
CREATE TYPE rider_item_category AS ENUM ('audio', 'lighting', 'video', 'backline', 'staging', 'hospitality', 'catering', 'accommodation', 'transportation', 'security', 'other');
CREATE TYPE rider_item_provider AS ENUM ('artist', 'venue', 'promoter');
CREATE TYPE rider_item_status AS ENUM ('pending', 'confirmed', 'substituted', 'not_available');
CREATE TYPE talent_payment_type AS ENUM ('deposit', 'balance', 'bonus', 'reimbursement');
CREATE TYPE talent_payment_method AS ENUM ('wire', 'check', 'paypal', 'cash', 'crypto');
CREATE TYPE talent_payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE setlist_status AS ENUM ('draft', 'submitted', 'approved', 'performed');
CREATE TYPE schedule_status AS ENUM ('draft', 'published', 'locked');

-- Tickets & Experience
CREATE TYPE ticket_status AS ENUM ('reserved', 'purchased', 'checked_in', 'cancelled', 'refunded', 'transferred');
CREATE TYPE ticket_tier AS ENUM ('general', 'vip', 'premium', 'backstage', 'artist', 'media', 'staff', 'comp');
CREATE TYPE ticket_order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE guest_list_type AS ENUM ('vip', 'artist', 'media', 'sponsor', 'staff', 'comp');
CREATE TYPE guest_list_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE guest_entry_status AS ENUM ('pending', 'confirmed', 'checked_in', 'no_show');
CREATE TYPE hospitality_request_type AS ENUM ('accommodation', 'transportation', 'catering', 'greenroom', 'security', 'other');
CREATE TYPE hospitality_status AS ENUM ('pending', 'approved', 'fulfilled', 'cancelled');
CREATE TYPE accommodation_status AS ENUM ('booked', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE transport_type AS ENUM ('flight', 'ground', 'shuttle', 'rideshare', 'rental', 'private');
CREATE TYPE transport_status AS ENUM ('booked', 'confirmed', 'in_transit', 'completed', 'cancelled');
CREATE TYPE catering_order_type AS ENUM ('greenroom', 'crew_meal', 'vip', 'hospitality', 'concession');
CREATE TYPE catering_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');
CREATE TYPE community_member_type AS ENUM ('fan', 'artist', 'creator', 'influencer', 'brand');
CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'poll', 'event', 'article');
CREATE TYPE post_visibility AS ENUM ('public', 'followers', 'private');

-- Documents
CREATE TYPE document_type AS ENUM ('document', 'template', 'wiki', 'note');
CREATE TYPE document_status AS ENUM ('draft', 'published', 'archived');

-- Workflows
CREATE TYPE workflow_trigger_type AS ENUM ('entity_created', 'entity_updated', 'entity_deleted', 'field_changed', 'status_changed', 'schedule', 'webhook', 'manual', 'api_call', 'form_submitted', 'approval_decision', 'scan_event');
CREATE TYPE workflow_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE approval_workflow_type AS ENUM ('single_approver', 'any_of_list', 'all_of_list', 'sequential_chain', 'parallel_chain', 'manager_hierarchy', 'role_based');
CREATE TYPE approval_request_status AS ENUM ('pending', 'approved', 'rejected', 'escalated', 'cancelled');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    description TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    locale VARCHAR(10) DEFAULT 'en-US',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    subscription_tier subscription_tier DEFAULT 'core',
    subscription_status subscription_status DEFAULT 'trialing',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_tier, subscription_status);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(50),
    locale VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    tier subscription_tier DEFAULT 'core',
    is_system BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_roles_organization ON roles(organization_id);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_id);

-- Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_positions_organization ON positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);

-- Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    is_owner BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status member_status DEFAULT 'invited',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_organization ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role_id);

-- Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_organization ON workspaces(organization_id);

-- ============================================================================
-- PROJECT MANAGEMENT TABLES
-- ============================================================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'draft',
    visibility visibility_type DEFAULT 'team',
    priority priority_level DEFAULT 'medium',
    color VARCHAR(7),
    icon VARCHAR(50),
    start_date DATE,
    end_date DATE,
    budget_amount DECIMAL(12,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- Project Members
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Task Lists
CREATE TABLE task_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position INTEGER DEFAULT 0,
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_task_lists_project ON task_lists(project_id);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_list_id UUID REFERENCES task_lists(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'backlog',
    priority task_priority DEFAULT 'none',
    task_type task_type DEFAULT 'task',
    position FLOAT DEFAULT 0,
    depth INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(10,2),
    logged_hours DECIMAL(10,2) DEFAULT 0,
    custom_id VARCHAR(50),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Task Assignments
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(user_id);

-- Task Dependencies
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type dependency_type DEFAULT 'finish_to_start',
    lag_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_deps_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends ON task_dependencies(depends_on_task_id);

-- Milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);

-- ============================================================================
-- AUDIT & NOTIFICATIONS
-- ============================================================================

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
