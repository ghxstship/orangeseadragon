-- Migration: Additional Gap Implementation Tables
-- Created: 2026-01-27
-- Description: Tables for sessions, offboarding, sequences, compliance, forms, and hospitality

-- ============================================================================
-- EVENT SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_type_id UUID REFERENCES session_types(id),
  track_id UUID REFERENCES session_tracks(id),
  venue_space_id UUID REFERENCES venue_spaces(id),
  
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INT,
  registered_count INT DEFAULT 0,
  
  status_id UUID REFERENCES statuses(id),
  is_featured BOOLEAN DEFAULT FALSE,
  requires_registration BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_sessions_event ON event_sessions(event_id);
CREATE INDEX idx_event_sessions_org ON event_sessions(org_id);
CREATE INDEX idx_event_sessions_start ON event_sessions(start_time);

-- Session Types lookup
CREATE TABLE IF NOT EXISTS session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Tracks lookup
CREATE TABLE IF NOT EXISTS session_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Registrations
CREATE TABLE IF NOT EXISTS session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  UNIQUE(session_id, registration_id)
);

-- ============================================================================
-- OFFBOARDING
-- ============================================================================

CREATE TABLE IF NOT EXISTS offboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  position_type_id UUID REFERENCES position_types(id),
  department_id UUID REFERENCES departments(id),
  duration_days INT DEFAULT 14,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  exit_interview_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offboarding_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES offboarding_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('it', 'hr', 'finance', 'facilities', 'knowledge_transfer', 'other')),
  assigned_role TEXT,
  due_day_offset INT DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offboarding_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES offboarding_templates(id),
  employee_id UUID NOT NULL REFERENCES contacts(id),
  manager_id UUID REFERENCES contacts(id),
  hr_contact_id UUID REFERENCES contacts(id),
  
  last_working_day DATE NOT NULL,
  offboarding_start_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  exit_interview_scheduled_at TIMESTAMPTZ,
  exit_interview_completed_at TIMESTAMPTZ,
  exit_interview_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offboarding_instance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES offboarding_instances(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES offboarding_template_items(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  assigned_to_id UUID REFERENCES contacts(id),
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  completed_by_id UUID REFERENCES contacts(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EMAIL SEQUENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('lead_nurture', 'customer_onboarding', 're_engagement', 'event_followup', 'drip')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'form_submit', 'lead_created', 'deal_won', 'event_registration', 'tag_added')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  step_count INT DEFAULT 0,
  enrolled_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  delay_days INT DEFAULT 0,
  delay_hours INT DEFAULT 0,
  send_time_preference TEXT CHECK (send_time_preference IN ('immediate', 'morning', 'afternoon', 'evening')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  current_step INT DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'unsubscribed', 'bounced')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  next_email_scheduled_at TIMESTAMPTZ,
  UNIQUE(sequence_id, contact_id)
);

CREATE TABLE IF NOT EXISTS sequence_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES sequence_steps(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- ============================================================================
-- COMPLIANCE POLICIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('code_of_conduct', 'safety', 'privacy', 'security', 'hr', 'financial', 'operational', 'other')),
  version TEXT DEFAULT '1.0',
  effective_date DATE NOT NULL,
  review_date DATE,
  content TEXT NOT NULL,
  summary TEXT,
  requires_acknowledgment BOOLEAN DEFAULT TRUE,
  acknowledgment_frequency TEXT DEFAULT 'on_update' CHECK (acknowledgment_frequency IN ('once', 'annually', 'on_update')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'full_time', 'contractors', 'specific_roles')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES compliance_policies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  policy_version TEXT,
  UNIQUE(policy_id, user_id, policy_version)
);

-- ============================================================================
-- FORM TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('lead_capture', 'contact', 'registration', 'survey', 'feedback', 'application', 'custom')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  submit_button_text TEXT DEFAULT 'Submit',
  success_message TEXT DEFAULT 'Thank you for your submission!',
  redirect_url TEXT,
  notification_email TEXT,
  submission_count INT DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number', 'file', 'hidden')),
  label TEXT NOT NULL,
  name TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  options JSONB,
  default_value TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  data JSONB NOT NULL,
  source_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted ON form_submissions(submitted_at);

-- ============================================================================
-- HOSPITALITY REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS hospitality_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('catering', 'accommodation', 'transport', 'green_room', 'vip', 'other')),
  requester_type TEXT NOT NULL CHECK (requester_type IN ('talent', 'partner', 'staff', 'vip_guest', 'general')),
  contact_id UUID REFERENCES contacts(id),
  
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  requested_date DATE NOT NULL,
  requested_time TIME,
  dietary_requirements TEXT,
  special_instructions TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'fulfilled', 'cancelled')),
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  vendor_id UUID REFERENCES vendors(id),
  
  approved_by_id UUID REFERENCES contacts(id),
  approved_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitality_requests_event ON hospitality_requests(event_id);
