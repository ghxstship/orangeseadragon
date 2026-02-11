-- ============================================================================
-- CALENDAR EVENTS AS SSOT - TRIGGER-BASED SYNC
-- ============================================================================
-- 
-- This migration establishes calendar_events as the Single Source of Truth
-- for all temporal data across the platform. Source entities (events, 
-- productions, tasks, etc.) automatically sync their dates to calendar_events
-- via database triggers.
--
-- ARCHITECTURE:
-- - Source entities own business data
-- - calendar_events owns temporal index
-- - Triggers maintain sync on INSERT/UPDATE/DELETE
-- - RLS policies enforce RBAC at database level
--
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Upsert calendar event
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_calendar_event(
    p_organization_id UUID,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_title VARCHAR(255),
    p_description TEXT,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_all_day BOOLEAN DEFAULT TRUE,
    p_color VARCHAR(7) DEFAULT NULL,
    p_visibility visibility_type DEFAULT 'team',
    p_user_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_suffix VARCHAR(50) DEFAULT NULL  -- For entities with multiple dates (e.g., 'load_in', 'strike')
) RETURNS UUID AS $$
DECLARE
    v_calendar_id UUID;
    v_entity_key VARCHAR(100);
BEGIN
    -- Create unique key for this calendar entry
    v_entity_key := p_entity_type || ':' || p_entity_id::TEXT || COALESCE(':' || p_suffix, '');
    
    -- Upsert the calendar event
    INSERT INTO calendar_events (
        organization_id,
        entity_type,
        entity_id,
        title,
        description,
        start_time,
        end_time,
        all_day,
        color,
        visibility,
        user_id,
        location,
        external_id,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        p_entity_type,
        p_entity_id,
        p_title,
        p_description,
        p_start_time,
        p_end_time,
        p_all_day,
        p_color,
        p_visibility,
        p_user_id,
        p_location,
        v_entity_key,
        NOW(),
        NOW()
    )
    ON CONFLICT (organization_id, external_id) 
    WHERE external_id IS NOT NULL
    DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        all_day = EXCLUDED.all_day,
        color = EXCLUDED.color,
        visibility = EXCLUDED.visibility,
        location = EXCLUDED.location,
        updated_at = NOW()
    RETURNING id INTO v_calendar_id;
    
    RETURN v_calendar_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Delete calendar events for entity
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_calendar_events_for_entity(
    p_entity_type VARCHAR(50),
    p_entity_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM calendar_events 
    WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Add unique constraint for upsert (if not exists)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'calendar_events_org_external_id_unique'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS calendar_events_org_external_id_unique 
        ON calendar_events(organization_id, external_id) 
        WHERE external_id IS NOT NULL;
    END IF;
END $$;

-- ============================================================================
-- TRIGGER: Events → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_event_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_venue_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('event', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip soft-deleted records
    IF NEW.deleted_at IS NOT NULL THEN
        PERFORM delete_calendar_events_for_entity('event', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Combine date and time
    v_start_time := (NEW.start_date + COALESCE(NEW.start_time, '00:00:00'::TIME))::TIMESTAMPTZ;
    v_end_time := (NEW.end_date + COALESCE(NEW.end_time, '23:59:59'::TIME))::TIMESTAMPTZ;
    
    -- Get venue name for location
    SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;
    
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'event',
        p_entity_id := NEW.id,
        p_title := NEW.name,
        p_description := NEW.description,
        p_start_time := v_start_time,
        p_end_time := v_end_time,
        p_all_day := (NEW.start_time IS NULL),
        p_color := '#3b82f6',  -- blue
        p_visibility := COALESCE(NEW.visibility, 'team'),
        p_location := v_venue_name
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_event_to_calendar ON events;
CREATE TRIGGER trg_sync_event_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION sync_event_to_calendar();

-- ============================================================================
-- TRIGGER: Productions → calendar_events (multiple entries per production)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_production_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_venue_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('production', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get venue name
    SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;
    
    -- Main event dates
    IF NEW.event_start IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'production',
            p_entity_id := NEW.id,
            p_title := NEW.name,
            p_description := NEW.description,
            p_start_time := NEW.event_start::TIMESTAMPTZ,
            p_end_time := COALESCE(NEW.event_end, NEW.event_start)::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#8b5cf6',  -- purple
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'event'
        );
    END IF;
    
    -- Load-in milestone
    IF NEW.load_in_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'production',
            p_entity_id := NEW.id,
            p_title := 'Load-In: ' || NEW.name,
            p_description := 'Load-in for ' || NEW.production_code,
            p_start_time := NEW.load_in_date::TIMESTAMPTZ,
            p_end_time := NEW.load_in_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#a855f7',  -- lighter purple
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'load_in'
        );
    END IF;
    
    -- Strike milestone
    IF NEW.strike_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'production',
            p_entity_id := NEW.id,
            p_title := 'Strike: ' || NEW.name,
            p_description := 'Strike for ' || NEW.production_code,
            p_start_time := NEW.strike_date::TIMESTAMPTZ,
            p_end_time := NEW.strike_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#c084fc',  -- even lighter purple
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'strike'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_production_to_calendar ON productions;
CREATE TRIGGER trg_sync_production_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON productions
    FOR EACH ROW EXECUTE FUNCTION sync_production_to_calendar();

-- ============================================================================
-- TRIGGER: Tasks → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_task_to_calendar() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('task', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip soft-deleted or tasks without due dates
    IF NEW.deleted_at IS NOT NULL OR NEW.due_date IS NULL THEN
        PERFORM delete_calendar_events_for_entity('task', NEW.id);
        RETURN NEW;
    END IF;
    
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'task',
        p_entity_id := NEW.id,
        p_title := NEW.title,
        p_description := NEW.description,
        p_start_time := COALESCE(NEW.start_date, NEW.due_date)::TIMESTAMPTZ,
        p_end_time := NEW.due_date::TIMESTAMPTZ,
        p_all_day := TRUE,
        p_color := '#f59e0b',  -- amber
        p_visibility := 'team',
        p_user_id := NEW.created_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_task_to_calendar ON tasks;
CREATE TRIGGER trg_sync_task_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION sync_task_to_calendar();

-- ============================================================================
-- TRIGGER: Contracts → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_contract_to_calendar() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('contract', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Contract start
    IF NEW.start_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'contract',
            p_entity_id := NEW.id,
            p_title := 'Contract Start: ' || NEW.title,
            p_description := 'Contract ' || NEW.contract_number || ' begins',
            p_start_time := NEW.start_date::TIMESTAMPTZ,
            p_end_time := NEW.start_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#10b981',  -- emerald
            p_visibility := 'team',
            p_suffix := 'start'
        );
    END IF;
    
    -- Contract end
    IF NEW.end_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'contract',
            p_entity_id := NEW.id,
            p_title := 'Contract End: ' || NEW.title,
            p_description := 'Contract ' || NEW.contract_number || ' expires',
            p_start_time := NEW.end_date::TIMESTAMPTZ,
            p_end_time := NEW.end_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#ef4444',  -- red for expiration
            p_visibility := 'team',
            p_suffix := 'end'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_contract_to_calendar ON contracts;
CREATE TRIGGER trg_sync_contract_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION sync_contract_to_calendar();

-- ============================================================================
-- TRIGGER: Activations → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_activation_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_venue_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('activation', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get venue name
    SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;
    
    -- Main activation dates
    IF NEW.start_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'activation',
            p_entity_id := NEW.id,
            p_title := NEW.name,
            p_description := NEW.description,
            p_start_time := NEW.start_date::TIMESTAMPTZ,
            p_end_time := COALESCE(NEW.end_date, NEW.start_date)::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#ec4899',  -- pink
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'event'
        );
    END IF;
    
    -- Setup milestone
    IF NEW.setup_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'activation',
            p_entity_id := NEW.id,
            p_title := 'Setup: ' || NEW.name,
            p_description := 'Setup for ' || NEW.activation_code,
            p_start_time := NEW.setup_date::TIMESTAMPTZ,
            p_end_time := NEW.setup_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#f472b6',  -- lighter pink
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'setup'
        );
    END IF;
    
    -- Teardown milestone
    IF NEW.teardown_date IS NOT NULL THEN
        PERFORM upsert_calendar_event(
            p_organization_id := NEW.organization_id,
            p_entity_type := 'activation',
            p_entity_id := NEW.id,
            p_title := 'Teardown: ' || NEW.name,
            p_description := 'Teardown for ' || NEW.activation_code,
            p_start_time := NEW.teardown_date::TIMESTAMPTZ,
            p_end_time := NEW.teardown_date::TIMESTAMPTZ,
            p_all_day := TRUE,
            p_color := '#fb7185',  -- even lighter pink
            p_visibility := 'team',
            p_location := v_venue_name,
            p_suffix := 'teardown'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_activation_to_calendar ON activations;
CREATE TRIGGER trg_sync_activation_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON activations
    FOR EACH ROW EXECUTE FUNCTION sync_activation_to_calendar();

-- ============================================================================
-- TRIGGER: Shifts → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_shift_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_user_name TEXT;
    v_position_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('shift', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Get user and position names
    SELECT COALESCE(display_name, first_name || ' ' || last_name) INTO v_user_name 
    FROM users WHERE id = NEW.user_id;
    
    SELECT name INTO v_position_name FROM positions WHERE id = NEW.position_id;
    
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'shift',
        p_entity_id := NEW.id,
        p_title := COALESCE(v_position_name, 'Shift') || ': ' || COALESCE(v_user_name, 'Unassigned'),
        p_description := NEW.notes,
        p_start_time := NEW.start_time,
        p_end_time := NEW.end_time,
        p_all_day := FALSE,
        p_color := '#14b8a6',  -- teal
        p_visibility := 'team',
        p_user_id := NEW.user_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_shift_to_calendar ON shifts;
CREATE TRIGGER trg_sync_shift_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON shifts
    FOR EACH ROW EXECUTE FUNCTION sync_shift_to_calendar();

-- ============================================================================
-- TRIGGER: Asset Maintenance → calendar_events
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_maintenance_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_asset_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('maintenance', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip if no scheduled date
    IF NEW.scheduled_date IS NULL THEN
        PERFORM delete_calendar_events_for_entity('maintenance', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get asset name
    SELECT name INTO v_asset_name FROM assets WHERE id = NEW.asset_id;
    
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'maintenance',
        p_entity_id := NEW.id,
        p_title := COALESCE(NEW.title, 'Maintenance: ' || COALESCE(v_asset_name, 'Asset')),
        p_description := NEW.description,
        p_start_time := NEW.scheduled_date::TIMESTAMPTZ,
        p_end_time := NEW.scheduled_date::TIMESTAMPTZ,
        p_all_day := TRUE,
        p_color := '#f97316',  -- orange
        p_visibility := 'team'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_maintenance_to_calendar ON asset_maintenance;
CREATE TRIGGER trg_sync_maintenance_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON asset_maintenance
    FOR EACH ROW EXECUTE FUNCTION sync_maintenance_to_calendar();

-- ============================================================================
-- RLS POLICIES FOR CALENDAR_EVENTS
-- ============================================================================

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS calendar_events_select_policy ON calendar_events;
DROP POLICY IF EXISTS calendar_events_insert_policy ON calendar_events;
DROP POLICY IF EXISTS calendar_events_update_policy ON calendar_events;
DROP POLICY IF EXISTS calendar_events_delete_policy ON calendar_events;

-- SELECT: Users can see calendar events based on visibility and organization membership
CREATE POLICY calendar_events_select_policy ON calendar_events
FOR SELECT USING (
    -- Must be in the organization
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        -- Public visibility - everyone in org can see
        visibility = 'public'
        -- Organization visibility - everyone in org can see
        OR visibility = 'organization'
        -- Team visibility - everyone in org can see (simplified; could add team membership check)
        OR visibility = 'team'
        -- Private visibility - only owner can see
        OR (visibility = 'private' AND user_id = auth.uid())
        -- Created by user
        OR created_by = auth.uid()
    )
);

-- INSERT: Users can create calendar events in their organization
CREATE POLICY calendar_events_insert_policy ON calendar_events
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
);

-- UPDATE: Users can update their own events or events they have permission to
CREATE POLICY calendar_events_update_policy ON calendar_events
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        user_id = auth.uid()
        OR created_by = auth.uid()
        OR visibility IN ('public', 'organization', 'team')
    )
);

-- DELETE: Users can delete their own events
CREATE POLICY calendar_events_delete_policy ON calendar_events
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
    AND (
        user_id = auth.uid()
        OR created_by = auth.uid()
    )
);

-- ============================================================================
-- BACKFILL: Sync existing data to calendar_events
-- ============================================================================

-- Backfill events
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, location, external_id,
    created_at, updated_at
)
SELECT 
    e.organization_id,
    'event',
    e.id,
    e.name,
    e.description,
    (e.start_date + COALESCE(e.start_time, '00:00:00'::TIME))::TIMESTAMPTZ,
    (e.end_date + COALESCE(e.end_time, '23:59:59'::TIME))::TIMESTAMPTZ,
    (e.start_time IS NULL),
    '#3b82f6',
    COALESCE(e.visibility, 'team'),
    v.name,
    'event:' || e.id::TEXT,
    NOW(),
    NOW()
