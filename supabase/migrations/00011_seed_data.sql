-- ATLVS Platform Seed Data
-- Demo organization, users, and sample data

-- ============================================================================
-- DEMO ORGANIZATION
-- ============================================================================

INSERT INTO organizations (
    id,
    name,
    slug,
    legal_name,
    description,
    email,
    phone,
    address,
    city,
    state,
    country,
    postal_code,
    timezone,
    currency,
    subscription_tier,
    subscription_status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Apex Productions',
    'apex-productions',
    'Apex Productions LLC',
    'Full-service live event production company specializing in festivals, corporate events, and concerts.',
    'info@apexproductions.com',
    '+1 (555) 100-0000',
    '123 Production Way',
    'Los Angeles',
    'California',
    'United States',
    '90001',
    'America/Los_Angeles',
    'USD',
    'enterprise',
    'active'
);

-- ============================================================================
-- DEMO ROLES
-- ============================================================================

INSERT INTO roles (id, organization_id, name, slug, description, level, tier, is_system, permissions) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Owner', 'owner', 'Full access to all features', 100, 'enterprise', true, '{"*": true}'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Admin', 'admin', 'Administrative access', 90, 'enterprise', true, '{"admin": true, "manage_users": true, "manage_settings": true}'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Manager', 'manager', 'Team and project management', 80, 'pro', true, '{"manage_projects": true, "manage_team": true, "approve_timesheets": true}'),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Lead', 'lead', 'Team lead access', 70, 'pro', true, '{"lead_projects": true, "assign_tasks": true}'),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Member', 'member', 'Standard team member', 50, 'core', true, '{"view_projects": true, "edit_tasks": true}'),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'Contractor', 'contractor', 'External contractor access', 30, 'core', true, '{"view_assigned": true, "submit_timesheets": true}'),
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', 'Guest', 'guest', 'Limited view access', 10, 'core', true, '{"view_public": true}');

-- ============================================================================
-- DEMO DEPARTMENTS
-- ============================================================================

