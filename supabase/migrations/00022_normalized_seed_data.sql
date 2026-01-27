-- ATLVS Platform Seed Data
-- Normalized Configuration Tables Seed Data
-- Real reference data, no mock/lorem ipsum content

-- ============================================================================
-- LOOKUP TABLES SEED DATA
-- ============================================================================

-- Account Types
INSERT INTO lookup_tables (table_name, key, value, metadata, position) VALUES
('account_types', 'admin', 'Administrator', '{"icon": "Shield", "color": "#DC2626", "permissions": ["all"]}', 1),
('account_types', 'manager', 'Manager', '{"icon": "Briefcase", "color": "#2563EB", "permissions": ["manage_team", "view_reports"]}', 2),
('account_types', 'producer', 'Event Producer', '{"icon": "Mic", "color": "#7C3AED", "permissions": ["manage_events", "manage_talent"]}', 3),
('account_types', 'coordinator', 'Coordinator', '{"icon": "Clipboard", "color": "#059669", "permissions": ["coordinate", "view_schedules"]}', 4),
('account_types', 'crew', 'Crew Member', '{"icon": "Wrench", "color": "#D97706", "permissions": ["check_in_out", "view_assignments"]}', 5),
('account_types', 'talent', 'Talent/Performer', '{"icon": "Star", "color": "#DB2777", "permissions": ["view_schedule", "submit_availability"]}', 6),
('account_types', 'vendor', 'Vendor/Supplier', '{"icon": "Truck", "color": "#0891B2", "permissions": ["manage_inventory", "submit_invoices"]}', 7),
('account_types', 'client', 'Client', '{"icon": "Building", "color": "#4F46E5", "permissions": ["view_progress", "approve_content"]}', 8);

-- User Roles
INSERT INTO lookup_tables (table_name, key, value, metadata, position) VALUES
('user_roles', 'owner', 'Owner', '{"permissions": ["all"], "level": 100}', 1),
('user_roles', 'admin', 'Administrator', '{"permissions": ["manage_users", "manage_billing", "view_all"], "level": 90}', 2),
('user_roles', 'manager', 'Manager', '{"permissions": ["manage_team", "view_reports", "approve_requests"], "level": 70}', 3),
('user_roles', 'producer', 'Producer', '{"permissions": ["manage_events", "manage_production", "coordinate_crew"], "level": 60}', 4),
('user_roles', 'coordinator', 'Coordinator', '{"permissions": ["coordinate", "manage_schedules", "track_assets"], "level": 50}', 5),
('user_roles', 'crew_lead', 'Crew Lead', '{"permissions": ["lead_team", "manage_crew", "report_progress"], "level": 40}', 6),
('user_roles', 'crew_member', 'Crew Member', '{"permissions": ["check_in_out", "view_assignments", "submit_timesheets"], "level": 30}', 7),
('user_roles', 'viewer', 'Viewer', '{"permissions": ["view_assigned", "read_only"], "level": 10}', 8);

-- Priority Levels
INSERT INTO lookup_tables (table_name, key, value, metadata, position) VALUES
('priorities', 'critical', 'Critical', '{"color": "#DC2626", "urgency": 100}', 1),
('priorities', 'high', 'High', '{"color": "#EA580C", "urgency": 75}', 2),
('priorities', 'medium', 'Medium', '{"color": "#D97706", "urgency": 50}', 3),
('priorities', 'low', 'Low', '{"color": "#65A30D", "urgency": 25}', 4),
('priorities', 'none', 'None', '{"color": "#6B7280", "urgency": 0}', 5);

-- Task Status
INSERT INTO lookup_tables (table_name, key, value, metadata, position) VALUES
('task_status', 'backlog', 'Backlog', '{"color": "#6B7280", "order": 1}', 1),
('task_status', 'todo', 'To Do', '{"color": "#3B82F6", "order": 2}', 2),
('task_status', 'in_progress', 'In Progress', '{"color": "#F59E0B", "order": 3}', 3),
('task_status', 'in_review', 'In Review', '{"color": "#8B5CF6", "order": 4}', 4),
('task_status', 'blocked', 'Blocked', '{"color": "#DC2626", "order": 5}', 5),
('task_status', 'done', 'Done', '{"color": "#10B981", "order": 6}', 6),
('task_status', 'cancelled', 'Cancelled', '{"color": "#6B7280", "order": 7}', 7);

-- ============================================================================
-- PAGE LAYOUTS SEED DATA
-- ============================================================================

-- Dashboard Layouts
INSERT INTO page_layouts (slug, name, description, route, layout_type, component_config, permissions, applicable_account_types, is_default, position) VALUES
('dashboard-admin', 'Admin Dashboard', 'Complete administrative overview with metrics and controls', '/dashboard', 'dashboard', '{
  "header": {"title": "Admin Dashboard", "actions": ["settings", "reports"]},
  "widgets": [
    {"type": "metrics", "position": "top", "span": 12},
    {"type": "recent_activity", "position": "left", "span": 8},
    {"type": "quick_actions", "position": "right", "span": 4}
  ]
}', ARRAY['admin'], ARRAY['admin'], true, 1),

