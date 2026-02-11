-- Migration 00072: Automated Workflow Engine
-- Implements workflow automation for advancing module

-- ============================================================================
-- 1. WORKFLOW DEFINITIONS
-- ============================================================================
-- Extend existing workflows table (originally from 00055_workflow_automation.sql)
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(50);
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS retry_delay_minutes INTEGER DEFAULT 5;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

COMMENT ON TABLE workflows IS 'Workflow automation definitions';
COMMENT ON COLUMN workflows.trigger_config IS 'Trigger configuration: {event: "advance_item.status_changed", conditions: [...]}';
COMMENT ON COLUMN workflows.steps IS 'Array of steps: [{type: "action", action: "send_notification", config: {...}}, ...]';

CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_entity ON workflows(entity_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 2. WORKFLOW EXECUTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Context
    entity_type VARCHAR(100),
    entity_id UUID,
    triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN (
        'event', 'schedule', 'manual', 'webhook', 'retry'
    )),
    trigger_data JSONB DEFAULT '{}',
    
    -- Execution state
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'paused', 'waiting', 'completed', 'failed', 'cancelled'
    )),
    current_step INTEGER DEFAULT 0,
    
    -- Results
    step_results JSONB DEFAULT '[]',
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Retries
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    initiated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE workflow_executions IS 'Individual workflow execution instances';
COMMENT ON COLUMN workflow_executions.step_results IS 'Results from each step: [{step: 0, status: "completed", output: {...}, completed_at: "..."}]';

CREATE INDEX IF NOT EXISTS idx_executions_org ON workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_pending ON workflow_executions(status, next_retry_at) 
    WHERE status IN ('pending', 'waiting');

-- ============================================================================
-- 3. WORKFLOW TEMPLATES (Pre-built workflows)
-- ============================================================================
-- Extend existing workflow_templates table (originally from 00009_workflows_documents.sql)
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS workflow_type VARCHAR(50);
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS trigger_config_template JSONB DEFAULT '{}';
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS steps_template JSONB DEFAULT '[]';
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS required_variables JSONB DEFAULT '[]';
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

COMMENT ON TABLE workflow_templates IS 'Pre-built workflow templates for common automation patterns';

-- ============================================================================
-- 4. APPROVAL REQUESTS
-- ============================================================================
-- Extend existing approval_requests table (originally from 00009_workflows_documents.sql)
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS workflow_execution_id UUID;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approval_type VARCHAR(50);
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approvers JSONB DEFAULT '[]';
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS approval_rule VARCHAR(20) DEFAULT 'any' CHECK (approval_rule IN ('any', 'all', 'majority'));
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '[]';
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

COMMENT ON TABLE approval_requests IS 'Approval workflow requests';
COMMENT ON COLUMN approval_requests.approvers IS 'Array of approver configs: [{user_id: "...", role: "manager"}, {team_id: "..."}]';
COMMENT ON COLUMN approval_requests.responses IS 'Array of responses: [{user_id: "...", decision: "approved", comment: "...", responded_at: "..."}]';

CREATE INDEX IF NOT EXISTS idx_approvals_org ON approval_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON approval_requests(requested_by);

-- ============================================================================
-- 5. SCHEDULED TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Task details
    name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
        'workflow', 'notification', 'report', 'cleanup', 'sync', 'custom'
    )),
    
    -- Schedule
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN (
        'once', 'recurring', 'cron'
    )),
    schedule_config JSONB NOT NULL DEFAULT '{}',
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    
    -- Task configuration
    task_config JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE scheduled_tasks IS 'Scheduled task definitions';
COMMENT ON COLUMN scheduled_tasks.schedule_config IS 'Schedule config: {cron: "0 9 * * 1", timezone: "America/New_York"} or {run_at: "2026-02-15T09:00:00Z"}';

