-- ATLVS Platform Database Schema
-- Comprehensive RLS Policies for Multi-Tenant Security

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- auth.uid() is provided by Supabase - no need to create it

-- Get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_organization_ids() RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(organization_id)
  FROM organization_members
  WHERE user_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is organization owner
CREATE OR REPLACE FUNCTION is_organization_owner(org_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND is_owner = TRUE
    AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- has_permission function already defined in 00010_rls_policies.sql

-- Check if user is project member
CREATE OR REPLACE FUNCTION is_project_member(proj_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = proj_id
    AND user_id = auth.uid()
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core Tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Project Management
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Audit & Notifications
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Events & Production
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

-- Assets & Inventory
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

-- Workforce
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

-- Finance
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

-- CRM & Venues
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

-- Content & Talent
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

-- Experience
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

-- Workflows & Documents
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
-- RLS POLICIES - CORE TABLES
-- ============================================================================

-- Drop existing policies that may conflict (from 00010_rls_policies.sql)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Organizations: Users can only see orgs they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (is_organization_owner(id));

-- Users: Users can see themselves and members of their orgs
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (id = auth.uid() OR id IN (
    SELECT om.user_id FROM organization_members om
    WHERE om.organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND status = 'active')
  ));

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Roles: Members can view roles in their orgs
CREATE POLICY "Members can view roles"
  ON roles FOR SELECT
  USING (organization_id IS NULL OR is_organization_member(organization_id));

CREATE POLICY "Owners can manage roles"
  ON roles FOR ALL
  USING (organization_id IS NOT NULL AND is_organization_owner(organization_id));

-- Departments: Members can view, owners can manage
CREATE POLICY "Members can view departments"
  ON departments FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Owners can manage departments"
  ON departments FOR ALL
  USING (is_organization_owner(organization_id));

-- Positions: Members can view, owners can manage
CREATE POLICY "Members can view positions"
  ON positions FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Owners can manage positions"
  ON positions FOR ALL
  USING (is_organization_owner(organization_id));

-- Organization Members: Members can view, owners can manage
CREATE POLICY "Members can view org members"
  ON organization_members FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Owners can manage org members"
  ON organization_members FOR ALL
  USING (is_organization_owner(organization_id));

-- Workspaces: Members can view, owners can manage
CREATE POLICY "Members can view workspaces"
  ON workspaces FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Owners can manage workspaces"
  ON workspaces FOR ALL
  USING (is_organization_owner(organization_id));

-- ============================================================================
-- RLS POLICIES - PROJECT MANAGEMENT
-- ============================================================================

-- Projects: Members can view org projects
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (is_organization_member(organization_id));

CREATE POLICY "Project members can update"
  ON projects FOR UPDATE
  USING (is_organization_member(organization_id));

CREATE POLICY "Owners can delete projects"
  ON projects FOR DELETE
  USING (is_organization_owner(organization_id));

-- Project Members
CREATE POLICY "View project members"
  ON project_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND is_organization_member(p.organization_id)));

CREATE POLICY "Manage project members"
  ON project_members FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND is_organization_member(p.organization_id)));

-- Task Lists
CREATE POLICY "View task lists"
  ON task_lists FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage task lists"
  ON task_lists FOR ALL
  USING (is_organization_member(organization_id));

-- Tasks
CREATE POLICY "View tasks"
  ON tasks FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage tasks"
  ON tasks FOR ALL
  USING (is_organization_member(organization_id));

-- Task Assignments
CREATE POLICY "View task assignments"
  ON task_assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_organization_member(t.organization_id)));

CREATE POLICY "Manage task assignments"
  ON task_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_organization_member(t.organization_id)));

-- Task Dependencies
CREATE POLICY "View task dependencies"
  ON task_dependencies FOR SELECT
  USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_organization_member(t.organization_id)));

CREATE POLICY "Manage task dependencies"
  ON task_dependencies FOR ALL
  USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_id AND is_organization_member(t.organization_id)));

