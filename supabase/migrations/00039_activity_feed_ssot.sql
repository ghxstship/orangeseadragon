-- ============================================================================
-- ACTIVITY FEED AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes activity_feed as the Single Source of Truth
-- for all activity/timeline data across the platform. Source entities 
-- (activities, comments, notes, approvals) automatically sync to activity_feed
-- via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - activity_feed owns the unified timeline index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE ACTIVITY FEED TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Activity classification
    activity_type VARCHAR(50) NOT NULL,  -- 'comment', 'note', 'call', 'email', 'meeting', 'approval', 'status_change'
    activity_category VARCHAR(50),        -- 'crm', 'task', 'document', 'workflow', 'system'
    
    -- Source entity reference
    entity_type VARCHAR(50),              -- 'task', 'deal', 'contact', 'document', etc.
    entity_id UUID,
    entity_name VARCHAR(255),             -- Cached name for display
    
    -- Actor (who performed the action)
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),              -- Cached for display
    
    -- Content
    title VARCHAR(255) NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Related entities (for filtering)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    
    -- Timestamps
    activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX idx_activity_feed_organization ON activity_feed(organization_id);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type);
CREATE INDEX idx_activity_feed_entity ON activity_feed(entity_type, entity_id);
CREATE INDEX idx_activity_feed_actor ON activity_feed(actor_id);
CREATE INDEX idx_activity_feed_activity_at ON activity_feed(activity_at DESC);
CREATE INDEX idx_activity_feed_project ON activity_feed(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_activity_feed_event ON activity_feed(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_activity_feed_company ON activity_feed(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_activity_feed_deal ON activity_feed(deal_id) WHERE deal_id IS NOT NULL;

-- ============================================================================
-- HELPER FUNCTION: Upsert activity feed entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_activity_feed(
    p_organization_id UUID,
    p_activity_type VARCHAR(50),
    p_activity_category VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_name VARCHAR(255),
    p_actor_id UUID,
    p_title VARCHAR(255),
    p_content TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_contact_id UUID DEFAULT NULL,
    p_deal_id UUID DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_activity_at TIMESTAMPTZ DEFAULT NOW(),
    p_suffix VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_external_id VARCHAR(100);
    v_actor_name VARCHAR(255);
BEGIN
    -- Create unique key for this activity entry
    v_external_id := p_activity_type || ':' || p_entity_type || ':' || p_entity_id::TEXT || COALESCE(':' || p_suffix, '');
    
    -- Get actor name
    SELECT COALESCE(display_name, first_name || ' ' || last_name) INTO v_actor_name 
    FROM users WHERE id = p_actor_id;
    
    -- Upsert the activity feed entry
    INSERT INTO activity_feed (
        organization_id,
        activity_type,
        activity_category,
        entity_type,
        entity_id,
        entity_name,
        actor_id,
        actor_name,
        title,
        content,
        metadata,
        project_id,
        event_id,
        company_id,
        contact_id,
        deal_id,
        visibility,
        activity_at,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_activity_type,
        p_activity_category,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_actor_id,
        v_actor_name,
        p_title,
        p_content,
        p_metadata,
        p_project_id,
        p_event_id,
        p_company_id,
        p_contact_id,
        p_deal_id,
        p_visibility,
        p_activity_at,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        entity_name = EXCLUDED.entity_name,
        actor_name = EXCLUDED.actor_name,
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        company_id = EXCLUDED.company_id,
        contact_id = EXCLUDED.contact_id,
        deal_id = EXCLUDED.deal_id,
        visibility = EXCLUDED.visibility,
        activity_at = EXCLUDED.activity_at,
        updated_at = NOW()
    RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete activity feed entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_activity_feed_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM activity_feed 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: CRM Activities → activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_crm_activity_to_feed() RETURNS TRIGGER AS $$
DECLARE
    v_entity_type VARCHAR(50);
    v_entity_id UUID;
    v_entity_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM activity_feed WHERE external_id = 'crm_activity:activities:' || OLD.id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Determine primary entity
    IF NEW.deal_id IS NOT NULL THEN
        v_entity_type := 'deal';
        v_entity_id := NEW.deal_id;
        SELECT name INTO v_entity_name FROM deals WHERE id = NEW.deal_id;
    ELSIF NEW.contact_id IS NOT NULL THEN
        v_entity_type := 'contact';
        v_entity_id := NEW.contact_id;
        SELECT first_name || ' ' || last_name INTO v_entity_name FROM contacts WHERE id = NEW.contact_id;
    ELSIF NEW.company_id IS NOT NULL THEN
        v_entity_type := 'company';
        v_entity_id := NEW.company_id;
        SELECT name INTO v_entity_name FROM companies WHERE id = NEW.company_id;
    ELSE
        v_entity_type := 'activity';
        v_entity_id := NEW.id;
        v_entity_name := NEW.subject;
    END IF;
    
    PERFORM upsert_activity_feed(
        p_organization_id := NEW.organization_id,
        p_activity_type := NEW.activity_type::TEXT,
        p_activity_category := 'crm',
        p_entity_type := v_entity_type,
        p_entity_id := v_entity_id,
        p_entity_name := v_entity_name,
        p_actor_id := COALESCE(NEW.assigned_to, NEW.created_by),
        p_title := NEW.subject,
        p_content := NEW.description,
        p_metadata := jsonb_build_object(
            'outcome', NEW.outcome,
            'is_completed', NEW.is_completed,
            'due_date', NEW.due_date
        ),
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_company_id := NEW.company_id,
        p_contact_id := NEW.contact_id,
        p_deal_id := NEW.deal_id,
        p_visibility := 'team',
        p_activity_at := COALESCE(NEW.completed_at, NEW.created_at),
        p_suffix := NEW.id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_crm_activity_to_feed ON activities;
CREATE TRIGGER trg_sync_crm_activity_to_feed
    AFTER INSERT OR UPDATE OR DELETE ON activities
    FOR EACH ROW EXECUTE FUNCTION sync_crm_activity_to_feed();

-- ============================================================================
-- TRIGGER: Task Comments → activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_task_comment_to_feed() RETURNS TRIGGER AS $$
DECLARE
    v_task_title VARCHAR(255);
    v_org_id UUID;
    v_project_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM activity_feed WHERE external_id = 'comment:task:' || OLD.task_id::TEXT || ':' || OLD.id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Get task details
    SELECT title, organization_id, project_id 
    INTO v_task_title, v_org_id, v_project_id
    FROM tasks WHERE id = NEW.task_id;
    
    PERFORM upsert_activity_feed(
        p_organization_id := v_org_id,
        p_activity_type := 'comment',
        p_activity_category := 'task',
        p_entity_type := 'task',
        p_entity_id := NEW.task_id,
        p_entity_name := v_task_title,
        p_actor_id := NEW.user_id,
        p_title := 'Commented on task: ' || v_task_title,
        p_content := NEW.content,
        p_project_id := v_project_id,
        p_visibility := 'team',
        p_activity_at := NEW.created_at,
        p_suffix := NEW.id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_task_comment_to_feed ON task_comments;
CREATE TRIGGER trg_sync_task_comment_to_feed
    AFTER INSERT OR UPDATE OR DELETE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION sync_task_comment_to_feed();

-- ============================================================================
-- TRIGGER: Document Comments → activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_document_comment_to_feed() RETURNS TRIGGER AS $$
DECLARE
    v_doc_title VARCHAR(255);
    v_org_id UUID;
    v_project_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM activity_feed WHERE external_id = 'comment:document:' || OLD.document_id::TEXT || ':' || OLD.id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Get document details
    SELECT title, organization_id, project_id 
    INTO v_doc_title, v_org_id, v_project_id
    FROM documents WHERE id = NEW.document_id;
    
    PERFORM upsert_activity_feed(
        p_organization_id := v_org_id,
        p_activity_type := 'comment',
        p_activity_category := 'document',
        p_entity_type := 'document',
        p_entity_id := NEW.document_id,
        p_entity_name := v_doc_title,
        p_actor_id := NEW.user_id,
        p_title := 'Commented on document: ' || v_doc_title,
        p_content := NEW.content,
        p_project_id := v_project_id,
        p_visibility := 'team',
        p_activity_at := NEW.created_at,
        p_suffix := NEW.id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_document_comment_to_feed ON document_comments;
CREATE TRIGGER trg_sync_document_comment_to_feed
    AFTER INSERT OR UPDATE OR DELETE ON document_comments
    FOR EACH ROW EXECUTE FUNCTION sync_document_comment_to_feed();

-- ============================================================================
-- TRIGGER: Ticket Comments → activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_ticket_comment_to_feed() RETURNS TRIGGER AS $$
DECLARE
    v_ticket_subject VARCHAR(255);
    v_org_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM activity_feed WHERE external_id = 'comment:ticket:' || OLD.ticket_id::TEXT || ':' || OLD.id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Get ticket details
    SELECT subject, organization_id 
    INTO v_ticket_subject, v_org_id
    FROM support_tickets WHERE id = NEW.ticket_id;
    
    PERFORM upsert_activity_feed(
        p_organization_id := v_org_id,
        p_activity_type := 'comment',
        p_activity_category := 'support',
        p_entity_type := 'ticket',
        p_entity_id := NEW.ticket_id,
        p_entity_name := v_ticket_subject,
        p_actor_id := NEW.user_id,
        p_title := 'Commented on ticket: ' || v_ticket_subject,
        p_content := NEW.content,
        p_visibility := 'team',
        p_activity_at := NEW.created_at,
        p_suffix := NEW.id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_ticket_comment_to_feed ON ticket_comments;
CREATE TRIGGER trg_sync_ticket_comment_to_feed
    AFTER INSERT OR UPDATE OR DELETE ON ticket_comments
    FOR EACH ROW EXECUTE FUNCTION sync_ticket_comment_to_feed();

-- ============================================================================
-- TRIGGER: Approval Decisions → activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_approval_decision_to_feed() RETURNS TRIGGER AS $$
DECLARE
    v_request_title VARCHAR(255);
    v_org_id UUID;
    v_entity_type VARCHAR(50);
    v_entity_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM activity_feed WHERE external_id = 'approval:decision:' || OLD.id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Get approval request details
    SELECT ar.title, ar.organization_id, ar.entity_type, ar.entity_id
    INTO v_request_title, v_org_id, v_entity_type, v_entity_id
    FROM approval_requests ar WHERE ar.id = NEW.request_id;
    
    PERFORM upsert_activity_feed(
        p_organization_id := v_org_id,
        p_activity_type := 'approval',
        p_activity_category := 'workflow',
        p_entity_type := COALESCE(v_entity_type, 'approval_request'),
        p_entity_id := COALESCE(v_entity_id, NEW.request_id),
        p_entity_name := v_request_title,
        p_actor_id := NEW.approver_id,
        p_title := CASE NEW.decision 
            WHEN 'approved' THEN 'Approved: ' || v_request_title
            WHEN 'rejected' THEN 'Rejected: ' || v_request_title
            ELSE 'Reviewed: ' || v_request_title
        END,
        p_content := NEW.comments,
        p_metadata := jsonb_build_object('decision', NEW.decision),
        p_visibility := 'team',
        p_activity_at := NEW.decided_at,
        p_suffix := NEW.id::TEXT
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_approval_decision_to_feed ON approval_decisions;
CREATE TRIGGER trg_sync_approval_decision_to_feed
    AFTER INSERT OR UPDATE OR DELETE ON approval_decisions
    FOR EACH ROW EXECUTE FUNCTION sync_approval_decision_to_feed();

-- ============================================================================
-- RLS POLICIES FOR ACTIVITY_FEED
-- ============================================================================

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS activity_feed_select_policy ON activity_feed;
DROP POLICY IF EXISTS activity_feed_insert_policy ON activity_feed;
DROP POLICY IF EXISTS activity_feed_update_policy ON activity_feed;
DROP POLICY IF EXISTS activity_feed_delete_policy ON activity_feed;

-- SELECT: Users can see activity based on visibility and organization membership
CREATE POLICY activity_feed_select_policy ON activity_feed
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
        OR (visibility = 'private' AND actor_id = auth.uid())
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY activity_feed_insert_policy ON activity_feed
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY activity_feed_update_policy ON activity_feed
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY activity_feed_delete_policy ON activity_feed
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND actor_id = auth.uid()
);

-- ============================================================================
-- BACKFILL: Sync existing CRM activities
-- ============================================================================

INSERT INTO activity_feed (
    organization_id, activity_type, activity_category, entity_type, entity_id,
    entity_name, actor_id, title, content, metadata,
    project_id, event_id, company_id, contact_id, deal_id,
    visibility, activity_at, external_id, created_at, updated_at
)
SELECT 
    a.organization_id,
    a.activity_type::TEXT,
    'crm',
    CASE 
        WHEN a.deal_id IS NOT NULL THEN 'deal'
        WHEN a.contact_id IS NOT NULL THEN 'contact'
        WHEN a.company_id IS NOT NULL THEN 'company'
        ELSE 'activity'
    END,
    COALESCE(a.deal_id, a.contact_id, a.company_id, a.id),
    a.subject,
    COALESCE(a.assigned_to, a.created_by),
    a.subject,
    a.description,
    jsonb_build_object('outcome', a.outcome, 'is_completed', a.is_completed),
    a.project_id,
    a.event_id,
    a.company_id,
    a.contact_id,
    a.deal_id,
    'team',
    COALESCE(a.completed_at, a.created_at),
    'crm_activity:activities:' || a.id::TEXT,
    NOW(),
    NOW()
FROM activities a
ON CONFLICT (external_id) DO NOTHING;

-- Backfill task comments
INSERT INTO activity_feed (
    organization_id, activity_type, activity_category, entity_type, entity_id,
    entity_name, actor_id, title, content,
    project_id, visibility, activity_at, external_id, created_at, updated_at
)
SELECT 
    t.organization_id,
    'comment',
    'task',
    'task',
    tc.task_id,
    t.title,
    tc.user_id,
    'Commented on task: ' || t.title,
    tc.content,
    t.project_id,
    'team',
    tc.created_at,
    'comment:task:' || tc.task_id::TEXT || ':' || tc.id::TEXT,
    NOW(),
    NOW()
FROM task_comments tc
JOIN tasks t ON t.id = tc.task_id
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE activity_feed IS 'SSOT for all activity/timeline data. Source entities sync here via triggers.';
COMMENT ON COLUMN activity_feed.activity_type IS 'Type of activity (comment, note, call, email, meeting, approval, status_change)';
COMMENT ON COLUMN activity_feed.activity_category IS 'Category (crm, task, document, workflow, system)';
COMMENT ON COLUMN activity_feed.entity_type IS 'Source entity type (task, deal, contact, document, etc.)';
COMMENT ON COLUMN activity_feed.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN activity_feed.external_id IS 'Unique key for upsert: activity_type:entity_type:entity_id[:suffix]';
