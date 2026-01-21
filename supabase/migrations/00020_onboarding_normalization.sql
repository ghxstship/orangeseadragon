-- ATLVS Platform Database Schema
-- Onboarding & Account Type Normalization
-- Supports multi-account-type onboarding with 3NF compliance

-- ============================================================================
-- ACCOUNT TYPE CONFIGURATION
-- ============================================================================

-- Account Type Configurations (single source of truth for account types)
CREATE TABLE account_type_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    default_role_slug VARCHAR(100),
    onboarding_steps TEXT[] DEFAULT '{}',
    required_fields JSONB DEFAULT '[]',
    feature_flags JSONB DEFAULT '{}',
    is_internal BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_account_type_configs_slug ON account_type_configs(slug);
CREATE INDEX idx_account_type_configs_active ON account_type_configs(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ONBOARDING SYSTEM
-- ============================================================================

-- Onboarding Step Definitions
CREATE TABLE onboarding_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    help_text TEXT,
    icon VARCHAR(50),
    position INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    is_skippable BOOLEAN DEFAULT FALSE,
    applicable_account_types TEXT[] DEFAULT '{}',
    applicable_subscription_tiers subscription_tier[] DEFAULT '{}',
    estimated_minutes INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_steps_slug ON onboarding_steps(slug);
CREATE INDEX idx_onboarding_steps_position ON onboarding_steps(position);

-- User Onboarding Progress
CREATE TABLE user_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES onboarding_steps(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    skipped_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id, step_id)
);

CREATE INDEX idx_user_onboarding_progress_user ON user_onboarding_progress(user_id);
CREATE INDEX idx_user_onboarding_progress_org ON user_onboarding_progress(organization_id);
CREATE INDEX idx_user_onboarding_progress_status ON user_onboarding_progress(status);

-- User Onboarding State (tracks overall onboarding completion)
CREATE TABLE user_onboarding_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_type_slug VARCHAR(50) NOT NULL,
    current_step_slug VARCHAR(50),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_onboarding_state_user ON user_onboarding_state(user_id);
CREATE INDEX idx_user_onboarding_state_completed ON user_onboarding_state(is_completed);

-- ============================================================================
-- INVITATION SYSTEM
-- ============================================================================

-- Organization Invitations (normalized invitation tracking)
CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    account_type_slug VARCHAR(50) DEFAULT 'member',
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    reminder_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email, revoked_at)
);

CREATE INDEX idx_organization_invitations_org ON organization_invitations(organization_id);
CREATE INDEX idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX idx_organization_invitations_pending ON organization_invitations(organization_id, accepted_at, declined_at, revoked_at) 
    WHERE accepted_at IS NULL AND declined_at IS NULL AND revoked_at IS NULL;

-- ============================================================================
-- PERMISSION DEFINITIONS (normalize permissions)
-- ============================================================================

-- Permission Definitions (single source of truth for all permissions)
CREATE TABLE permission_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    tier_required subscription_tier DEFAULT 'core',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_permission_definitions_category ON permission_definitions(category);
CREATE INDEX idx_permission_definitions_resource ON permission_definitions(resource);

-- ============================================================================
-- USER PROFILE ENHANCEMENTS
-- ============================================================================

-- Add account_type to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;