-- Milestones
CREATE POLICY "View milestones"
  ON milestones FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage milestones"
  ON milestones FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - AUDIT & NOTIFICATIONS
-- ============================================================================

-- Audit Logs: Read-only for members
CREATE POLICY "Members can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_organization_member(organization_id));

-- Notifications: Users see their own
CREATE POLICY "Users view their notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users manage their notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - EVENTS & PRODUCTION
-- ============================================================================

-- Events
CREATE POLICY "View events"
  ON events FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage events"
  ON events FOR ALL
  USING (is_organization_member(organization_id));

-- Event Days
CREATE POLICY "View event days"
  ON event_days FOR SELECT
  USING (EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_organization_member(e.organization_id)));

CREATE POLICY "Manage event days"
  ON event_days FOR ALL
  USING (EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_organization_member(e.organization_id)));

-- Stages
CREATE POLICY "View stages"
  ON stages FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage stages"
  ON stages FOR ALL
  USING (is_organization_member(organization_id));

-- Show Calls
CREATE POLICY "View show calls"
  ON show_calls FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage show calls"
  ON show_calls FOR ALL
  USING (is_organization_member(organization_id));

-- Runsheets
CREATE POLICY "View runsheets"
  ON runsheets FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage runsheets"
  ON runsheets FOR ALL
  USING (is_organization_member(organization_id));

-- Runsheet Items
CREATE POLICY "View runsheet items"
  ON runsheet_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM runsheets r WHERE r.id = runsheet_id AND is_organization_member(r.organization_id)));

CREATE POLICY "Manage runsheet items"
  ON runsheet_items FOR ALL
  USING (EXISTS (SELECT 1 FROM runsheets r WHERE r.id = runsheet_id AND is_organization_member(r.organization_id)));

-- Cue Sheets
CREATE POLICY "View cue sheets"
  ON cue_sheets FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage cue sheets"
  ON cue_sheets FOR ALL
  USING (is_organization_member(organization_id));

-- Cues
CREATE POLICY "View cues"
  ON cues FOR SELECT
  USING (EXISTS (SELECT 1 FROM cue_sheets cs WHERE cs.id = cue_sheet_id AND is_organization_member(cs.organization_id)));

CREATE POLICY "Manage cues"
  ON cues FOR ALL
  USING (EXISTS (SELECT 1 FROM cue_sheets cs WHERE cs.id = cue_sheet_id AND is_organization_member(cs.organization_id)));

-- Production Notes
CREATE POLICY "View production notes"
  ON production_notes FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage production notes"
  ON production_notes FOR ALL
  USING (is_organization_member(organization_id));

-- Incident Reports
CREATE POLICY "View incident reports"
  ON incident_reports FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage incident reports"
  ON incident_reports FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - ASSETS & INVENTORY
-- ============================================================================

-- Asset Categories
CREATE POLICY "View asset categories"
  ON asset_categories FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage asset categories"
  ON asset_categories FOR ALL
  USING (is_organization_member(organization_id));

-- Locations
CREATE POLICY "View locations"
  ON locations FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage locations"
  ON locations FOR ALL
  USING (is_organization_member(organization_id));

-- Assets
CREATE POLICY "View assets"
  ON assets FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage assets"
  ON assets FOR ALL
  USING (is_organization_member(organization_id));

-- Asset Kits
CREATE POLICY "View asset kits"
  ON asset_kits FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage asset kits"
  ON asset_kits FOR ALL
  USING (is_organization_member(organization_id));

-- Asset Kit Items
CREATE POLICY "View asset kit items"
  ON asset_kit_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM asset_kits ak WHERE ak.id = kit_id AND is_organization_member(ak.organization_id)));

CREATE POLICY "Manage asset kit items"
  ON asset_kit_items FOR ALL
  USING (EXISTS (SELECT 1 FROM asset_kits ak WHERE ak.id = kit_id AND is_organization_member(ak.organization_id)));