('dashboard-producer', 'Producer Dashboard', 'Event production focused dashboard', '/dashboard', 'dashboard', '{
  "header": {"title": "Production Dashboard", "actions": ["new_event", "schedule"]},
  "widgets": [
    {"type": "active_events", "position": "top", "span": 12},
    {"type": "upcoming_tasks", "position": "left", "span": 6},
    {"type": "crew_status", "position": "right", "span": 6}
  ]
}', ARRAY['producer'], ARRAY['producer'], true, 2),

('dashboard-crew', 'Crew Dashboard', 'Crew member task and schedule view', '/dashboard', 'dashboard', '{
  "header": {"title": "My Dashboard", "actions": ["check_in", "timesheet"]},
  "widgets": [
    {"type": "today_schedule", "position": "top", "span": 12},
    {"type": "my_tasks", "position": "left", "span": 8},
    {"type": "quick_stats", "position": "right", "span": 4}
  ]
}', ARRAY['crew_member'], ARRAY['crew'], true, 3);

-- Form Layouts
INSERT INTO page_layouts (slug, name, description, route, layout_type, component_config, permissions, applicable_account_types, position) VALUES
('event-form', 'Event Creation Form', 'Comprehensive event setup form', '/events/new', 'form', '{
  "steps": [
    {"title": "Basic Info", "fields": ["name", "type", "date", "venue"]},
    {"title": "Production", "fields": ["producer", "crew", "equipment"]},
    {"title": "Budget", "fields": ["budget", "currency", "approval_required"]},
    {"title": "Review", "fields": ["summary", "confirm"]}
  ]
}', ARRAY['producer'], ARRAY['producer', 'admin'], 10),

('user-onboarding', 'User Onboarding Flow', 'New user setup and account configuration', '/onboarding', 'wizard', '{
  "steps": [
    {"title": "Welcome", "component": "welcome_screen"},
    {"title": "Account Type", "component": "account_type_selector"},
    {"title": "Profile Setup", "component": "profile_form"},
    {"title": "Permissions", "component": "permission_review"},
    {"title": "Complete", "component": "onboarding_complete"}
  ]
}', ARRAY['user'], ARRAY['admin', 'manager', 'producer', 'coordinator', 'crew'], 20);

-- ============================================================================
-- TRANSLATIONS SEED DATA
-- ============================================================================

-- Common translations
INSERT INTO translations (locale, namespace, key, value, context, is_approved) VALUES
('en', 'common', 'save', 'Save', 'Button label for saving data', true),
('en', 'common', 'cancel', 'Cancel', 'Button label for cancelling action', true),
('en', 'common', 'delete', 'Delete', 'Button label for deleting item', true),
('en', 'common', 'edit', 'Edit', 'Button label for editing item', true),
('en', 'common', 'loading', 'Loading...', 'Loading state message', true),
('en', 'common', 'error', 'An error occurred', 'Generic error message', true),
('en', 'common', 'success', 'Success', 'Success state message', true),
('en', 'common', 'required', 'Required', 'Required field indicator', true),
('en', 'common', 'optional', 'Optional', 'Optional field indicator', true);

-- Authentication translations
INSERT INTO translations (locale, namespace, key, value, context, is_approved) VALUES
('en', 'auth', 'sign_in', 'Sign In', 'Sign in button label', true),
('en', 'auth', 'sign_out', 'Sign Out', 'Sign out button label', true),
('en', 'auth', 'email', 'Email', 'Email field label', true),
('en', 'auth', 'password', 'Password', 'Password field label', true),
('en', 'auth', 'forgot_password', 'Forgot Password?', 'Forgot password link text', true),
('en', 'auth', 'reset_password', 'Reset Password', 'Reset password button label', true),
('en', 'auth', 'create_account', 'Create Account', 'Create account button label', true),
('en', 'auth', 'invalid_credentials', 'Invalid email or password', 'Login error message', true),
('en', 'auth', 'account_locked', 'Account temporarily locked due to too many failed attempts', 'Account lockout message', true);

-- Onboarding translations
INSERT INTO translations (locale, namespace, key, value, context, is_approved) VALUES
('en', 'onboarding', 'welcome', 'Welcome to ATLVS', 'Welcome message for new users', true),
('en', 'onboarding', 'select_account_type', 'Select your account type', 'Account type selection prompt', true),
('en', 'onboarding', 'setup_profile', 'Set up your profile', 'Profile setup step title', true),
('en', 'onboarding', 'complete_setup', 'Complete your setup', 'Setup completion step', true),
('en', 'onboarding', 'skip_optional', 'Skip optional steps', 'Skip optional onboarding steps', true),
('en', 'onboarding', 'setup_complete', 'Setup Complete!', 'Onboarding completion message', true),
('en', 'onboarding', 'start_using_platform', 'Start using the platform', 'Call to action after onboarding', true);

-- Dashboard translations
INSERT INTO translations (locale, namespace, key, value, context, is_approved) VALUES
('en', 'dashboard', 'welcome_back', 'Welcome back, {{name}}', 'Personalized welcome message', true),
('en', 'dashboard', 'recent_activity', 'Recent Activity', 'Recent activity section title', true),
('en', 'dashboard', 'quick_actions', 'Quick Actions', 'Quick actions section title', true),
('en', 'dashboard', 'upcoming_events', 'Upcoming Events', 'Upcoming events section title', true),
('en', 'dashboard', 'pending_tasks', 'Pending Tasks', 'Pending tasks section title', true),
('en', 'dashboard', 'notifications', 'Notifications', 'Notifications section title', true);