CREATE INDEX idx_users_account_type ON users(account_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_account_type_configs_updated_at
    BEFORE UPDATE ON account_type_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_steps_updated_at
    BEFORE UPDATE ON onboarding_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_progress_updated_at
    BEFORE UPDATE ON user_onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_state_updated_at
    BEFORE UPDATE ON user_onboarding_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_invitations_updated_at
    BEFORE UPDATE ON organization_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Account Types
-- ============================================================================

INSERT INTO account_type_configs (slug, name, description, icon, color, default_role_slug, onboarding_steps, is_internal, position) VALUES
('owner', 'Organization Owner', 'Full access to organization settings, billing, and team management', 'crown', '#6366f1', 'owner', 
 ARRAY['welcome', 'organization_profile', 'billing_setup', 'team_invite', 'integrations', 'preferences'], FALSE, 1),

('admin', 'Administrator', 'Manage organization settings, users, and permissions', 'shield', '#8b5cf6', 'admin',
 ARRAY['welcome', 'profile', 'permissions_overview', 'workspace_setup', 'preferences'], FALSE, 2),

('project_manager', 'Project Manager', 'Manage projects, events, and team assignments', 'folder-kanban', '#0ea5e9', 'project_manager',
 ARRAY['welcome', 'profile', 'project_overview', 'team_assignment', 'preferences'], FALSE, 3),

('finance_manager', 'Finance Manager', 'Manage budgets, invoices, and financial reporting', 'wallet', '#10b981', 'finance_manager',
 ARRAY['welcome', 'profile', 'budget_overview', 'approval_workflows', 'preferences'], FALSE, 4),

('crew_member', 'Crew Member', 'View assignments, submit timesheets, and manage availability', 'hard-hat', '#f59e0b', 'crew_member',
 ARRAY['welcome', 'profile', 'skills_certifications', 'availability', 'preferences'], FALSE, 5),

('artist', 'Artist / Talent', 'Manage bookings, riders, and performance details', 'music', '#ec4899', 'artist',
 ARRAY['welcome', 'profile', 'portfolio', 'rider_setup', 'availability', 'preferences'], FALSE, 6),

('vendor', 'Vendor', 'Manage services, rate cards, and documents', 'store', '#14b8a6', 'vendor',
 ARRAY['welcome', 'company_profile', 'services_catalog', 'rate_cards', 'documents', 'preferences'], FALSE, 7),

('client', 'Client', 'View project progress and communicate with team', 'briefcase', '#64748b', 'client',
 ARRAY['welcome', 'profile', 'project_access', 'communication_preferences'], FALSE, 8),

('volunteer', 'Volunteer', 'View assignments and submit availability', 'heart-handshake', '#f43f5e', 'volunteer',
 ARRAY['welcome', 'profile', 'availability', 'training', 'preferences'], FALSE, 9),

('member', 'Team Member', 'Standard team member with basic access', 'user', '#6b7280', 'member',
 ARRAY['welcome', 'profile', 'preferences'], FALSE, 10);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE account_type_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_definitions ENABLE ROW LEVEL SECURITY;

-- Account Type Configs: Read-only for all authenticated users
CREATE POLICY "Account type configs are viewable by authenticated users"
    ON account_type_configs FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Onboarding Steps: Read-only for all authenticated users
CREATE POLICY "Onboarding steps are viewable by authenticated users"
    ON onboarding_steps FOR SELECT
    TO authenticated
    USING (TRUE);

-- User Onboarding Progress: Users can manage their own progress
CREATE POLICY "Users can view their own onboarding progress"
    ON user_onboarding_progress FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own onboarding progress"
    ON user_onboarding_progress FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding progress"
    ON user_onboarding_progress FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- User Onboarding State: Users can manage their own state
CREATE POLICY "Users can view their own onboarding state"
    ON user_onboarding_state FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own onboarding state"
    ON user_onboarding_state FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding state"
    ON user_onboarding_state FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Organization Invitations: Complex policies based on role
CREATE POLICY "Users can view invitations for their email"
    ON organization_invitations FOR SELECT
    TO authenticated
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Org admins can create invitations"
    ON organization_invitations FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN roles r ON om.role_id = r.id
            WHERE om.user_id = auth.uid() 
            AND om.status = 'active'
            AND (om.is_owner = TRUE OR r.permissions->>'team.invite' = 'true' OR r.permissions->>'*' = 'true')
        )
    );

CREATE POLICY "Org admins can update invitations"
    ON organization_invitations FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN roles r ON om.role_id = r.id
            WHERE om.user_id = auth.uid() 
            AND om.status = 'active'
            AND (om.is_owner = TRUE OR r.permissions->>'team.invite' = 'true' OR r.permissions->>'*' = 'true')
        )
    );

-- Permission Definitions: Read-only for all authenticated users
CREATE POLICY "Permission definitions are viewable by authenticated users"
    ON permission_definitions FOR SELECT
    TO authenticated
    USING (TRUE);

-- ============================================================================
-- SEED DATA: Onboarding Steps
-- ============================================================================

INSERT INTO onboarding_steps (slug, name, description, help_text, icon, position, is_required, is_skippable, applicable_account_types, estimated_minutes) VALUES
('welcome', 'Welcome', 'Welcome to ATLVS - let''s get you set up', 'This quick setup will help you get the most out of ATLVS', 'sparkles', 1, TRUE, FALSE, 
 ARRAY['owner', 'admin', 'project_manager', 'finance_manager', 'crew_member', 'artist', 'vendor', 'client', 'volunteer', 'member'], 1),