-- Asset Check Actions
CREATE POLICY "View asset check actions"
  ON asset_check_actions FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage asset check actions"
  ON asset_check_actions FOR ALL
  USING (is_organization_member(organization_id));

-- Asset Reservations
CREATE POLICY "View asset reservations"
  ON asset_reservations FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage asset reservations"
  ON asset_reservations FOR ALL
  USING (is_organization_member(organization_id));

-- Asset Maintenance
CREATE POLICY "View asset maintenance"
  ON asset_maintenance FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage asset maintenance"
  ON asset_maintenance FOR ALL
  USING (is_organization_member(organization_id));

-- Inventory Items
CREATE POLICY "View inventory items"
  ON inventory_items FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage inventory items"
  ON inventory_items FOR ALL
  USING (is_organization_member(organization_id));

-- Inventory Transactions
CREATE POLICY "View inventory transactions"
  ON inventory_transactions FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage inventory transactions"
  ON inventory_transactions FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - WORKFORCE
-- ============================================================================

-- Certification Types
CREATE POLICY "View certification types"
  ON certification_types FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage certification types"
  ON certification_types FOR ALL
  USING (is_organization_member(organization_id));

-- User Certifications
CREATE POLICY "View user certifications"
  ON user_certifications FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Manage user certifications"
  ON user_certifications FOR ALL
  USING (is_organization_member(organization_id));

-- Skills
CREATE POLICY "View skills"
  ON skills FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage skills"
  ON skills FOR ALL
  USING (is_organization_member(organization_id));

-- User Skills
CREATE POLICY "View user skills"
  ON user_skills FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members om WHERE om.user_id = user_skills.user_id
    AND is_organization_member(om.organization_id)
  ));

CREATE POLICY "Users manage their skills"
  ON user_skills FOR ALL
  USING (user_id = auth.uid());

-- Rate Cards
CREATE POLICY "View rate cards"
  ON rate_cards FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage rate cards"
  ON rate_cards FOR ALL
  USING (is_organization_owner(organization_id));

-- Rate Card Items
CREATE POLICY "View rate card items"
  ON rate_card_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM rate_cards rc WHERE rc.id = rate_card_id AND is_organization_member(rc.organization_id)));

CREATE POLICY "Manage rate card items"
  ON rate_card_items FOR ALL
  USING (EXISTS (SELECT 1 FROM rate_cards rc WHERE rc.id = rate_card_id AND is_organization_owner(rc.organization_id)));

-- User Availability
CREATE POLICY "View user availability"
  ON user_availability FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Users manage their availability"
  ON user_availability FOR ALL
  USING (user_id = auth.uid() OR is_organization_member(organization_id));

-- Crew Calls
CREATE POLICY "View crew calls"
  ON crew_calls FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage crew calls"
  ON crew_calls FOR ALL
  USING (is_organization_member(organization_id));

-- Crew Call Positions
CREATE POLICY "View crew call positions"
  ON crew_call_positions FOR SELECT
  USING (EXISTS (SELECT 1 FROM crew_calls cc WHERE cc.id = crew_call_id AND is_organization_member(cc.organization_id)));

CREATE POLICY "Manage crew call positions"
  ON crew_call_positions FOR ALL
  USING (EXISTS (SELECT 1 FROM crew_calls cc WHERE cc.id = crew_call_id AND is_organization_member(cc.organization_id)));

-- Crew Assignments
CREATE POLICY "View crew assignments"
  ON crew_assignments FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Manage crew assignments"
  ON crew_assignments FOR ALL
  USING (is_organization_member(organization_id));

-- Shifts
CREATE POLICY "View shifts"
  ON shifts FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Manage shifts"
  ON shifts FOR ALL
  USING (is_organization_member(organization_id));

-- Timesheets
CREATE POLICY "View timesheets"
  ON timesheets FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Users manage their timesheets"
  ON timesheets FOR ALL
  USING (user_id = auth.uid() OR is_organization_member(organization_id));

-- Timesheet Entries
CREATE POLICY "View timesheet entries"
  ON timesheet_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM timesheets t WHERE t.id = timesheet_id AND (is_organization_member(t.organization_id) OR t.user_id = auth.uid())));