CREATE INDEX IF NOT EXISTS idx_scheduled_org ON scheduled_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_next_run ON scheduled_tasks(next_run_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_scheduled_workflow ON scheduled_tasks(workflow_id);

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS trg_workflows_updated_at ON workflows;
CREATE TRIGGER trg_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_workflow_executions_updated_at ON workflow_executions;
CREATE TRIGGER trg_workflow_executions_updated_at
    BEFORE UPDATE ON workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_approval_requests_updated_at ON approval_requests;
CREATE TRIGGER trg_approval_requests_updated_at
    BEFORE UPDATE ON approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_scheduled_tasks_updated_at ON scheduled_tasks;
CREATE TRIGGER trg_scheduled_tasks_updated_at
    BEFORE UPDATE ON scheduled_tasks
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

-- ============================================================================
-- 7. SEED WORKFLOW TEMPLATES
-- ============================================================================
INSERT INTO workflow_templates (name, slug, description, category, workflow_type, trigger_type, trigger_config_template, steps_template, required_variables, is_system, icon)
VALUES 
(
    'Delivery Reminder',
    'delivery-reminder',
    'Send reminder notifications before scheduled deliveries',
    'advancing',
    'notification',
    'schedule',
    '{"hours_before": 24}',
    '[
        {"type": "condition", "config": {"field": "status", "operator": "not_in", "value": ["delivered", "cancelled"]}},
        {"type": "action", "action": "send_notification", "config": {"template": "delivery_reminder", "recipients": ["assigned_to", "created_by"]}}
    ]',
    '["hours_before"]',
    TRUE,
    'bell'
),
(
    'Critical Item Escalation',
    'critical-item-escalation',
    'Escalate critical path items that are overdue',
    'advancing',
    'escalation',
    'schedule',
    '{"check_interval_hours": 4}',
    '[
        {"type": "condition", "config": {"field": "is_critical_path", "operator": "eq", "value": true}},
        {"type": "condition", "config": {"field": "scheduled_delivery", "operator": "lt", "value": "{{now}}"}},
        {"type": "condition", "config": {"field": "status", "operator": "not_in", "value": ["delivered", "complete"]}},
        {"type": "action", "action": "send_notification", "config": {"template": "critical_escalation", "recipients": ["manager", "assigned_to"]}},
        {"type": "action", "action": "update_field", "config": {"field": "priority", "value": "critical"}}
    ]',
    '[]',
    TRUE,
    'alert-triangle'
),
(
    'Status Change Notification',
    'status-change-notification',
    'Notify stakeholders when item status changes',
    'advancing',
    'notification',
    'event',
    '{"event": "advance_item.status_changed"}',
    '[
        {"type": "action", "action": "send_notification", "config": {"template": "status_changed", "recipients": ["assigned_to", "created_by"]}}
    ]',
    '[]',
    TRUE,
    'refresh-cw'
),
(
    'Vendor Confirmation Required',
    'vendor-confirmation-required',
    'Request approval when vendor confirms different quantity',
    'advancing',
    'approval',
    'event',
    '{"event": "advance_item.quantity_confirmed", "conditions": [{"field": "quantity_confirmed", "operator": "ne", "value": "{{quantity_required}}"}]}',
    '[
        {"type": "action", "action": "create_approval", "config": {"title": "Quantity Discrepancy", "approvers": ["manager"], "approval_rule": "any"}},
        {"type": "wait", "config": {"for": "approval"}},
        {"type": "branch", "config": {"on": "approval_result", "approved": [{"type": "action", "action": "update_field", "config": {"field": "status", "value": "confirmed"}}], "rejected": [{"type": "action", "action": "send_notification", "config": {"template": "quantity_rejected", "recipients": ["vendor"]}}]}}
    ]',
    '[]',
    TRUE,
    'check-circle'
),
(
    'Auto-assign Crew',
    'auto-assign-crew',
    'Automatically assign available crew based on skills',
    'advancing',
    'automation',
    'event',
    '{"event": "advance_item.created", "conditions": [{"field": "category_code", "operator": "starts_with", "value": "technical"}]}',
    '[
        {"type": "action", "action": "find_available_crew", "config": {"skills_from": "category", "date_from": "scheduled_delivery"}},
        {"type": "condition", "config": {"field": "{{available_crew}}", "operator": "not_empty"}},
        {"type": "action", "action": "create_assignment", "config": {"crew_from": "{{available_crew[0]}}", "role_from": "category"}}
    ]',
    '[]',
    TRUE,
    'users'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view workflows in their organization" ON workflows;
CREATE POLICY "Users can view workflows in their organization"
    ON workflows FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage workflows in their organization" ON workflows;
CREATE POLICY "Users can manage workflows in their organization"
    ON workflows FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can view executions in their organization" ON workflow_executions;
CREATE POLICY "Users can view executions in their organization"
    ON workflow_executions FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create executions in their organization" ON workflow_executions;
CREATE POLICY "Users can create executions in their organization"
    ON workflow_executions FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can view approvals in their organization" ON approval_requests;
CREATE POLICY "Users can view approvals in their organization"
    ON approval_requests FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage approvals in their organization" ON approval_requests;
CREATE POLICY "Users can manage approvals in their organization"
    ON approval_requests FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can view scheduled tasks in their organization" ON scheduled_tasks;
CREATE POLICY "Users can view scheduled tasks in their organization"
    ON scheduled_tasks FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can manage scheduled tasks in their organization" ON scheduled_tasks;
CREATE POLICY "Users can manage scheduled tasks in their organization"
    ON scheduled_tasks FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