CREATE INDEX idx_hospitality_requests_date ON hospitality_requests(requested_date);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Event Sessions
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_sessions_org_read" ON event_sessions FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "event_sessions_org_insert" ON event_sessions FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "event_sessions_org_update" ON event_sessions FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "event_sessions_org_delete" ON event_sessions FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Session Types
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_types_org_read" ON session_types FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_types_org_insert" ON session_types FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_types_org_update" ON session_types FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_types_org_delete" ON session_types FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Session Tracks
ALTER TABLE session_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_tracks_org_read" ON session_tracks FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_tracks_org_insert" ON session_tracks FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_tracks_org_update" ON session_tracks FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "session_tracks_org_delete" ON session_tracks FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Offboarding Templates
ALTER TABLE offboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offboarding_templates_org_read" ON offboarding_templates FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_templates_org_insert" ON offboarding_templates FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_templates_org_update" ON offboarding_templates FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_templates_org_delete" ON offboarding_templates FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Offboarding Instances
ALTER TABLE offboarding_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offboarding_instances_org_read" ON offboarding_instances FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_instances_org_insert" ON offboarding_instances FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_instances_org_update" ON offboarding_instances FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "offboarding_instances_org_delete" ON offboarding_instances FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Email Sequences
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_sequences_org_read" ON email_sequences FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "email_sequences_org_insert" ON email_sequences FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "email_sequences_org_update" ON email_sequences FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "email_sequences_org_delete" ON email_sequences FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Compliance Policies
ALTER TABLE compliance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_policies_org_read" ON compliance_policies FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "compliance_policies_org_insert" ON compliance_policies FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "compliance_policies_org_update" ON compliance_policies FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "compliance_policies_org_delete" ON compliance_policies FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Form Templates
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "form_templates_org_read" ON form_templates FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "form_templates_org_insert" ON form_templates FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "form_templates_org_update" ON form_templates FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "form_templates_org_delete" ON form_templates FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Hospitality Requests
ALTER TABLE hospitality_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hospitality_requests_org_read" ON hospitality_requests FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "hospitality_requests_org_insert" ON hospitality_requests FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "hospitality_requests_org_update" ON hospitality_requests FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "hospitality_requests_org_delete" ON hospitality_requests FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- ============================================================================
-- PERFORMANCE REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES contacts(id),
  reviewer_id UUID NOT NULL REFERENCES contacts(id),
  review_period TEXT NOT NULL CHECK (review_period IN ('q1', 'q2', 'q3', 'q4', 'annual', 'probation')),
  review_year INT NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('self', 'manager', '360', 'peer')),
  overall_rating TEXT CHECK (overall_rating IN ('1', '2', '3', '4', '5')),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_achieved TEXT,
  next_period_goals TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'pending_approval', 'completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES performance_reviews(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  progress_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRAINING COURSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('compliance', 'safety', 'technical', 'soft_skills', 'leadership', 'product', 'onboarding')),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('online_self_paced', 'online_live', 'in_person', 'blended')),
  duration_hours DECIMAL(5,2),
  is_mandatory BOOLEAN DEFAULT FALSE,
  recertification_months INT,
  passing_score INT DEFAULT 80,
  content_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  enrolled_count INT DEFAULT 0,
  completion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed', 'expired')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INT,
  certificate_url TEXT,
  expires_at DATE,
  UNIQUE(course_id, user_id)
);

-- ============================================================================
-- LANDING PAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('lead_capture', 'event_registration', 'product_launch', 'webinar', 'download', 'thank_you', 'custom')),
  campaign_id UUID REFERENCES email_campaigns(id),
  form_id UUID REFERENCES form_templates(id),
  headline TEXT NOT NULL,
  subheadline TEXT,
  body_content TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  cta_url TEXT,
  hero_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

-- ============================================================================
-- SUBSCRIBERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  contact_id UUID REFERENCES contacts(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  source TEXT CHECK (source IN ('website', 'event', 'import', 'api', 'manual')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ,
  last_email_opened_at TIMESTAMPTZ,
  email_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

CREATE TABLE IF NOT EXISTS subscriber_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  subscriber_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriber_list_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES subscriber_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, list_id)
);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Performance Reviews
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "performance_reviews_org_read" ON performance_reviews FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "performance_reviews_org_insert" ON performance_reviews FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "performance_reviews_org_update" ON performance_reviews FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "performance_reviews_org_delete" ON performance_reviews FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Training Courses
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "training_courses_org_read" ON training_courses FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "training_courses_org_insert" ON training_courses FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "training_courses_org_update" ON training_courses FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "training_courses_org_delete" ON training_courses FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Landing Pages
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "landing_pages_org_read" ON landing_pages FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "landing_pages_org_insert" ON landing_pages FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "landing_pages_org_update" ON landing_pages FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "landing_pages_org_delete" ON landing_pages FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers_org_read" ON subscribers FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscribers_org_insert" ON subscribers FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscribers_org_update" ON subscribers FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscribers_org_delete" ON subscribers FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- Subscriber Lists
ALTER TABLE subscriber_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriber_lists_org_read" ON subscriber_lists FOR SELECT USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscriber_lists_org_insert" ON subscriber_lists FOR INSERT WITH CHECK (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscriber_lists_org_update" ON subscriber_lists FOR UPDATE USING (org_id IN (SELECT get_user_organization_ids()));
CREATE POLICY "subscriber_lists_org_delete" ON subscriber_lists FOR DELETE USING (org_id IN (SELECT get_user_organization_ids()));

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Session Types
INSERT INTO session_types (id, org_id, name, description, color, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Keynote', 'Main stage keynote presentation', '#6366f1', 1),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Breakout', 'Smaller breakout session', '#8b5cf6', 2),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'Workshop', 'Hands-on workshop', '#ec4899', 3),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Panel', 'Panel discussion', '#f59e0b', 4),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'Networking', 'Networking session', '#10b981', 5)
ON CONFLICT DO NOTHING;

-- Training Categories (seed some default courses)
INSERT INTO training_courses (id, org_id, name, category, delivery_method, duration_hours, is_mandatory, status) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'Workplace Safety Basics', 'safety', 'online_self_paced', 2, TRUE, 'active'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'Code of Conduct', 'compliance', 'online_self_paced', 1, TRUE, 'active'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'Data Privacy & Security', 'compliance', 'online_self_paced', 1.5, TRUE, 'active')
ON CONFLICT DO NOTHING;

COMMIT;