CREATE POLICY "Manage timesheet entries"
  ON timesheet_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM timesheets t WHERE t.id = timesheet_id AND (t.user_id = auth.uid() OR is_organization_member(t.organization_id))));

-- Contractors
CREATE POLICY "View contractors"
  ON contractors FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage contractors"
  ON contractors FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - FINANCE
-- ============================================================================

-- Budget Categories
CREATE POLICY "View budget categories"
  ON budget_categories FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage budget categories"
  ON budget_categories FOR ALL
  USING (is_organization_member(organization_id));

-- Budgets
CREATE POLICY "View budgets"
  ON budgets FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage budgets"
  ON budgets FOR ALL
  USING (is_organization_member(organization_id));

-- Budget Line Items
CREATE POLICY "View budget line items"
  ON budget_line_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM budgets b WHERE b.id = budget_id AND is_organization_member(b.organization_id)));

CREATE POLICY "Manage budget line items"
  ON budget_line_items FOR ALL
  USING (EXISTS (SELECT 1 FROM budgets b WHERE b.id = budget_id AND is_organization_member(b.organization_id)));

-- Invoices
CREATE POLICY "View invoices"
  ON invoices FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage invoices"
  ON invoices FOR ALL
  USING (is_organization_member(organization_id));

-- Invoice Line Items
CREATE POLICY "View invoice line items"
  ON invoice_line_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND is_organization_member(i.organization_id)));

CREATE POLICY "Manage invoice line items"
  ON invoice_line_items FOR ALL
  USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND is_organization_member(i.organization_id)));

-- Payments
CREATE POLICY "View payments"
  ON payments FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage payments"
  ON payments FOR ALL
  USING (is_organization_member(organization_id));

-- Expenses
CREATE POLICY "View expenses"
  ON expenses FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Users manage their expenses"
  ON expenses FOR ALL
  USING (user_id = auth.uid() OR is_organization_member(organization_id));

-- Purchase Requisitions
CREATE POLICY "View purchase requisitions"
  ON purchase_requisitions FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage purchase requisitions"
  ON purchase_requisitions FOR ALL
  USING (is_organization_member(organization_id));

-- Purchase Requisition Items
CREATE POLICY "View purchase requisition items"
  ON purchase_requisition_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM purchase_requisitions pr WHERE pr.id = requisition_id AND is_organization_member(pr.organization_id)));

CREATE POLICY "Manage purchase requisition items"
  ON purchase_requisition_items FOR ALL
  USING (EXISTS (SELECT 1 FROM purchase_requisitions pr WHERE pr.id = requisition_id AND is_organization_member(pr.organization_id)));

-- Purchase Orders
CREATE POLICY "View purchase orders"
  ON purchase_orders FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage purchase orders"
  ON purchase_orders FOR ALL
  USING (is_organization_member(organization_id));

-- Purchase Order Items
CREATE POLICY "View purchase order items"
  ON purchase_order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM purchase_orders po WHERE po.id = purchase_order_id AND is_organization_member(po.organization_id)));

CREATE POLICY "Manage purchase order items"
  ON purchase_order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM purchase_orders po WHERE po.id = purchase_order_id AND is_organization_member(po.organization_id)));

-- Contracts
CREATE POLICY "View contracts"
  ON contracts FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage contracts"
  ON contracts FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - CRM & VENUES
-- ============================================================================

-- Companies
CREATE POLICY "View companies"
  ON companies FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage companies"
  ON companies FOR ALL
  USING (is_organization_member(organization_id));

-- Contacts
CREATE POLICY "View contacts"
  ON contacts FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage contacts"
  ON contacts FOR ALL
  USING (is_organization_member(organization_id));

-- Deals
CREATE POLICY "View deals"
  ON deals FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage deals"
  ON deals FOR ALL
  USING (is_organization_member(organization_id));

