-- ATLVS Workflow Automation Builder
-- No-code automation: triggers, conditions, and actions
-- Migration: 00047

-- ============================================================================
-- WORKFLOWS (Automation definitions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Trigger configuration
    trigger_type VARCHAR(50) NOT NULL,
    -- Types: deal_stage_changed, deal_created, contact_created, lead_score_changed,
    --        activity_created, email_opened, meeting_booked, form_submitted, scheduled
    trigger_config JSONB NOT NULL DEFAULT '{}',
    -- Example: { "from_stage": "proposal", "to_stage": "negotiation" }
    
    -- Conditions (optional filters)
    conditions JSONB DEFAULT '[]',
    -- Example: [{ "field": "deal.value", "operator": "gte", "value": 10000 }]
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT TRUE,
    
    -- Execution settings
    run_once_per_entity BOOLEAN DEFAULT FALSE,
    delay_seconds INTEGER DEFAULT 0,
    
    -- Stats
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workflows_organization ON workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- WORKFLOW ACTIONS (Steps to execute)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    
    -- Ordering
    position INTEGER NOT NULL DEFAULT 0,
    
    -- Action configuration
    action_type VARCHAR(50) NOT NULL,
    -- Types: send_email, create_task, update_field, assign_owner, add_tag,
    --        send_notification, create_activity, webhook, delay
    action_config JSONB NOT NULL DEFAULT '{}',
    -- Example for send_email: { "template_id": "...", "to": "{{contact.email}}" }
    
    -- Conditional execution
    condition JSONB,
    -- Example: { "field": "lead_score", "operator": "gte", "value": 80 }
    
    -- Error handling
    on_error VARCHAR(20) DEFAULT 'continue' CHECK (on_error IN ('continue', 'stop', 'retry')),
    max_retries INTEGER DEFAULT 3,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow ON workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_position ON workflow_actions(workflow_id, position);

-- ============================================================================
-- WORKFLOW RUNS (Execution history)
-- ============================================================================

-- Extend existing workflow_runs table from 00009 with automation columns
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE;
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS trigger_entity_type VARCHAR(50);
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS trigger_entity_id UUID;
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS actions_executed INTEGER DEFAULT 0;
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS actions_failed INTEGER DEFAULT 0;
ALTER TABLE workflow_runs ADD COLUMN IF NOT EXISTS action_results JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_workflow_runs_automation_workflow ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_automation_entity ON workflow_runs(trigger_entity_type, trigger_entity_id);

-- ============================================================================
-- WORKFLOW TEMPLATES (Pre-built automations)
-- ============================================================================

-- Extend existing workflow_templates table from 00009 with automation columns
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]';
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS actions JSONB DEFAULT '[]';
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE workflow_templates ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;

-- ============================================================================
-- FUNCTION: Execute workflow action
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_workflow_action(
    p_action_id UUID,
    p_run_id UUID,
    p_context JSONB
) RETURNS JSONB AS $$
DECLARE
    v_action RECORD;
    v_result JSONB;
    v_success BOOLEAN := TRUE;
    v_error TEXT;
