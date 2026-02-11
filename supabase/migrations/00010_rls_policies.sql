-- ATLVS Platform Database Schema
-- Row Level Security (RLS) Policies

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE runsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE runsheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cue_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_check_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_call_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's organization IDs
CREATE OR REPLACE FUNCTION get_user_organization_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is organization owner
CREATE OR REPLACE FUNCTION is_organization_owner(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid() 
        AND is_owner = TRUE
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's role level in organization
CREATE OR REPLACE FUNCTION get_user_role_level(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    role_level INTEGER;
BEGIN
    SELECT r.level INTO role_level
    FROM organization_members om
    JOIN roles r ON om.role_id = r.id
    WHERE om.organization_id = org_id 
    AND om.user_id = auth.uid()
    AND om.status = 'active';
    
    RETURN COALESCE(role_level, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has permission
CREATE OR REPLACE FUNCTION has_permission(org_id UUID, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT r.permissions INTO user_permissions
    FROM organization_members om
    JOIN roles r ON om.role_id = r.id
    WHERE om.organization_id = org_id 
    AND om.user_id = auth.uid()
    AND om.status = 'active';
    
    RETURN COALESCE(user_permissions->permission_key, 'false')::BOOLEAN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- CORE TABLE POLICIES
-- ============================================================================

-- Organizations: Users can see organizations they belong to
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
CREATE POLICY "Owners can update their organizations"
    ON organizations FOR UPDATE
    USING (is_organization_owner(id));

-- Users: Users can see themselves and members of their organizations
DROP POLICY IF EXISTS "Users can view themselves" ON users;
CREATE POLICY "Users can view themselves"
    ON users FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can view organization members" ON users;
CREATE POLICY "Users can view organization members"
    ON users FOR SELECT
    USING (
        id IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = ANY(get_user_organization_ids())
        )
    );

DROP POLICY IF EXISTS "Users can update themselves" ON users;
CREATE POLICY "Users can update themselves"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Organization Members: Members can see other members in their organizations
DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;
CREATE POLICY "Members can view organization members"
    ON organization_members FOR SELECT
    USING (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Owners can manage organization members" ON organization_members;
CREATE POLICY "Owners can manage organization members"
    ON organization_members FOR ALL
    USING (is_organization_owner(organization_id));

-- Roles: Members can view roles in their organizations
DROP POLICY IF EXISTS "Members can view roles" ON roles;
CREATE POLICY "Members can view roles"
    ON roles FOR SELECT
    USING (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Owners can manage roles" ON roles;
CREATE POLICY "Owners can manage roles"
    ON roles FOR ALL
    USING (is_organization_owner(organization_id));

-- Departments: Members can view departments
DROP POLICY IF EXISTS "Members can view departments" ON departments;
CREATE POLICY "Members can view departments"
    ON departments FOR SELECT
    USING (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments"
    ON departments FOR ALL
    USING (get_user_role_level(organization_id) >= 80);

-- Positions: Members can view positions
DROP POLICY IF EXISTS "Members can view positions" ON positions;
CREATE POLICY "Members can view positions"
    ON positions FOR SELECT
    USING (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Admins can manage positions" ON positions;
CREATE POLICY "Admins can manage positions"
    ON positions FOR ALL
    USING (get_user_role_level(organization_id) >= 80);

-- Workspaces: Members can view workspaces
DROP POLICY IF EXISTS "Members can view workspaces" ON workspaces;
CREATE POLICY "Members can view workspaces"
    ON workspaces FOR SELECT
    USING (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Admins can manage workspaces" ON workspaces;
CREATE POLICY "Admins can manage workspaces"
    ON workspaces FOR ALL
    USING (get_user_role_level(organization_id) >= 80);

-- ============================================================================
-- PROJECT & TASK POLICIES
-- ============================================================================

-- Projects: Members can view projects based on visibility
DROP POLICY IF EXISTS "Members can view projects" ON projects;
CREATE POLICY "Members can view projects"
    ON projects FOR SELECT
    USING (
        organization_id = ANY(get_user_organization_ids())
        AND (
            visibility = 'organization'
            OR visibility = 'public'
            OR created_by = auth.uid()
            OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can create projects" ON projects;
CREATE POLICY "Members can create projects"
    ON projects FOR INSERT
    WITH CHECK (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Project members can update projects" ON projects;
CREATE POLICY "Project members can update projects"
    ON projects FOR UPDATE
    USING (
        created_by = auth.uid()
        OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
        OR get_user_role_level(organization_id) >= 80
    );

-- Tasks: Members can view tasks in their projects
DROP POLICY IF EXISTS "Members can view tasks" ON tasks;
CREATE POLICY "Members can view tasks"
    ON tasks FOR SELECT
    USING (
        organization_id = ANY(get_user_organization_ids())
        AND (
            project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
            OR created_by = auth.uid()
            OR id IN (SELECT task_id FROM task_assignments WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Members can create tasks" ON tasks;
CREATE POLICY "Members can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (organization_id = ANY(get_user_organization_ids()));

DROP POLICY IF EXISTS "Assignees can update tasks" ON tasks;
CREATE POLICY "Assignees can update tasks"
    ON tasks FOR UPDATE
    USING (
        created_by = auth.uid()
        OR id IN (SELECT task_id FROM task_assignments WHERE user_id = auth.uid())
        OR get_user_role_level(organization_id) >= 60
    );

-- ============================================================================
-- GENERIC ORGANIZATION-SCOPED POLICIES
-- ============================================================================

-- Create a function to generate standard policies for organization-scoped tables
CREATE OR REPLACE FUNCTION create_org_policies(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Select policy
    EXECUTE format('
        CREATE POLICY "Members can view %I"
        ON %I FOR SELECT
        USING (organization_id = ANY(get_user_organization_ids()));
    ', table_name, table_name);
    
    -- Insert policy
    EXECUTE format('
        CREATE POLICY "Members can create %I"
        ON %I FOR INSERT
        WITH CHECK (organization_id = ANY(get_user_organization_ids()));
    ', table_name, table_name);
    
    -- Update policy
    EXECUTE format('
        CREATE POLICY "Members can update %I"
        ON %I FOR UPDATE
        USING (organization_id = ANY(get_user_organization_ids()));
    ', table_name, table_name);
    
    -- Delete policy (admin only)
    EXECUTE format('
        CREATE POLICY "Admins can delete %I"
        ON %I FOR DELETE
        USING (get_user_role_level(organization_id) >= 80);
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply standard policies to organization-scoped tables
SELECT create_org_policies('events');
-- event_days uses event_id to inherit organization access (no organization_id column)
SELECT create_org_policies('stages');
SELECT create_org_policies('show_calls');
SELECT create_org_policies('runsheets');
SELECT create_org_policies('cue_sheets');
SELECT create_org_policies('production_notes');
SELECT create_org_policies('incident_reports');
SELECT create_org_policies('asset_categories');
SELECT create_org_policies('locations');
SELECT create_org_policies('assets');
SELECT create_org_policies('asset_kits');
SELECT create_org_policies('asset_check_actions');
SELECT create_org_policies('asset_reservations');
SELECT create_org_policies('asset_maintenance');
SELECT create_org_policies('inventory_items');
SELECT create_org_policies('inventory_transactions');
SELECT create_org_policies('certification_types');
SELECT create_org_policies('user_certifications');
SELECT create_org_policies('skills');
SELECT create_org_policies('rate_cards');
SELECT create_org_policies('user_availability');
SELECT create_org_policies('crew_calls');
SELECT create_org_policies('crew_assignments');
SELECT create_org_policies('shifts');
SELECT create_org_policies('timesheets');
SELECT create_org_policies('contractors');
SELECT create_org_policies('budget_categories');
SELECT create_org_policies('budgets');
SELECT create_org_policies('invoices');
SELECT create_org_policies('payments');
SELECT create_org_policies('expenses');
SELECT create_org_policies('purchase_requisitions');
SELECT create_org_policies('purchase_orders');
SELECT create_org_policies('contracts');
SELECT create_org_policies('companies');
SELECT create_org_policies('contacts');
SELECT create_org_policies('deals');
SELECT create_org_policies('pipeline_stages');
SELECT create_org_policies('activities');
SELECT create_org_policies('proposals');
SELECT create_org_policies('venues');
SELECT create_org_policies('site_surveys');
SELECT create_org_policies('media');
SELECT create_org_policies('brand_guidelines');
SELECT create_org_policies('campaigns');
SELECT create_org_policies('marketing_materials');
SELECT create_org_policies('social_posts');
SELECT create_org_policies('content_approvals');
SELECT create_org_policies('talent_profiles');
SELECT create_org_policies('talent_bookings');
SELECT create_org_policies('riders');
SELECT create_org_policies('setlists');
SELECT create_org_policies('talent_payments');
SELECT create_org_policies('ticket_types');
SELECT create_org_policies('ticket_orders');
SELECT create_org_policies('tickets');
SELECT create_org_policies('guest_lists');
SELECT create_org_policies('hospitality_requests');
SELECT create_org_policies('accommodations');
SELECT create_org_policies('transportation');
SELECT create_org_policies('catering_orders');
SELECT create_org_policies('community_members');
SELECT create_org_policies('community_posts');
SELECT create_org_policies('workflow_templates');
SELECT create_org_policies('workflow_runs');
SELECT create_org_policies('approval_workflows');
SELECT create_org_policies('approval_requests');
SELECT create_org_policies('document_folders');
SELECT create_org_policies('documents');
SELECT create_org_policies('custom_field_definitions');
SELECT create_org_policies('custom_field_values');
SELECT create_org_policies('tags');

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- AUDIT LOG POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (get_user_role_level(organization_id) >= 80);

-- Drop the helper function after use
DROP FUNCTION IF EXISTS create_org_policies(TEXT);
