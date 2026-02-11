-- ============================================================================
-- ASSIGNMENTS AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes assignments as the Single Source of Truth
-- for all user assignments/responsibilities across the platform. Source entities 
-- (tasks, shifts, crew_assignments, deals, support_tickets) automatically sync 
-- to assignments via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - assignments owns the unified assignment index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- CREATE ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Assignment classification
    assignment_type VARCHAR(50) NOT NULL,  -- 'task', 'shift', 'crew', 'deal', 'ticket', 'project'
    role VARCHAR(50),                       -- 'owner', 'assignee', 'reviewer', 'member'
    
    -- Source entity reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),
    entity_path VARCHAR(255),               -- URL path to entity
    
    -- Assigned user
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    
    -- Status
    status VARCHAR(50),                     -- 'pending', 'active', 'completed', 'cancelled'
    priority VARCHAR(20),                   -- 'urgent', 'high', 'medium', 'low'
    
    -- Time bounds
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    due_date DATE,
    
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
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
CREATE INDEX IF NOT EXISTS idx_assignments_organization ON assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignments_entity ON assignments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_start_time ON assignments(start_time) WHERE start_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_project ON assignments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assignments_event ON assignments(event_id) WHERE event_id IS NOT NULL;

-- ============================================================================
-- HELPER FUNCTION: Upsert assignment entry
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_assignment(
    p_organization_id UUID,
    p_assignment_type VARCHAR(50),
    p_role VARCHAR(50),
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_entity_name VARCHAR(255),
    p_entity_path VARCHAR(255),
    p_user_id UUID,
    p_status VARCHAR(50) DEFAULT 'active',
    p_priority VARCHAR(20) DEFAULT NULL,
    p_start_time TIMESTAMPTZ DEFAULT NULL,
    p_end_time TIMESTAMPTZ DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_event_id UUID DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_metadata JSONB DEFAULT '{}',
    p_suffix VARCHAR(50) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_assignment_id UUID;
    v_external_id VARCHAR(100);
    v_user_name VARCHAR(255);
BEGIN
    -- Create unique key for this assignment
    v_external_id := p_entity_type || ':' || p_entity_id::TEXT || ':' || p_user_id::TEXT || COALESCE(':' || p_suffix, '');
    
    -- Get user name
    SELECT full_name INTO v_user_name FROM users WHERE id = p_user_id;
    
    -- Upsert the assignment entry
    INSERT INTO assignments (
        organization_id,
        assignment_type,
        role,
        entity_type,
        entity_id,
        entity_name,
        entity_path,
        user_id,
        user_name,
        status,
        priority,
        start_time,
        end_time,
        due_date,
        project_id,
        event_id,
        visibility,
        metadata,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_assignment_type,
        p_role,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_entity_path,
        p_user_id,
        v_user_name,
        p_status,
        p_priority,
        p_start_time,
        p_end_time,
        p_due_date,
        p_project_id,
        p_event_id,
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
        user_name = EXCLUDED.user_name,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        due_date = EXCLUDED.due_date,
        project_id = EXCLUDED.project_id,
        event_id = EXCLUDED.event_id,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_assignment_id;
    
    RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete assignment entries for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_assignments_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM assignments 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Task Assignments → assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_task_assignment_to_assignments() RETURNS TRIGGER AS $$
DECLARE
    v_task RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM assignments WHERE external_id = 'task:' || OLD.task_id::TEXT || ':' || OLD.user_id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Get task details
    SELECT * INTO v_task FROM tasks WHERE id = NEW.task_id;
    
    IF v_task IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Skip cancelled tasks
    IF v_task.status = 'cancelled' THEN
        DELETE FROM assignments WHERE external_id = 'task:' || NEW.task_id::TEXT || ':' || NEW.user_id::TEXT;
        RETURN NEW;
    END IF;
    
    PERFORM upsert_assignment(
        p_organization_id := v_task.organization_id,
        p_assignment_type := 'task',
        p_role := 'assignee',
        p_entity_type := 'task',
        p_entity_id := NEW.task_id,
        p_entity_name := v_task.title,
        p_entity_path := '/core/tasks/' || NEW.task_id::TEXT,
        p_user_id := NEW.user_id,
        p_status := v_task.status::TEXT,
        p_priority := v_task.priority::TEXT,
        p_due_date := v_task.due_date::DATE,
        p_project_id := v_task.project_id,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_task_assignment_to_assignments ON task_assignments;
CREATE TRIGGER trg_sync_task_assignment_to_assignments
    AFTER INSERT OR UPDATE OR DELETE ON task_assignments
    FOR EACH ROW EXECUTE FUNCTION sync_task_assignment_to_assignments();

-- ============================================================================
-- TRIGGER: Shifts → assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_shift_to_assignments() RETURNS TRIGGER AS $$
DECLARE
    v_location_name VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_assignments_for_entity('shift', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip if no user assigned
    IF NEW.user_id IS NULL THEN
        PERFORM delete_assignments_for_entity('shift', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Skip cancelled shifts
    IF NEW.status = 'cancelled' THEN
        PERFORM delete_assignments_for_entity('shift', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get location name
    SELECT name INTO v_location_name FROM locations WHERE id = NEW.location_id;
    
    PERFORM upsert_assignment(
        p_organization_id := NEW.organization_id,
        p_assignment_type := 'shift',
        p_role := 'assignee',
        p_entity_type := 'shift',
        p_entity_id := NEW.id,
        p_entity_name := 'Shift on ' || NEW.date::TEXT,
        p_entity_path := '/people/scheduling/' || NEW.id::TEXT,
        p_user_id := NEW.user_id,
        p_status := NEW.status::TEXT,
        p_start_time := (NEW.date + NEW.scheduled_start)::TIMESTAMPTZ,
        p_end_time := (NEW.date + NEW.scheduled_end)::TIMESTAMPTZ,
        p_event_id := NEW.event_id,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('location', v_location_name)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shift_to_assignments ON shifts;
CREATE TRIGGER trg_sync_shift_to_assignments
    AFTER INSERT OR UPDATE OR DELETE ON shifts
    FOR EACH ROW EXECUTE FUNCTION sync_shift_to_assignments();

-- ============================================================================
-- TRIGGER: Crew Assignments → assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_crew_assignment_to_assignments() RETURNS TRIGGER AS $$
DECLARE
    v_crew_call RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM assignments WHERE external_id = 'crew_assignment:' || OLD.id::TEXT || ':' || OLD.user_id::TEXT;
        RETURN OLD;
    END IF;
    
    -- Skip cancelled
    IF NEW.status = 'cancelled' THEN
        DELETE FROM assignments WHERE external_id = 'crew_assignment:' || NEW.id::TEXT || ':' || NEW.user_id::TEXT;
        RETURN NEW;
    END IF;
    
    -- Get crew call details
    SELECT * INTO v_crew_call FROM crew_calls WHERE id = NEW.crew_call_id;
    
    IF v_crew_call IS NULL THEN
        RETURN NEW;
    END IF;
    
    PERFORM upsert_assignment(
        p_organization_id := v_crew_call.organization_id,
        p_assignment_type := 'crew',
        p_role := 'assignee',
        p_entity_type := 'crew_assignment',
        p_entity_id := NEW.id,
        p_entity_name := v_crew_call.name,
        p_entity_path := '/productions/crew/' || NEW.crew_call_id::TEXT,
        p_user_id := NEW.user_id,
        p_status := NEW.status::TEXT,
        p_start_time := COALESCE(NEW.call_time, v_crew_call.call_time),
        p_end_time := NEW.end_time,
        p_event_id := v_crew_call.event_id,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('location', v_crew_call.location)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_crew_assignment_to_assignments ON crew_assignments;
CREATE TRIGGER trg_sync_crew_assignment_to_assignments
    AFTER INSERT OR UPDATE OR DELETE ON crew_assignments
    FOR EACH ROW EXECUTE FUNCTION sync_crew_assignment_to_assignments();

-- ============================================================================
-- TRIGGER: Deals → assignments (owner)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_deal_to_assignments() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_assignments_for_entity('deal', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip if no owner
    IF NEW.owner_id IS NULL THEN
        PERFORM delete_assignments_for_entity('deal', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_assignment(
        p_organization_id := NEW.organization_id,
        p_assignment_type := 'deal',
        p_role := 'owner',
        p_entity_type := 'deal',
        p_entity_id := NEW.id,
        p_entity_name := NEW.name,
        p_entity_path := '/business/deals/' || NEW.id::TEXT,
        p_user_id := NEW.owner_id,
        p_status := NEW.stage,
        p_visibility := 'team',
        p_metadata := jsonb_build_object('value', NEW.value, 'probability', NEW.probability)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_deal_to_assignments ON deals;
CREATE TRIGGER trg_sync_deal_to_assignments
    AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION sync_deal_to_assignments();

-- ============================================================================
-- TRIGGER: Support Tickets → assignments
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_ticket_to_assignments() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_assignments_for_entity('ticket', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip if no assignee
    IF NEW.assigned_to IS NULL THEN
        PERFORM delete_assignments_for_entity('ticket', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Skip closed tickets
    IF NEW.status = 'closed' THEN
        PERFORM delete_assignments_for_entity('ticket', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_assignment(
        p_organization_id := NEW.organization_id,
        p_assignment_type := 'ticket',
        p_role := 'assignee',
        p_entity_type := 'ticket',
        p_entity_id := NEW.id,
        p_entity_name := NEW.subject,
        p_entity_path := '/operations/support/' || NEW.id::TEXT,
        p_user_id := NEW.assigned_to,
        p_status := NEW.status::TEXT,
        p_priority := NEW.priority::TEXT,
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_ticket_to_assignments ON support_tickets;
CREATE TRIGGER trg_sync_ticket_to_assignments
    AFTER INSERT OR UPDATE OR DELETE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION sync_ticket_to_assignments();

-- ============================================================================
-- RLS POLICIES FOR ASSIGNMENTS
-- ============================================================================

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS assignments_select_policy ON assignments;
DROP POLICY IF EXISTS assignments_insert_policy ON assignments;
DROP POLICY IF EXISTS assignments_update_policy ON assignments;
DROP POLICY IF EXISTS assignments_delete_policy ON assignments;

-- SELECT: Users can see their own assignments or team assignments
CREATE POLICY assignments_select_policy ON assignments
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    AND (
        user_id = auth.uid()
        OR visibility IN ('public', 'organization', 'team')
    )
);

-- INSERT: System/triggers can insert
CREATE POLICY assignments_insert_policy ON assignments
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- UPDATE: Limited to system
CREATE POLICY assignments_update_policy ON assignments
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- DELETE: Limited to system
CREATE POLICY assignments_delete_policy ON assignments
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing task assignments
-- ============================================================================

INSERT INTO assignments (
    organization_id, assignment_type, role, entity_type, entity_id,
    entity_name, entity_path, user_id, user_name,
    status, priority, due_date, project_id,
    visibility, external_id, created_at, updated_at
)
SELECT 
    t.organization_id,
    'task',
    'assignee',
    'task',
    t.id,
    t.title,
    '/core/tasks/' || t.id::TEXT,
    ta.user_id,
    u.full_name,
    t.status::TEXT,
    t.priority::TEXT,
    t.due_date::DATE,
    t.project_id,
    'team',
    'task:' || t.id::TEXT || ':' || ta.user_id::TEXT,
    NOW(),
    NOW()
FROM task_assignments ta
JOIN tasks t ON t.id = ta.task_id
JOIN users u ON u.id = ta.user_id
WHERE t.status != 'cancelled'
ON CONFLICT (external_id) DO NOTHING;

-- Backfill shifts
INSERT INTO assignments (
    organization_id, assignment_type, role, entity_type, entity_id,
    entity_name, entity_path, user_id, user_name,
    status, start_time, end_time, event_id,
    visibility, metadata, external_id, created_at, updated_at
)
SELECT 
    s.organization_id,
    'shift',
    'assignee',
    'shift',
    s.id,
    'Shift on ' || s.date::TEXT,
    '/people/scheduling/' || s.id::TEXT,
    s.user_id,
    u.full_name,
    s.status::TEXT,
    (s.date + s.scheduled_start)::TIMESTAMPTZ,
    (s.date + s.scheduled_end)::TIMESTAMPTZ,
    s.event_id,
    'team',
    jsonb_build_object('location', l.name),
    'shift:' || s.id::TEXT || ':' || s.user_id::TEXT,
    NOW(),
    NOW()
FROM shifts s
JOIN users u ON u.id = s.user_id
LEFT JOIN locations l ON l.id = s.location_id
WHERE s.user_id IS NOT NULL
AND s.status != 'cancelled'
ON CONFLICT (external_id) DO NOTHING;

-- Backfill deals
INSERT INTO assignments (
    organization_id, assignment_type, role, entity_type, entity_id,
    entity_name, entity_path, user_id, user_name,
    status, visibility, metadata, external_id, created_at, updated_at
)
SELECT 
    d.organization_id,
    'deal',
    'owner',
    'deal',
    d.id,
    d.name,
    '/business/deals/' || d.id::TEXT,
    d.owner_id,
    u.full_name,
    d.stage,
    'team',
    jsonb_build_object('value', d.value, 'probability', d.probability),
    'deal:' || d.id::TEXT || ':' || d.owner_id::TEXT,
    NOW(),
    NOW()
FROM deals d
JOIN users u ON u.id = d.owner_id
WHERE d.owner_id IS NOT NULL
ON CONFLICT (external_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE assignments IS 'SSOT for all user assignments. Source entities sync here via triggers.';
COMMENT ON COLUMN assignments.assignment_type IS 'Type of assignment (task, shift, crew, deal, ticket, project)';
COMMENT ON COLUMN assignments.role IS 'User role in assignment (owner, assignee, reviewer, member)';
COMMENT ON COLUMN assignments.entity_type IS 'Source entity type';
COMMENT ON COLUMN assignments.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN assignments.external_id IS 'Unique key for upsert: entity_type:entity_id:user_id[:suffix]';