FROM events e
LEFT JOIN venues v ON v.id = e.venue_id
WHERE e.deleted_at IS NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill productions (main event)
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, location, external_id,
    created_at, updated_at
)
SELECT 
    p.organization_id,
    'production',
    p.id,
    p.name,
    p.description,
    p.event_start::TIMESTAMPTZ,
    COALESCE(p.event_end, p.event_start)::TIMESTAMPTZ,
    TRUE,
    '#8b5cf6',
    'team',
    v.name,
    'production:' || p.id::TEXT || ':event',
    NOW(),
    NOW()
FROM productions p
LEFT JOIN venues v ON v.id = p.venue_id
WHERE p.event_start IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill productions (load-in)
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, location, external_id,
    created_at, updated_at
)
SELECT 
    p.organization_id,
    'production',
    p.id,
    'Load-In: ' || p.name,
    'Load-in for ' || p.production_code,
    p.load_in_date::TIMESTAMPTZ,
    p.load_in_date::TIMESTAMPTZ,
    TRUE,
    '#a855f7',
    'team',
    v.name,
    'production:' || p.id::TEXT || ':load_in',
    NOW(),
    NOW()
FROM productions p
LEFT JOIN venues v ON v.id = p.venue_id
WHERE p.load_in_date IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill productions (strike)
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, location, external_id,
    created_at, updated_at
)
SELECT 
    p.organization_id,
    'production',
    p.id,
    'Strike: ' || p.name,
    'Strike for ' || p.production_code,
    p.strike_date::TIMESTAMPTZ,
    p.strike_date::TIMESTAMPTZ,
    TRUE,
    '#c084fc',
    'team',
    v.name,
    'production:' || p.id::TEXT || ':strike',
    NOW(),
    NOW()
