-- ============================================================================
-- STATUS TRACKER AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes status_tracker as the Single Source of Truth
-- for tracking status changes across all entities. Source entities with status
-- fields automatically sync to status_tracker via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data and status
-- - status_tracker owns the unified status index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE STATUS TRACKER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS status_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    entity_path VARCHAR(255),
    
    -- Status info
    current_status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    status_category VARCHAR(50),          -- 'active', 'pending', 'blocked', 'completed', 'cancelled'
    
    -- Change tracking
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Context
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Priority/urgency
    priority VARCHAR(20),
    due_date DATE,
    
    -- Access control
    visibility visibility_type DEFAULT 'team',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Upsert key
    external_id VARCHAR(100) UNIQUE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_status_tracker_organization ON status_tracker(organization_id);
CREATE INDEX IF NOT EXISTS idx_status_tracker_entity ON status_tracker(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_tracker_status ON status_tracker(current_status);
CREATE INDEX IF NOT EXISTS idx_status_tracker_category ON status_tracker(status_category);
CREATE INDEX IF NOT EXISTS idx_status_tracker_project ON status_tracker(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_tracker_event ON status_tracker(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_tracker_due_date ON status_tracker(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_tracker_changed_at ON status_tracker(changed_at DESC);

-- ============================================================================
-- HELPER FUNCTION: Categorize status
-- ============================================================================

CREATE OR REPLACE FUNCTION categorize_status(p_status VARCHAR(50)) RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN CASE 
        WHEN p_status IN ('draft', 'pending', 'submitted', 'pending_approval', 'waiting', 'scheduled', 'invited') THEN 'pending'
        WHEN p_status IN ('active', 'in_progress', 'open', 'confirmed', 'approved', 'sent', 'processing') THEN 'active'
        WHEN p_status IN ('blocked', 'on_hold', 'paused', 'rejected', 'disputed') THEN 'blocked'
        WHEN p_status IN ('completed', 'done', 'closed', 'paid', 'delivered', 'resolved', 'reimbursed') THEN 'completed'
        WHEN p_status IN ('cancelled', 'archived', 'deleted', 'expired', 'lost') THEN 'cancelled'
        ELSE 'active'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- HELPER FUNCTION: Upsert status tracker entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_status_tracker(
    p_organization_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_name VARCHAR(255),
    p_entity_path VARCHAR(255),
    p_current_status VARCHAR(50),
    p_previous_status VARCHAR(50) DEFAULT NULL,
    p_changed_by UUID DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_priority VARCHAR(20) DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_tracker_id UUID;
    v_external_id VARCHAR(100);
    v_status_category VARCHAR(50);
BEGIN
    -- Create unique key
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT;
    
    -- Categorize the status
    v_status_category := categorize_status(p_current_status);
    
    -- Upsert the status tracker entry
    INSERT INTO status_tracker (
        organization_id,
        entity_type,
        entity_id,
        entity_name,
        entity_path,
        current_status,
        previous_status,
        status_category,
        changed_by,
        changed_at,
        project_id,
        event_id,
        priority,
        due_date,
        visibility,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_entity_path,
        p_current_status,
        p_previous_status,
        v_status_category,
        p_changed_by,
        NOW(),
        p_project_id,
        p_event_id,
        p_priority,
        p_due_date,
        p_visibility,
        p_metadata,
        v_external_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (external_id) 
    DO UPDATE SET
        entity_name = EXCLUDED.entity_name,
        entity_path = EXCLUDED.entity_path,
        previous_status = status_tracker.current_status,
        current_status = EXCLUDED.current_status,
        status_category = EXCLUDED.status_category,
        changed_by = EXCLUDED.changed_by,
        changed_at = CASE 
            WHEN status_tracker.current_status != EXCLUDED.current_status THEN NOW()
            ELSE status_tracker.changed_at
        END,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        priority = EXCLUDED.priority,
        due_date = EXCLUDED.due_date,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_tracker_id;
    
    RETURN v_tracker_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete status tracker entry
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_status_tracker_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM status_tracker 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Tasks → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_task_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('task', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'task',
        p_entity_id := NEW.id,
        p_entity_name := NEW.title,
        p_entity_path := '/core/tasks/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.created_by,
        p_project_id := NEW.project_id,
        p_priority := NEW.priority::TEXT,
        p_due_date := NEW.due_date::DATE,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_task_status_to_tracker ON tasks;
CREATE TRIGGER trg_sync_task_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION sync_task_status_to_tracker();

-- ============================================================================
-- TRIGGER: Invoices → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_invoice_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('invoice', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'invoice',
        p_entity_id := NEW.id,
        p_entity_name := 'Invoice ' || NEW.invoice_number,
        p_entity_path := '/finance/invoices/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.created_by,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_due_date := NEW.due_date,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('total_amount', NEW.total_amount, 'direction', NEW.direction)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_status_to_tracker ON invoices;
CREATE TRIGGER trg_sync_invoice_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION sync_invoice_status_to_tracker();

-- ============================================================================
-- TRIGGER: Expenses → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_expense_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('expense', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'expense',
        p_entity_id := NEW.id,
        p_entity_name := NEW.description,
        p_entity_path := '/finance/expenses/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.user_id,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('amount', NEW.amount)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_expense_status_to_tracker ON expenses;
CREATE TRIGGER trg_sync_expense_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION sync_expense_status_to_tracker();

-- ============================================================================
-- TRIGGER: Contracts → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_contract_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('contract', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'contract',
        p_entity_id := NEW.id,
        p_entity_name := NEW.title,
        p_entity_path := '/finance/contracts/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.created_by,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_due_date := NEW.end_date,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('contract_type', NEW.contract_type, 'value', NEW.value)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_contract_status_to_tracker ON contracts;
CREATE TRIGGER trg_sync_contract_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION sync_contract_status_to_tracker();

-- ============================================================================
-- TRIGGER: Documents → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_document_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('document', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip archived
    IF NEW.archived_at IS NOT NULL THEN
        PERFORM delete_status_tracker_for_entity('document', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'document',
        p_entity_id := NEW.id,
        p_entity_name := NEW.title,
        p_entity_path := '/documents/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.last_edited_by,
        p_project_id := NEW.project_id,
        p_event_id := NEW.event_id,
        p_visibility := COALESCE(NEW.visibility, 'team')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_document_status_to_tracker ON documents;
CREATE TRIGGER trg_sync_document_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION sync_document_status_to_tracker();

-- ============================================================================
-- TRIGGER: Approval Requests → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_approval_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('approval_request', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'approval_request',
        p_entity_id := NEW.id,
        p_entity_name := NEW.title,
        p_entity_path := '/workflows/approvals/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.requested_by,
        p_priority := NEW.priority::TEXT,
        p_due_date := NEW.due_date,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('entity_type', NEW.entity_type, 'entity_id', NEW.entity_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_approval_status_to_tracker ON approval_requests;
CREATE TRIGGER trg_sync_approval_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON approval_requests
    FOR EACH ROW EXECUTE FUNCTION sync_approval_status_to_tracker();

-- ============================================================================
-- TRIGGER: Support Tickets → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_ticket_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('support_ticket', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'support_ticket',
        p_entity_id := NEW.id,
        p_entity_name := NEW.subject,
        p_entity_path := '/operations/support/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.assigned_to,
        p_priority := NEW.priority::TEXT,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_ticket_status_to_tracker ON support_tickets;
CREATE TRIGGER trg_sync_ticket_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION sync_ticket_status_to_tracker();

-- ============================================================================
-- TRIGGER: Shifts → status_tracker
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_shift_status_to_tracker() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_status_tracker_for_entity('shift', OLD.id);
        RETURN OLD;
    END IF;
    
    PERFORM upsert_status_tracker(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'shift',
        p_entity_id := NEW.id,
        p_entity_name := 'Shift on ' || NEW.date::TEXT,
        p_entity_path := '/people/scheduling/' || NEW.id::TEXT,
        p_current_status := NEW.status::TEXT,
        p_previous_status := CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::TEXT ELSE NULL END,
        p_changed_by := NEW.user_id,
        p_event_id := NEW.event_id,
        p_due_date := NEW.date,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shift_status_to_tracker ON shifts;
CREATE TRIGGER trg_sync_shift_status_to_tracker
    AFTER INSERT OR UPDATE OF status OR DELETE ON shifts
    FOR EACH ROW EXECUTE FUNCTION sync_shift_status_to_tracker();

-- ============================================================================
-- RLS POLICIES FOR STATUS_TRACKER
-- ============================================================================

-- Enable RLS
ALTER TABLE status_tracker ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS status_tracker_select_policy ON status_tracker;
DROP POLICY IF EXISTS status_tracker_insert_policy ON status_tracker;
DROP POLICY IF EXISTS status_tracker_update_policy ON status_tracker;
DROP POLICY IF EXISTS status_tracker_delete_policy ON status_tracker;

-- SELECT: Users can see status based on organization membership
CREATE POLICY status_tracker_select_policy ON status_tracker
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
        visibility = 'public'
        OR visibility = 'organization'
        OR visibility = 'team'
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY status_tracker_insert_policy ON status_tracker
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY status_tracker_update_policy ON status_tracker
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY status_tracker_delete_policy ON status_tracker
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing tasks
-- ============================================================================

INSERT INTO status_tracker (
    organization_id, entity_type, entity_id, entity_name, entity_path,
    current_status, status_category, project_id, priority, due_date,
    visibility, external_id, created_at, updated_at
)
SELECT 
    t.organization_id,
    'task',
    t.id,
    t.title,
    '/core/tasks/' || t.id::TEXT,
    t.status::TEXT,
    categorize_status(t.status::TEXT),
    t.project_id,
    t.priority::TEXT,
    t.due_date::DATE,
    'team',
    'task:' || t.id::TEXT,
    NOW(),
    NOW()
FROM tasks t
WHERE t.deleted_at IS NULL
ON CONFLICT (external_id) DO NOTHING;

-- Backfill invoices
INSERT INTO status_tracker (
    organization_id, entity_type, entity_id, entity_name, entity_path,
    current_status, status_category, project_id, event_id, due_date,
    visibility, metadata, external_id, created_at, updated_at
)
SELECT 
    i.organization_id,
    'invoice',
    i.id,
    'Invoice ' || i.invoice_number,
    '/finance/invoices/' || i.id::TEXT,
    i.status::TEXT,
    categorize_status(i.status::TEXT),
    i.project_id,
    i.event_id,
    i.due_date,
    'team',
    jsonb_build_object('total_amount', i.total_amount, 'direction', i.direction),
    'invoice:' || i.id::TEXT,
    NOW(),
    NOW()
FROM invoices i
ON CONFLICT (external_id) DO NOTHING;

-- Backfill contracts
INSERT INTO status_tracker (
    organization_id, entity_type, entity_id, entity_name, entity_path,
    current_status, status_category, project_id, event_id, due_date,
    visibility, metadata, external_id, created_at, updated_at
)
SELECT 
    c.organization_id,
    'contract',
    c.id,
    c.title,
    '/finance/contracts/' || c.id::TEXT,
    c.status::TEXT,
    categorize_status(c.status::TEXT),
    c.project_id,
    c.event_id,
    c.end_date,
    'team',
    jsonb_build_object('contract_type', c.contract_type, 'value', c.value),
    'contract:' || c.id::TEXT,
    NOW(),
    NOW()
FROM contracts c
ON CONFLICT (external_id) DO NOTHING;

-- Backfill documents
INSERT INTO status_tracker (
    organization_id, entity_type, entity_id, entity_name, entity_path,
    current_status, status_category, project_id, event_id,
    visibility, external_id, created_at, updated_at
)
SELECT 
    d.organization_id,
    'document',
    d.id,
    d.title,
    '/documents/' || d.id::TEXT,
    d.status::TEXT,
    categorize_status(d.status::TEXT),
    d.project_id,
    d.event_id,
    COALESCE(d.visibility, 'team'),
    'document:' || d.id::TEXT,
    NOW(),
    NOW()
FROM documents d
WHERE d.archived_at IS NULL
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE status_tracker IS 'SSOT for tracking status across all entities. Source entities sync here via triggers.';
COMMENT ON COLUMN status_tracker.entity_type IS 'Source entity type (task, invoice, contract, document, etc.)';
COMMENT ON COLUMN status_tracker.current_status IS 'Current status value from source entity';
COMMENT ON COLUMN status_tracker.previous_status IS 'Previous status value (for change tracking)';
COMMENT ON COLUMN status_tracker.status_category IS 'Normalized category (pending, active, blocked, completed, cancelled)';
COMMENT ON COLUMN status_tracker.external_id IS 'Unique key for upsert: entity_type:entity_id';