('profile', 'Complete Your Profile', 'Add your photo and contact information', 'A complete profile helps your team recognize and contact you', 'user-circle', 2, TRUE, FALSE,
 ARRAY['admin', 'project_manager', 'finance_manager', 'crew_member', 'artist', 'client', 'volunteer', 'member'], 2),

('organization_profile', 'Organization Profile', 'Set up your organization details', 'This information appears on invoices, contracts, and public pages', 'building-2', 2, TRUE, FALSE,
 ARRAY['owner'], 3),

('company_profile', 'Company Profile', 'Set up your company details', 'This information appears on proposals and invoices', 'building', 2, TRUE, FALSE,
 ARRAY['vendor'], 3),

('billing_setup', 'Billing & Subscription', 'Choose your plan and add payment method', 'Start with a 14-day free trial of all features', 'credit-card', 3, TRUE, TRUE,
 ARRAY['owner'], 5),

('team_invite', 'Invite Your Team', 'Add team members to your organization', 'You can always invite more people later', 'users-plus', 4, FALSE, TRUE,
 ARRAY['owner'], 3),

('permissions_overview', 'Review Permissions', 'Understand your access level', 'See what you can do in ATLVS', 'shield-check', 3, TRUE, FALSE,
 ARRAY['admin'], 2),

('workspace_setup', 'Workspace Setup', 'Configure your default workspace', 'Organize your projects and teams', 'layout-dashboard', 4, FALSE, TRUE,
 ARRAY['admin'], 3),

('project_overview', 'Project Overview', 'Learn how to manage projects', 'Quick tour of project management features', 'folder-kanban', 3, TRUE, FALSE,
 ARRAY['project_manager'], 3),

('team_assignment', 'Team Assignment', 'Learn how to assign team members', 'Assign crew and resources to your projects', 'user-plus', 4, FALSE, TRUE,
 ARRAY['project_manager'], 2),

('budget_overview', 'Budget Overview', 'Learn how to manage budgets', 'Track income, expenses, and forecasts', 'pie-chart', 3, TRUE, FALSE,
 ARRAY['finance_manager'], 3),

('approval_workflows', 'Approval Workflows', 'Set up expense and invoice approvals', 'Configure who can approve what', 'check-circle', 4, FALSE, TRUE,
 ARRAY['finance_manager'], 3),

('skills_certifications', 'Skills & Certifications', 'Add your skills and certifications', 'Help us match you with the right assignments', 'award', 3, TRUE, FALSE,
 ARRAY['crew_member'], 3),

('availability', 'Set Your Availability', 'Let us know when you''re available', 'Block out dates you''re unavailable', 'calendar', 4, TRUE, FALSE,
 ARRAY['crew_member', 'artist', 'volunteer'], 2),

('portfolio', 'Build Your Portfolio', 'Add your work samples and media', 'Showcase your talent to event organizers', 'images', 3, FALSE, TRUE,
 ARRAY['artist'], 5),

('rider_setup', 'Technical Rider', 'Set up your technical requirements', 'Define your standard technical and hospitality needs', 'clipboard-list', 4, FALSE, TRUE,
 ARRAY['artist'], 5),

('services_catalog', 'Services Catalog', 'List the services you offer', 'Help clients find and book your services', 'list', 3, TRUE, FALSE,
 ARRAY['vendor'], 3),

('rate_cards', 'Rate Cards', 'Set up your pricing', 'Define your standard rates and packages', 'dollar-sign', 4, TRUE, FALSE,
 ARRAY['vendor'], 3),

('documents', 'Documents', 'Upload required documents', 'Insurance, licenses, and certifications', 'file-text', 5, FALSE, TRUE,
 ARRAY['vendor'], 3),

('project_access', 'Project Access', 'View your projects', 'See the projects you''ve been invited to', 'folder-open', 3, TRUE, FALSE,
 ARRAY['client'], 2),

('communication_preferences', 'Communication Preferences', 'Set how you want to be notified', 'Choose email, SMS, or in-app notifications', 'bell', 4, FALSE, TRUE,
 ARRAY['client'], 2),

('training', 'Training Materials', 'Review volunteer guidelines', 'Important information for your role', 'book-open', 3, TRUE, FALSE,
 ARRAY['volunteer'], 5),