BEGIN
    SELECT * INTO v_action FROM workflow_actions WHERE id = p_action_id;
    
    IF v_action IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Action not found');
    END IF;
    
    -- Execute based on action type
    CASE v_action.action_type
        WHEN 'update_field' THEN
            -- Update entity field
            v_result := jsonb_build_object(
                'action', 'update_field',
                'config', v_action.action_config,
                'status', 'executed'
            );
            
        WHEN 'add_tag' THEN
            -- Add tag to entity
            v_result := jsonb_build_object(
                'action', 'add_tag',
                'tag', v_action.action_config->>'tag',
                'status', 'executed'
            );
            
        WHEN 'create_task' THEN
            -- Create a task
            v_result := jsonb_build_object(
                'action', 'create_task',
                'config', v_action.action_config,
                'status', 'queued'
            );
            
        WHEN 'send_notification' THEN
            -- Send notification
            v_result := jsonb_build_object(
                'action', 'send_notification',
                'config', v_action.action_config,
                'status', 'queued'
            );
            
        WHEN 'create_activity' THEN
            -- Log activity
            v_result := jsonb_build_object(
                'action', 'create_activity',
                'config', v_action.action_config,
                'status', 'executed'
            );
            
        WHEN 'delay' THEN
            -- Delay execution
            v_result := jsonb_build_object(
                'action', 'delay',
                'seconds', (v_action.action_config->>'seconds')::INTEGER,
                'status', 'waiting'
            );
            
        ELSE
            v_result := jsonb_build_object(
                'action', v_action.action_type,
                'status', 'unknown_action'
            );
            v_success := FALSE;
    END CASE;
    
    RETURN jsonb_build_object(
        'success', v_success,
        'action_id', p_action_id,
        'result', v_result
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'action_id', p_action_id,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Run workflow
-- ============================================================================

CREATE OR REPLACE FUNCTION run_workflow(
    p_workflow_id UUID,
    p_trigger_entity_type VARCHAR,
    p_trigger_entity_id UUID,
    p_trigger_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_workflow RECORD;
    v_run_id UUID;
    v_action RECORD;
    v_action_result JSONB;
    v_action_results JSONB := '[]';
    v_actions_executed INTEGER := 0;
    v_actions_failed INTEGER := 0;
    v_start_time TIMESTAMPTZ;
    v_context JSONB;
BEGIN
    -- Get workflow
    SELECT * INTO v_workflow FROM workflows WHERE id = p_workflow_id AND is_active = TRUE;
    
    IF v_workflow IS NULL THEN
        RAISE EXCEPTION 'Workflow not found or not active';
    END IF;
    
    v_start_time := NOW();
    
    -- Create run record
    INSERT INTO workflow_runs (
        workflow_id,
        organization_id,
        trigger_entity_type,
        trigger_entity_id,
        trigger_data,
        status,
        started_at
    ) VALUES (
        p_workflow_id,
        v_workflow.organization_id,
        p_trigger_entity_type,
        p_trigger_entity_id,
        p_trigger_data,
        'running',
        v_start_time
    ) RETURNING id INTO v_run_id;
    
    -- Build context
    v_context := jsonb_build_object(
        'workflow_id', p_workflow_id,
        'run_id', v_run_id,
        'entity_type', p_trigger_entity_type,
        'entity_id', p_trigger_entity_id,
        'trigger_data', p_trigger_data
    );
    
    -- Execute actions in order
    FOR v_action IN 
        SELECT * FROM workflow_actions 
        WHERE workflow_id = p_workflow_id 
        ORDER BY position
    LOOP
        v_action_result := execute_workflow_action(v_action.id, v_run_id, v_context);
        v_action_results := v_action_results || v_action_result;
        
        IF (v_action_result->>'success')::BOOLEAN THEN
            v_actions_executed := v_actions_executed + 1;
        ELSE
            v_actions_failed := v_actions_failed + 1;
            
            -- Check error handling
            IF v_action.on_error = 'stop' THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;
    
    -- Update run record
    UPDATE workflow_runs SET
        status = CASE WHEN v_actions_failed = 0 THEN 'completed' ELSE 'failed' END,
        completed_at = NOW(),
        duration_ms = EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000,
        actions_executed = v_actions_executed,
        actions_failed = v_actions_failed,
        action_results = v_action_results
    WHERE id = v_run_id;
    
    -- Update workflow stats
    UPDATE workflows SET
        total_runs = total_runs + 1,
        successful_runs = successful_runs + CASE WHEN v_actions_failed = 0 THEN 1 ELSE 0 END,
        failed_runs = failed_runs + CASE WHEN v_actions_failed > 0 THEN 1 ELSE 0 END,
        last_run_at = NOW()
    WHERE id = p_workflow_id;
    
    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Check workflows on deal stage change
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_workflows_on_deal_change()
RETURNS TRIGGER AS $$
DECLARE
    v_workflow RECORD;
BEGIN
    -- Check for deal_stage_changed triggers
    IF TG_OP = 'UPDATE' AND OLD.stage != NEW.stage THEN
        FOR v_workflow IN 
            SELECT * FROM workflows 
            WHERE trigger_type = 'deal_stage_changed'
              AND is_active = TRUE
              AND organization_id = NEW.organization_id
              AND (
                  trigger_config->>'from_stage' IS NULL 
                  OR trigger_config->>'from_stage' = OLD.stage
              )
              AND (
                  trigger_config->>'to_stage' IS NULL 
                  OR trigger_config->>'to_stage' = NEW.stage
              )
        LOOP
            PERFORM run_workflow(
                v_workflow.id,
                'deal',
                NEW.id,
                jsonb_build_object(
                    'from_stage', OLD.stage,
                    'to_stage', NEW.stage,
                    'deal_name', NEW.name,
                    'deal_value', NEW.value
                )
            );
        END LOOP;
    END IF;
    
    -- Check for deal_created triggers
    IF TG_OP = 'INSERT' THEN
        FOR v_workflow IN 
            SELECT * FROM workflows 
            WHERE trigger_type = 'deal_created'
              AND is_active = TRUE
              AND organization_id = NEW.organization_id
        LOOP
            PERFORM run_workflow(
                v_workflow.id,
                'deal',
                NEW.id,
                jsonb_build_object(
                    'deal_name', NEW.name,
                    'deal_value', NEW.value,
                    'stage', NEW.stage
                )
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflows_deal ON deals;
CREATE TRIGGER trigger_workflows_deal
    AFTER INSERT OR UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_workflows_on_deal_change();

-- ============================================================================
-- TRIGGER: Check workflows on contact created
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_workflows_on_contact_created()
RETURNS TRIGGER AS $$
DECLARE
    v_workflow RECORD;
BEGIN
    FOR v_workflow IN 
        SELECT * FROM workflows 
        WHERE trigger_type = 'contact_created'
          AND is_active = TRUE
          AND organization_id = NEW.organization_id
    LOOP
        PERFORM run_workflow(
            v_workflow.id,
            'contact',
            NEW.id,
            jsonb_build_object(
                'contact_name', COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''),
                'email', NEW.email,
                'company_id', NEW.company_id
            )
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflows_contact ON contacts;
CREATE TRIGGER trigger_workflows_contact
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_workflows_on_contact_created();

-- ============================================================================
-- SEED: Workflow templates
-- ============================================================================

INSERT INTO workflow_templates (name, slug, description, category, trigger_type, trigger_config, actions, icon, is_featured) VALUES
(
    'Welcome New Contact',
    'welcome-new-contact',
    'Send a welcome email when a new contact is created',
    'onboarding',
    'contact_created',
    '{}',
    '[{"action_type": "send_email", "action_config": {"template": "welcome"}}]',
    'UserPlus',
    TRUE
),
(
    'Deal Won Celebration',
    'deal-won-celebration',
    'Notify team and log activity when a deal is won',
    'sales',
    'deal_stage_changed',
    '{"to_stage": "closed-won"}',
    '[{"action_type": "send_notification", "action_config": {"message": "Deal won!"}}, {"action_type": "create_activity", "action_config": {"type": "note", "subject": "Deal closed"}}]',
    'Trophy',
    TRUE
),
(
    'Hot Lead Alert',
    'hot-lead-alert',
    'Notify sales rep when lead score reaches hot',
    'sales',
    'lead_score_changed',
    '{"score_label": "hot"}',
    '[{"action_type": "send_notification", "action_config": {"message": "Hot lead alert!"}}]',
    'Flame',
    TRUE
),
(
    'Stale Deal Reminder',
    'stale-deal-reminder',
    'Create task when deal has no activity for 7 days',
    'sales',
    'deal_rotting',
    '{"days": 7}',
    '[{"action_type": "create_task", "action_config": {"title": "Follow up on stale deal", "due_days": 1}}]',
    'Clock',
    FALSE
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workflows_org_isolation ON workflows;
CREATE POLICY workflows_org_isolation ON workflows
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS workflow_actions_org_isolation ON workflow_actions;
CREATE POLICY workflow_actions_org_isolation ON workflow_actions
    FOR ALL
    USING (workflow_id IN (
        SELECT id FROM workflows WHERE organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    ));

DROP POLICY IF EXISTS workflow_runs_org_isolation ON workflow_runs;
CREATE POLICY workflow_runs_org_isolation ON workflow_runs
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- VIEW: Workflow stats
-- ============================================================================

CREATE OR REPLACE VIEW workflow_stats AS
SELECT 
    w.id,
    w.name,
    w.trigger_type,
    w.is_active,
    w.total_runs,
    w.successful_runs,
    w.failed_runs,
    CASE WHEN w.total_runs > 0 
         THEN ROUND((w.successful_runs::DECIMAL / w.total_runs) * 100, 1)
         ELSE 0 
    END as success_rate,
    w.last_run_at,
    (SELECT COUNT(*) FROM workflow_actions WHERE workflow_id = w.id) as action_count
FROM workflows w;

COMMENT ON VIEW workflow_stats IS 'Workflow statistics including success rates';