-- Pipeline Stages
CREATE POLICY "View pipeline stages"
  ON pipeline_stages FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage pipeline stages"
  ON pipeline_stages FOR ALL
  USING (is_organization_owner(organization_id));

-- Activities
CREATE POLICY "View activities"
  ON activities FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage activities"
  ON activities FOR ALL
  USING (is_organization_member(organization_id));

-- Proposals
CREATE POLICY "View proposals"
  ON proposals FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage proposals"
  ON proposals FOR ALL
  USING (is_organization_member(organization_id));

-- Proposal Items
CREATE POLICY "View proposal items"
  ON proposal_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_organization_member(p.organization_id)));

CREATE POLICY "Manage proposal items"
  ON proposal_items FOR ALL
  USING (EXISTS (SELECT 1 FROM proposals p WHERE p.id = proposal_id AND is_organization_member(p.organization_id)));

-- Venues
CREATE POLICY "View venues"
  ON venues FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage venues"
  ON venues FOR ALL
  USING (is_organization_member(organization_id));

-- Venue Spaces
CREATE POLICY "View venue spaces"
  ON venue_spaces FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues v WHERE v.id = venue_id AND is_organization_member(v.organization_id)));

CREATE POLICY "Manage venue spaces"
  ON venue_spaces FOR ALL
  USING (EXISTS (SELECT 1 FROM venues v WHERE v.id = venue_id AND is_organization_member(v.organization_id)));

-- Venue Availability
CREATE POLICY "View venue availability"
  ON venue_availability FOR SELECT
  USING (EXISTS (SELECT 1 FROM venues v WHERE v.id = venue_id AND is_organization_member(v.organization_id)));

CREATE POLICY "Manage venue availability"
  ON venue_availability FOR ALL
  USING (EXISTS (SELECT 1 FROM venues v WHERE v.id = venue_id AND is_organization_member(v.organization_id)));

-- Site Surveys
CREATE POLICY "View site surveys"
  ON site_surveys FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage site surveys"
  ON site_surveys FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - CONTENT & TALENT
-- ============================================================================

-- Media
CREATE POLICY "View media"
  ON media FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage media"
  ON media FOR ALL
  USING (is_organization_member(organization_id));

-- Brand Guidelines
CREATE POLICY "View brand guidelines"
  ON brand_guidelines FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage brand guidelines"
  ON brand_guidelines FOR ALL
  USING (is_organization_member(organization_id));

-- Campaigns
CREATE POLICY "View campaigns"
  ON campaigns FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage campaigns"
  ON campaigns FOR ALL
  USING (is_organization_member(organization_id));

-- Marketing Materials
CREATE POLICY "View marketing materials"
  ON marketing_materials FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage marketing materials"
  ON marketing_materials FOR ALL
  USING (is_organization_member(organization_id));

-- Social Posts
CREATE POLICY "View social posts"
  ON social_posts FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage social posts"
  ON social_posts FOR ALL
  USING (is_organization_member(organization_id));

-- Content Approvals
CREATE POLICY "View content approvals"
  ON content_approvals FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage content approvals"
  ON content_approvals FOR ALL
  USING (is_organization_member(organization_id));

-- Talent Profiles
CREATE POLICY "View talent profiles"
  ON talent_profiles FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage talent profiles"
  ON talent_profiles FOR ALL
  USING (is_organization_member(organization_id));

-- Talent Bookings
CREATE POLICY "View talent bookings"
  ON talent_bookings FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage talent bookings"
  ON talent_bookings FOR ALL
  USING (is_organization_member(organization_id));

-- Riders
CREATE POLICY "View riders"
  ON riders FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage riders"
  ON riders FOR ALL
  USING (is_organization_member(organization_id));

-- Rider Items
CREATE POLICY "View rider items"
  ON rider_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM riders r WHERE r.id = rider_id AND is_organization_member(r.organization_id)));

CREATE POLICY "Manage rider items"
  ON rider_items FOR ALL
  USING (EXISTS (SELECT 1 FROM riders r WHERE r.id = rider_id AND is_organization_member(r.organization_id)));

