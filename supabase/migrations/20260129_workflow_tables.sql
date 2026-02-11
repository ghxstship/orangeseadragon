-- Workflow Engine Database Tables
-- Migration for workflow automation system

-- ==================== Core Workflow Tables ====================

-- Workflows table
-- Extend existing workflows table (originally from 00055_workflow_automation.sql)
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived'));
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS trigger JSONB;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS steps JSONB;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS variables JSONB;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);

-- Workflow executions table
-- Extend existing workflow_executions table (originally from 00084_workflow_engine.sql)
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS workflow_version INTEGER;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS trigger JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS input JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS output JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS context JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS steps JSONB;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS error JSONB;

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_org ON workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON workflow_executions(started_at DESC);

-- Scheduled workflows table
CREATE TABLE IF NOT EXISTS scheduled_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_at TIMESTAMPTZ NOT NULL,
  context JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'triggered', 'cancelled')),
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_workflows_trigger ON scheduled_workflows(trigger_at) WHERE status = 'pending';

-- ==================== Lead/CRM Tables ====================

-- Leads table
-- Extend existing leads table (originally from 00023_missing_entity_tables.sql)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_grade TEXT CHECK (score_grade IN ('A', 'B', 'C', 'D', 'F'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_opens INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_deal_id UUID;

CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
-- Handle both assignee_id and assigned_to column names
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assignee_id') THEN
        CREATE INDEX IF NOT EXISTS idx_leads_assignee ON leads(assignee_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_to') THEN
        CREATE INDEX IF NOT EXISTS idx_leads_assignee ON leads(assigned_to);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

-- Lead scores history
CREATE TABLE IF NOT EXISTS lead_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  grade TEXT,
  breakdown JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_score_history_lead ON lead_score_history(lead_id);

-- Deals/Opportunities table
-- Extend existing deals table (originally from 00006_crm_venues.sql)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS pipeline_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS stage_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost'));

CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id);
-- Handle pipeline_id column which may not exist in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'pipeline_id') THEN
        CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
-- Handle status column which may not exist in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
    END IF;
END $$;

-- ==================== Support/Ticket Tables ====================

-- Support tickets table
-- Extend existing support_tickets table (originally from 00015_account_platform.sql)
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS customer_id UUID; -- FK to customers table not defined;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assignee_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 0;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS escalation_reason TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS auto_responded BOOLEAN DEFAULT FALSE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS suggested_articles UUID[];
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS potential_duplicates UUID[];
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS flagged_for_merge BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_support_tickets_org ON support_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
-- Handle assignee_id which may be named assigned_to in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'assignee_id') THEN
        CREATE INDEX IF NOT EXISTS idx_support_tickets_assignee ON support_tickets(assignee_id);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'assigned_to') THEN
        CREATE INDEX IF NOT EXISTS idx_support_tickets_assignee ON support_tickets(assigned_to);
    END IF;
END $$;
-- Handle customer_id which may not exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'customer_id') THEN
        CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
    END IF;
END $$;
-- Handle sla_deadline which may not exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'sla_deadline') THEN
        CREATE INDEX IF NOT EXISTS idx_support_tickets_sla ON support_tickets(sla_deadline) WHERE status NOT IN ('resolved', 'closed');
    END IF;
END $$;

-- Ticket activities
CREATE TABLE IF NOT EXISTS ticket_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_activities_ticket ON ticket_activities(ticket_id);

-- Support agents
CREATE TABLE IF NOT EXISTS support_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  skills TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT FALSE,
  current_ticket_count INTEGER DEFAULT 0,
  max_tickets INTEGER DEFAULT 10,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_agents_org ON support_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_agents_available ON support_agents(is_available, is_online);

-- Recurring issue alerts
CREATE TABLE IF NOT EXISTS recurring_issue_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  occurrences INTEGER NOT NULL,
  affected_tickets UUID[],
  suggested_action TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== Email/Campaign Tables ====================

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  segment_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_org ON email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipients TEXT[] NOT NULL,
  subject TEXT,
  body TEXT,
  template TEXT,
  data JSONB,
  "from" TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);

-- Email events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  metadata JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);

-- ==================== Notification Tables ====================

-- Push notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipients TEXT[] NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS logs
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipients TEXT[] NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slack messages
CREATE TABLE IF NOT EXISTS slack_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  text TEXT NOT NULL,
  blocks JSONB,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== Survey Tables ====================

-- Survey requests
CREATE TABLE IF NOT EXISTS survey_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id),
  customer_id UUID, -- FK to customers table not defined
  type TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'completed', 'expired')),
  rating INTEGER,
  feedback TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_survey_requests_customer ON survey_requests(customer_id);

-- ==================== Approval Tables ====================

-- Approval requests
-- Extend existing approval_requests table (originally from 00009_workflows_documents.sql)
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approvers TEXT[];
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS required_approvals INTEGER DEFAULT 1;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS current_approvals INTEGER DEFAULT 0;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity_type, entity_id);

-- Approval decisions
-- Extend existing approval_decisions table (originally from 00009_workflows_documents.sql)
ALTER TABLE approval_decisions ADD COLUMN IF NOT EXISTS request_id UUID;

-- Handle request_id column which may not exist in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'approval_decisions' AND column_name = 'request_id') THEN
        CREATE INDEX IF NOT EXISTS idx_approval_decisions_request ON approval_decisions(request_id);
    END IF;
END $$;

-- ==================== Knowledge Base Tables ====================

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_org ON knowledge_base_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON knowledge_base_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON knowledge_base_articles(category);

-- ==================== Document Tables ====================

-- Generated documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  data JSONB,
  format TEXT DEFAULT 'pdf',
  url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== Compliance Tables ====================

-- Policy acknowledgments
-- Extend existing policy_acknowledgments table (originally from 00013_compliance_reports.sql)
ALTER TABLE policy_acknowledgments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'expired'));
ALTER TABLE policy_acknowledgments ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;
ALTER TABLE policy_acknowledgments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_policy_ack_user ON policy_acknowledgments(user_id);
-- Handle status column which may not exist in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policy_acknowledgments' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_policy_ack_status ON policy_acknowledgments(status);
    END IF;
END $$;

-- Audit logs
-- Extend existing audit_logs table (originally from 00001_initial_schema.sql)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_state JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_state JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
-- Handle timestamp column which may be named created_at in earlier schema
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'timestamp') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);
    END IF;
END $$;

-- Compliance incidents
-- Extend existing compliance_incidents table (originally from 00013_compliance_reports.sql)
ALTER TABLE compliance_incidents ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE compliance_incidents ADD COLUMN IF NOT EXISTS resolution TEXT;

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_org ON compliance_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_incidents_status ON compliance_incidents(status);

-- Regulatory assessments
CREATE TABLE IF NOT EXISTS regulatory_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID,
  regulation TEXT NOT NULL,
  effective_date DATE,
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_policies UUID[],
  status TEXT DEFAULT 'pending_review',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== Auto-Response Templates ====================

CREATE TABLE IF NOT EXISTS auto_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  template_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_response_category ON auto_response_templates(category) WHERE is_active = TRUE;

-- ==================== RPC Functions ====================

-- Increment email stat function
CREATE OR REPLACE FUNCTION increment_email_stat(email_id UUID, stat_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE email_campaigns SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', stat_field, stat_field)
  USING email_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== Triggers ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_kb_articles_updated_at ON knowledge_base_articles;
CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON knowledge_base_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