('integrations', 'Connect Integrations', 'Connect your favorite tools', 'Sync with calendars, accounting, and more', 'plug', 5, FALSE, TRUE,
 ARRAY['owner'], 3),

('preferences', 'Preferences', 'Set your display and notification preferences', 'Customize your ATLVS experience', 'settings', 99, FALSE, TRUE,
 ARRAY['owner', 'admin', 'project_manager', 'finance_manager', 'crew_member', 'artist', 'vendor', 'volunteer', 'member'], 2);

-- ============================================================================
-- SEED DATA: Permission Definitions
-- ============================================================================

INSERT INTO permission_definitions (slug, name, description, category, resource, action, tier_required, is_system) VALUES
-- Projects
('projects.view', 'View Projects', 'View project details and status', 'Projects', 'projects', 'view', 'core', TRUE),
('projects.create', 'Create Projects', 'Create new projects', 'Projects', 'projects', 'create', 'core', TRUE),
('projects.edit', 'Edit Projects', 'Edit project details', 'Projects', 'projects', 'edit', 'core', TRUE),
('projects.delete', 'Delete Projects', 'Delete projects', 'Projects', 'projects', 'delete', 'core', TRUE),
('projects.archive', 'Archive Projects', 'Archive completed projects', 'Projects', 'projects', 'archive', 'core', TRUE),

-- Events
('events.view', 'View Events', 'View event details', 'Events', 'events', 'view', 'core', TRUE),
('events.create', 'Create Events', 'Create new events', 'Events', 'events', 'create', 'core', TRUE),
('events.edit', 'Edit Events', 'Edit event details', 'Events', 'events', 'edit', 'core', TRUE),
('events.delete', 'Delete Events', 'Delete events', 'Events', 'events', 'delete', 'core', TRUE),
('events.publish', 'Publish Events', 'Publish events to public', 'Events', 'events', 'publish', 'pro', FALSE),

-- Team
('team.view', 'View Team', 'View team members', 'Team', 'team', 'view', 'core', TRUE),
('team.invite', 'Invite Members', 'Invite new team members', 'Team', 'team', 'invite', 'core', TRUE),
('team.manage', 'Manage Team', 'Edit team member roles', 'Team', 'team', 'manage', 'core', TRUE),
('team.remove', 'Remove Members', 'Remove team members', 'Team', 'team', 'remove', 'core', TRUE),

-- Finance
('finance.view', 'View Finance', 'View financial data', 'Finance', 'finance', 'view', 'core', TRUE),
('finance.create', 'Create Financial Records', 'Create invoices, expenses', 'Finance', 'finance', 'create', 'core', TRUE),
('finance.approve', 'Approve Financial', 'Approve expenses and invoices', 'Finance', 'finance', 'approve', 'core', TRUE),
('finance.reports', 'Financial Reports', 'Generate financial reports', 'Finance', 'finance', 'reports', 'pro', FALSE),

-- Assets
('assets.view', 'View Assets', 'View asset inventory', 'Assets', 'assets', 'view', 'core', TRUE),
('assets.create', 'Create Assets', 'Add new assets', 'Assets', 'assets', 'create', 'core', TRUE),
('assets.edit', 'Edit Assets', 'Edit asset details', 'Assets', 'assets', 'edit', 'core', TRUE),
('assets.checkout', 'Checkout Assets', 'Check out assets', 'Assets', 'assets', 'checkout', 'core', TRUE),

-- Crew
('crew.view', 'View Crew', 'View crew members', 'Crew', 'crew', 'view', 'core', TRUE),
('crew.schedule', 'Schedule Crew', 'Create crew schedules', 'Crew', 'crew', 'schedule', 'core', TRUE),
('crew.timesheets', 'Manage Timesheets', 'Approve timesheets', 'Crew', 'crew', 'timesheets', 'core', TRUE),

-- Settings
('settings.view', 'View Settings', 'View organization settings', 'Settings', 'settings', 'view', 'core', TRUE),
('settings.edit', 'Edit Settings', 'Edit organization settings', 'Settings', 'settings', 'edit', 'core', TRUE),
('settings.billing', 'Manage Billing', 'Manage subscription and billing', 'Settings', 'settings', 'billing', 'core', TRUE),
('settings.integrations', 'Manage Integrations', 'Configure integrations', 'Settings', 'settings', 'integrations', 'pro', FALSE);