INSERT INTO departments (id, organization_id, name, slug, description, color) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Production', 'production', 'Event production and management', '#3B82F6'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Technical', 'technical', 'Audio, video, lighting, and staging', '#10B981'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Operations', 'operations', 'Logistics and operations', '#F59E0B'),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Finance', 'finance', 'Financial management and accounting', '#8B5CF6'),
('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'Marketing', 'marketing', 'Marketing and communications', '#EC4899'),
('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Talent', 'talent', 'Artist relations and booking', '#F97316'),
('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', 'Experience', 'experience', 'Guest experience and hospitality', '#06B6D4');

-- ============================================================================
-- DEMO POSITIONS
-- ============================================================================

INSERT INTO positions (id, organization_id, department_id, name, slug, level) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Production Manager', 'production-manager', 80),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Stage Manager', 'stage-manager', 70),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Event Coordinator', 'event-coordinator', 60),
('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Technical Director', 'technical-director', 80),
('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Audio Engineer', 'audio-engineer', 60),
('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Lighting Designer', 'lighting-designer', 60),
('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Video Engineer', 'video-engineer', 60),
('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Operations Manager', 'operations-manager', 80),
('00000000-0000-0000-0000-000000000309', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Logistics Coordinator', 'logistics-coordinator', 60),
('00000000-0000-0000-0000-000000000310', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 'Finance Manager', 'finance-manager', 80),
('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000205', 'Marketing Manager', 'marketing-manager', 80),
('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000206', 'Talent Manager', 'talent-manager', 80),
('00000000-0000-0000-0000-000000000313', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000207', 'Experience Manager', 'experience-manager', 80);

-- ============================================================================
-- DEMO WORKSPACES
-- ============================================================================

INSERT INTO workspaces (id, organization_id, name, slug, description, is_default) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'Main Workspace', 'main', 'Primary workspace for all projects', true),
('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', 'Festivals', 'festivals', 'Festival production projects', false),
('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', 'Corporate', 'corporate', 'Corporate event projects', false);

-- ============================================================================
-- DEMO PROJECTS
-- ============================================================================

INSERT INTO projects (id, organization_id, workspace_id, name, slug, description, status, priority, start_date, end_date, budget_amount) VALUES
('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000402', 'Summer Festival 2024', 'summer-festival-2024', 'Annual summer music festival with 50,000 expected attendees over 3 days', 'active', 'high', '2024-06-15', '2024-06-17', 2500000),
('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000403', 'Corporate Gala 2024', 'corporate-gala-2024', 'Annual corporate awards ceremony and networking event', 'planning', 'medium', '2024-03-20', '2024-03-20', 150000),
('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'Q4 Planning', 'q4-planning', 'Strategic planning and budgeting for Q4 operations', 'active', 'high', '2024-01-01', '2024-01-31', 50000),
('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000401', 'New Venue Onboarding', 'new-venue-onboarding', 'Onboarding and setup for new partner venue', 'planning', 'low', '2024-02-01', '2024-02-28', 25000);

-- ============================================================================
-- DEMO EVENTS
-- ============================================================================

INSERT INTO events (id, organization_id, project_id, name, slug, description, event_type, phase, start_date, end_date, capacity, expected_attendance) VALUES
('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000501', 'Summer Festival 2024', 'summer-festival-2024', 'Three-day outdoor music festival featuring top artists', 'festival', 'pre_production', '2024-06-15', '2024-06-17', 50000, 45000),
('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000502', 'Corporate Gala 2024', 'corporate-gala-2024', 'Annual awards ceremony and networking event', 'corporate', 'planning', '2024-03-20', '2024-03-20', 500, 450);

-- ============================================================================
-- DEMO ASSET CATEGORIES
-- ============================================================================

INSERT INTO asset_categories (id, organization_id, name, slug, description, depreciation_method, useful_life_months) VALUES
('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', 'Audio', 'audio', 'Audio equipment including speakers, mixers, and microphones', 'straight_line', 60),
('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000001', 'Lighting', 'lighting', 'Lighting fixtures and control equipment', 'straight_line', 60),
('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000001', 'Video', 'video', 'LED walls, projectors, and video equipment', 'straight_line', 48),
('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000001', 'Staging', 'staging', 'Stage decks, risers, and platforms', 'straight_line', 120),
('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000001', 'Rigging', 'rigging', 'Truss, motors, and rigging hardware', 'straight_line', 120),
('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000001', 'Power', 'power', 'Generators, distribution, and cabling', 'straight_line', 84);

-- ============================================================================
-- DEMO LOCATIONS
-- ============================================================================

INSERT INTO locations (id, organization_id, name, slug, location_type, address, city, state, country) VALUES
('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000001', 'Warehouse A', 'warehouse-a', 'warehouse', '500 Industrial Blvd', 'Los Angeles', 'California', 'United States'),
('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000001', 'Warehouse B', 'warehouse-b', 'warehouse', '502 Industrial Blvd', 'Los Angeles', 'California', 'United States'),
('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000001', 'Service Center', 'service-center', 'warehouse', '510 Industrial Blvd', 'Los Angeles', 'California', 'United States'),
('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000001', 'Main Office', 'main-office', 'office', '123 Production Way', 'Los Angeles', 'California', 'United States');

-- ============================================================================
-- DEMO PIPELINE STAGES
-- ============================================================================

INSERT INTO pipeline_stages (id, organization_id, name, slug, position, probability, is_won, is_lost, color) VALUES
('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000001', 'Lead', 'lead', 1, 10, false, false, '#6B7280'),
('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000001', 'Qualified', 'qualified', 2, 25, false, false, '#3B82F6'),
('00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000001', 'Proposal', 'proposal', 3, 50, false, false, '#F59E0B'),
('00000000-0000-0000-0000-000000000904', '00000000-0000-0000-0000-000000000001', 'Negotiation', 'negotiation', 4, 75, false, false, '#8B5CF6'),
('00000000-0000-0000-0000-000000000905', '00000000-0000-0000-0000-000000000001', 'Won', 'won', 5, 100, true, false, '#10B981'),
('00000000-0000-0000-0000-000000000906', '00000000-0000-0000-0000-000000000001', 'Lost', 'lost', 6, 0, false, true, '#EF4444');

-- ============================================================================
-- DEMO BUDGET CATEGORIES
-- ============================================================================

INSERT INTO budget_categories (id, organization_id, name, slug, category_type, code) VALUES
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', 'Ticket Sales', 'ticket-sales', 'income', 'INC-001'),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000001', 'Sponsorship', 'sponsorship', 'income', 'INC-002'),
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000001', 'Merchandise', 'merchandise', 'income', 'INC-003'),
('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000001', 'Talent Fees', 'talent-fees', 'expense', 'EXP-001'),
('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000001', 'Production', 'production-expense', 'expense', 'EXP-002'),
('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000001', 'Venue', 'venue-expense', 'expense', 'EXP-003'),
('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000001', 'Marketing', 'marketing-expense', 'expense', 'EXP-004'),
('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000001', 'Staffing', 'staffing-expense', 'expense', 'EXP-005'),
('00000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000000001', 'Equipment', 'equipment-capital', 'capital', 'CAP-001');

-- ============================================================================
-- DEMO CERTIFICATION TYPES
-- ============================================================================

INSERT INTO certification_types (id, organization_id, name, slug, description, issuing_authority, validity_months) VALUES
('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000001', 'Rigging Level 1', 'rigging-level-1', 'Basic rigging certification', 'ETCP', 36),
('00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000000001', 'Rigging Level 2', 'rigging-level-2', 'Advanced rigging certification', 'ETCP', 36),
('00000000-0000-0000-0000-000000001103', '00000000-0000-0000-0000-000000000001', 'Electrical License', 'electrical-license', 'State electrical license', 'State Board', 24),
('00000000-0000-0000-0000-000000001104', '00000000-0000-0000-0000-000000000001', 'First Aid/CPR', 'first-aid-cpr', 'First aid and CPR certification', 'Red Cross', 24),
('00000000-0000-0000-0000-000000001105', '00000000-0000-0000-0000-000000000001', 'Forklift Operator', 'forklift-operator', 'Forklift operation certification', 'OSHA', 36),
('00000000-0000-0000-0000-000000001106', '00000000-0000-0000-0000-000000000001', 'Aerial Lift', 'aerial-lift', 'Aerial lift operation certification', 'OSHA', 36);

-- ============================================================================
-- DEMO SKILLS
-- ============================================================================

INSERT INTO skills (id, organization_id, name, slug, category) VALUES
('00000000-0000-0000-0000-000000001201', '00000000-0000-0000-0000-000000000001', 'Audio Mixing', 'audio-mixing', 'Technical'),
('00000000-0000-0000-0000-000000001202', '00000000-0000-0000-0000-000000000001', 'Lighting Programming', 'lighting-programming', 'Technical'),
('00000000-0000-0000-0000-000000001203', '00000000-0000-0000-0000-000000000001', 'Video Switching', 'video-switching', 'Technical'),
('00000000-0000-0000-0000-000000001204', '00000000-0000-0000-0000-000000000001', 'Stage Management', 'stage-management', 'Production'),
('00000000-0000-0000-0000-000000001205', '00000000-0000-0000-0000-000000000001', 'Project Management', 'project-management', 'Management'),
('00000000-0000-0000-0000-000000001206', '00000000-0000-0000-0000-000000000001', 'Rigging', 'rigging-skill', 'Technical'),
('00000000-0000-0000-0000-000000001207', '00000000-0000-0000-0000-000000000001', 'CAD Design', 'cad-design', 'Design'),
('00000000-0000-0000-0000-000000001208', '00000000-0000-0000-0000-000000000001', 'Budget Management', 'budget-management', 'Management');

-- ============================================================================
-- DEMO TAGS
-- ============================================================================

INSERT INTO tags (id, organization_id, name, slug, color, entity_types) VALUES
('00000000-0000-0000-0000-000000001301', '00000000-0000-0000-0000-000000000001', 'Urgent', 'urgent', '#EF4444', ARRAY['tasks', 'projects', 'issues']),
('00000000-0000-0000-0000-000000001302', '00000000-0000-0000-0000-000000000001', 'VIP', 'vip', '#8B5CF6', ARRAY['contacts', 'companies', 'guests']),
('00000000-0000-0000-0000-000000001303', '00000000-0000-0000-0000-000000000001', 'Festival', 'festival', '#3B82F6', ARRAY['projects', 'events', 'tasks']),
('00000000-0000-0000-0000-000000001304', '00000000-0000-0000-0000-000000000001', 'Corporate', 'corporate', '#10B981', ARRAY['projects', 'events', 'tasks']),
('00000000-0000-0000-0000-000000001305', '00000000-0000-0000-0000-000000000001', 'High Priority', 'high-priority', '#F59E0B', ARRAY['tasks', 'issues', 'deals']),
('00000000-0000-0000-0000-000000001306', '00000000-0000-0000-0000-000000000001', 'Needs Review', 'needs-review', '#06B6D4', ARRAY['tasks', 'documents', 'content']);