-- Setlists
CREATE POLICY "View setlists"
  ON setlists FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage setlists"
  ON setlists FOR ALL
  USING (is_organization_member(organization_id));

-- Setlist Items
CREATE POLICY "View setlist items"
  ON setlist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM setlists s WHERE s.id = setlist_id AND is_organization_member(s.organization_id)));

CREATE POLICY "Manage setlist items"
  ON setlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM setlists s WHERE s.id = setlist_id AND is_organization_member(s.organization_id)));

-- Talent Payments
CREATE POLICY "View talent payments"
  ON talent_payments FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage talent payments"
  ON talent_payments FOR ALL
  USING (is_organization_member(organization_id));

-- ============================================================================
-- RLS POLICIES - EXPERIENCE
-- ============================================================================

-- Ticket Types
CREATE POLICY "View ticket types"
  ON ticket_types FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage ticket types"
  ON ticket_types FOR ALL
  USING (is_organization_member(organization_id));

-- Ticket Orders
CREATE POLICY "View ticket orders"
  ON ticket_orders FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage ticket orders"
  ON ticket_orders FOR ALL
  USING (is_organization_member(organization_id));

-- Tickets
CREATE POLICY "View tickets"
  ON tickets FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage tickets"
  ON tickets FOR ALL
  USING (is_organization_member(organization_id));

-- Guest Lists
CREATE POLICY "View guest lists"
  ON guest_lists FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage guest lists"
  ON guest_lists FOR ALL
  USING (is_organization_member(organization_id));

-- Guest List Entries
CREATE POLICY "View guest list entries"
  ON guest_list_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM guest_lists gl WHERE gl.id = guest_list_id AND is_organization_member(gl.organization_id)));

CREATE POLICY "Manage guest list entries"
  ON guest_list_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM guest_lists gl WHERE gl.id = guest_list_id AND is_organization_member(gl.organization_id)));

-- Hospitality Requests
CREATE POLICY "View hospitality requests"
  ON hospitality_requests FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage hospitality requests"
  ON hospitality_requests FOR ALL
  USING (is_organization_member(organization_id));

-- Accommodations
CREATE POLICY "View accommodations"
  ON accommodations FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage accommodations"
  ON accommodations FOR ALL
  USING (is_organization_member(organization_id));

-- Transportation
CREATE POLICY "View transportation"
  ON transportation FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage transportation"
  ON transportation FOR ALL
  USING (is_organization_member(organization_id));

-- Catering Orders
CREATE POLICY "View catering orders"
  ON catering_orders FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage catering orders"
  ON catering_orders FOR ALL
  USING (is_organization_member(organization_id));

-- Community Members
CREATE POLICY "View community members"
  ON community_members FOR SELECT
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

CREATE POLICY "Manage community members"
  ON community_members FOR ALL
  USING (is_organization_member(organization_id) OR user_id = auth.uid());

-- Community Posts
CREATE POLICY "View community posts"
  ON community_posts FOR SELECT
  USING (is_organization_member(organization_id) OR visibility = 'public');

CREATE POLICY "Manage community posts"
  ON community_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM community_members cm WHERE cm.id = author_id AND cm.user_id = auth.uid()));

-- Community Comments
CREATE POLICY "View community comments"
  ON community_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM community_posts cp WHERE cp.id = post_id AND (is_organization_member(cp.organization_id) OR cp.visibility = 'public')));

CREATE POLICY "Manage community comments"
  ON community_comments FOR ALL
  USING (EXISTS (SELECT 1 FROM community_members cm WHERE cm.id = author_id AND cm.user_id = auth.uid()));

-- Community Follows
CREATE POLICY "View community follows"
  ON community_follows FOR SELECT
  USING (EXISTS (SELECT 1 FROM community_members cm WHERE (cm.id = follower_id OR cm.id = following_id) AND cm.user_id = auth.uid()));