FROM productions p
LEFT JOIN venues v ON v.id = p.venue_id
WHERE p.strike_date IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill tasks
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, user_id, external_id,
    created_at, updated_at
)
SELECT 
    t.organization_id,
    'task',
    t.id,
    t.title,
    t.description,
    COALESCE(t.start_date, t.due_date)::TIMESTAMPTZ,
    t.due_date::TIMESTAMPTZ,
    TRUE,
    '#f59e0b',
    'team',
    t.created_by,
    'task:' || t.id::TEXT,
    NOW(),
    NOW()
FROM tasks t
WHERE t.deleted_at IS NULL AND t.due_date IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill contracts (start)
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, external_id,
    created_at, updated_at
)
SELECT 
    c.organization_id,
    'contract',
    c.id,
    'Contract Start: ' || c.title,
    'Contract ' || c.contract_number || ' begins',
    c.start_date::TIMESTAMPTZ,
    c.start_date::TIMESTAMPTZ,
    TRUE,
    '#10b981',
    'team',
    'contract:' || c.id::TEXT || ':start',
    NOW(),
    NOW()
FROM contracts c
WHERE c.start_date IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- Backfill contracts (end)
INSERT INTO calendar_events (
    organization_id, entity_type, entity_id, title, description,
    start_time, end_time, all_day, color, visibility, external_id,
    created_at, updated_at
)
SELECT 
    c.organization_id,
    'contract',
    c.id,
    'Contract End: ' || c.title,
    'Contract ' || c.contract_number || ' expires',
    c.end_date::TIMESTAMPTZ,
    c.end_date::TIMESTAMPTZ,
    TRUE,
    '#ef4444',
    'team',
    'contract:' || c.id::TEXT || ':end',
    NOW(),
    NOW()
FROM contracts c
WHERE c.end_date IS NOT NULL
ON CONFLICT (organization_id, external_id) WHERE external_id IS NOT NULL DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE calendar_events IS 'SSOT for all temporal data. Source entities sync here via triggers.';
COMMENT ON COLUMN calendar_events.entity_type IS 'Source entity type (event, production, task, contract, activation, shift, maintenance)';
COMMENT ON COLUMN calendar_events.entity_id IS 'Foreign key to source entity';
COMMENT ON COLUMN calendar_events.external_id IS 'Unique key for upsert: entity_type:entity_id[:suffix]';