CREATE POLICY "Manage community follows"
  ON community_follows FOR ALL
  USING (EXISTS (SELECT 1 FROM community_members cm WHERE cm.id = follower_id AND cm.user_id = auth.uid()));

-- ============================================================================
-- RLS POLICIES - WORKFLOWS & DOCUMENTS
-- ============================================================================

-- Workflow Templates
CREATE POLICY "View workflow templates"
  ON workflow_templates FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage workflow templates"
  ON workflow_templates FOR ALL
  USING (is_organization_member(organization_id));

-- Workflow Steps
CREATE POLICY "View workflow steps"
  ON workflow_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM workflow_templates wt WHERE wt.id = workflow_template_id AND is_organization_member(wt.organization_id)));

CREATE POLICY "Manage workflow steps"
  ON workflow_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM workflow_templates wt WHERE wt.id = workflow_template_id AND is_organization_member(wt.organization_id)));

-- Workflow Runs
CREATE POLICY "View workflow runs"
  ON workflow_runs FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage workflow runs"
  ON workflow_runs FOR ALL
  USING (is_organization_member(organization_id));

-- Workflow Step Executions
CREATE POLICY "View workflow step executions"
  ON workflow_step_executions FOR SELECT
  USING (EXISTS (SELECT 1 FROM workflow_runs wr WHERE wr.id = workflow_run_id AND is_organization_member(wr.organization_id)));

-- Approval Workflows
CREATE POLICY "View approval workflows"
  ON approval_workflows FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage approval workflows"
  ON approval_workflows FOR ALL
  USING (is_organization_member(organization_id));

-- Approval Requests
CREATE POLICY "View approval requests"
  ON approval_requests FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage approval requests"
  ON approval_requests FOR ALL
  USING (is_organization_member(organization_id));

-- Approval Decisions
CREATE POLICY "View approval decisions"
  ON approval_decisions FOR SELECT
  USING (EXISTS (SELECT 1 FROM approval_requests ar WHERE ar.id = approval_request_id AND is_organization_member(ar.organization_id)));

CREATE POLICY "Manage approval decisions"
  ON approval_decisions FOR ALL
  USING (approver_id = auth.uid());

-- Document Folders
CREATE POLICY "View document folders"
  ON document_folders FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage document folders"
  ON document_folders FOR ALL
  USING (is_organization_member(organization_id));

-- Documents
CREATE POLICY "View documents"
  ON documents FOR SELECT
  USING (is_organization_member(organization_id) OR visibility = 'public');

CREATE POLICY "Manage documents"
  ON documents FOR ALL
  USING (is_organization_member(organization_id));

-- Document Versions
CREATE POLICY "View document versions"
  ON document_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

CREATE POLICY "Manage document versions"
  ON document_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

-- Document Comments
CREATE POLICY "View document comments"
  ON document_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

CREATE POLICY "Manage document comments"
  ON document_comments FOR ALL
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

-- Document Shares
CREATE POLICY "View document shares"
  ON document_shares FOR SELECT
  USING (shared_with_user_id = auth.uid() OR EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

CREATE POLICY "Manage document shares"
  ON document_shares FOR ALL
  USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND is_organization_member(d.organization_id)));

-- Custom Field Definitions
CREATE POLICY "View custom field definitions"
  ON custom_field_definitions FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage custom field definitions"
  ON custom_field_definitions FOR ALL
  USING (is_organization_owner(organization_id));

-- Custom Field Values
CREATE POLICY "View custom field values"
  ON custom_field_values FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage custom field values"
  ON custom_field_values FOR ALL
  USING (is_organization_member(organization_id));

-- Tags
CREATE POLICY "View tags"
  ON tags FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "Manage tags"
  ON tags FOR ALL
  USING (is_organization_member(organization_id));

-- Entity Tags
CREATE POLICY "View entity tags"
  ON entity_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM tags t WHERE t.id = tag_id AND is_organization_member(t.organization_id)));

CREATE POLICY "Manage entity tags"
  ON entity_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM tags t WHERE t.id = tag_id AND is_organization_member(t.organization_id)));
