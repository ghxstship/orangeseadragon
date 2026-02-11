-- Migration: Build & Strike Schedules
-- Created: 2026-02-02
-- Description: Create build_strike_schedules table with calendar sync trigger
-- Reference: Uses same calendar integration pattern as 00038_calendar_ssot_triggers.sql

-- ============================================================================
-- BUILD & STRIKE SCHEDULES TABLE
-- Navigation: /productions/build-strike
-- Purpose: Logistics/labor scheduling for load-in, build, strike, load-out
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'build_strike_type') THEN
        CREATE TYPE build_strike_type AS ENUM (
            'load_in', 'build', 'rehearsal', 'strike', 'load_out', 'reset'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'build_strike_status') THEN
        CREATE TYPE build_strike_status AS ENUM (
            'scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS build_strike_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Parent references
    production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    event_day_id UUID REFERENCES event_days(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    
    -- Schedule details
    schedule_type build_strike_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timing
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    
    -- Location
    location VARCHAR(255),
    venue_zone_id UUID REFERENCES venue_zones(id) ON DELETE SET NULL,
    
    -- Labor requirements
    crew_required INTEGER,
    crew_assigned INTEGER DEFAULT 0,
    crew_call_id UUID REFERENCES crew_calls(id) ON DELETE SET NULL,
    
    -- Equipment/logistics
    equipment_notes TEXT,
    truck_count INTEGER,
    forklift_required BOOLEAN DEFAULT FALSE,
    dock_assignment VARCHAR(50),
    
    -- Dependencies
    depends_on_id UUID REFERENCES build_strike_schedules(id) ON DELETE SET NULL,
    
    -- Status
    status build_strike_status DEFAULT 'scheduled',
    priority INTEGER DEFAULT 0,
    
    -- Notes
    notes TEXT,
    safety_notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT valid_schedule_times CHECK (scheduled_end > scheduled_start),
    CONSTRAINT valid_actual_times CHECK (actual_end IS NULL OR actual_start IS NULL OR actual_end >= actual_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_build_strike_org ON build_strike_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_build_strike_production ON build_strike_schedules(production_id);
CREATE INDEX IF NOT EXISTS idx_build_strike_event ON build_strike_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_build_strike_venue ON build_strike_schedules(venue_id);
CREATE INDEX IF NOT EXISTS idx_build_strike_type ON build_strike_schedules(schedule_type);
CREATE INDEX IF NOT EXISTS idx_build_strike_status ON build_strike_schedules(status);
CREATE INDEX IF NOT EXISTS idx_build_strike_dates ON build_strike_schedules(scheduled_start, scheduled_end);
CREATE INDEX IF NOT EXISTS idx_build_strike_crew_call ON build_strike_schedules(crew_call_id);
CREATE INDEX IF NOT EXISTS idx_build_strike_depends ON build_strike_schedules(depends_on_id);

-- ============================================================================
-- CALENDAR SYNC TRIGGER
-- Uses same pattern as 00038_calendar_ssot_triggers.sql
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_build_strike_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_venue_name TEXT;
    v_color VARCHAR(7);
    v_title TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('build_strike', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip cancelled schedules
    IF NEW.status = 'cancelled' THEN
        PERFORM delete_calendar_events_for_entity('build_strike', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get venue name if available
    IF NEW.venue_id IS NOT NULL THEN
        SELECT name INTO v_venue_name FROM venues WHERE id = NEW.venue_id;
    END IF;
    
    -- Set color based on schedule type
    v_color := CASE NEW.schedule_type
        WHEN 'load_in' THEN '#3B82F6'   -- Blue
        WHEN 'build' THEN '#10B981'      -- Green
        WHEN 'rehearsal' THEN '#8B5CF6' -- Purple
        WHEN 'strike' THEN '#F59E0B'    -- Amber
        WHEN 'load_out' THEN '#EF4444'  -- Red
        WHEN 'reset' THEN '#6B7280'     -- Gray
        ELSE '#6B7280'
    END;
    
    -- Build title with type prefix
    v_title := UPPER(NEW.schedule_type::TEXT) || ': ' || NEW.name;
    
    -- Upsert calendar event
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'build_strike',
        p_entity_id := NEW.id,
        p_title := v_title,
        p_description := NEW.description,
        p_start_time := NEW.scheduled_start,
        p_end_time := NEW.scheduled_end,
        p_all_day := FALSE,
        p_color := v_color,
        p_visibility := 'team'::visibility_type,
        p_user_id := NEW.created_by,
        p_location := COALESCE(NEW.location, v_venue_name),
        p_suffix := NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_sync_build_strike_to_calendar ON build_strike_schedules;
CREATE TRIGGER trg_sync_build_strike_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON build_strike_schedules
    FOR EACH ROW EXECUTE FUNCTION sync_build_strike_to_calendar();

-- ============================================================================
-- RUN OF SHOW CALENDAR SYNC TRIGGER (if not exists)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_run_of_show_to_calendar() RETURNS TRIGGER AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_venue_name TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM delete_calendar_events_for_entity('run_of_show', OLD.id);
        RETURN OLD;
    END IF;
    
    -- Skip archived run of shows
    IF NEW.status = 'archived' THEN
        PERFORM delete_calendar_events_for_entity('run_of_show', NEW.id);
        RETURN NEW;
    END IF;
    
    -- Get venue name from event if available
    IF NEW.event_id IS NOT NULL THEN
        SELECT v.name INTO v_venue_name 
        FROM events e 
        LEFT JOIN venues v ON v.id = e.venue_id 
        WHERE e.id = NEW.event_id;
    END IF;
    
    -- Run of show is typically a full day event
    v_start_time := NEW.show_date::TIMESTAMPTZ;
    v_end_time := (NEW.show_date + INTERVAL '1 day')::TIMESTAMPTZ;
    
    -- Upsert calendar event
    PERFORM upsert_calendar_event(
        p_organization_id := NEW.organization_id,
        p_entity_type := 'run_of_show',
        p_entity_id := NEW.id,
        p_title := 'RUN OF SHOW: ' || NEW.name,
        p_description := 'Version ' || NEW.version || ' - Status: ' || NEW.status,
        p_start_time := v_start_time,
        p_end_time := v_end_time,
        p_all_day := TRUE,
        p_color := '#EC4899',  -- Pink
        p_visibility := 'team'::visibility_type,
        p_user_id := NEW.created_by,
        p_location := v_venue_name,
        p_suffix := NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for run_of_show
DROP TRIGGER IF EXISTS trg_sync_run_of_show_to_calendar ON run_of_show;
CREATE TRIGGER trg_sync_run_of_show_to_calendar
    AFTER INSERT OR UPDATE OR DELETE ON run_of_show
    FOR EACH ROW EXECUTE FUNCTION sync_run_of_show_to_calendar();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE build_strike_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "build_strike_org_read" ON build_strike_schedules;
CREATE POLICY "build_strike_org_read" ON build_strike_schedules 
    FOR SELECT USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "build_strike_org_insert" ON build_strike_schedules;
CREATE POLICY "build_strike_org_insert" ON build_strike_schedules 
    FOR INSERT WITH CHECK (is_organization_member(organization_id));
DROP POLICY IF EXISTS "build_strike_org_update" ON build_strike_schedules;
CREATE POLICY "build_strike_org_update" ON build_strike_schedules 
    FOR UPDATE USING (is_organization_member(organization_id));
DROP POLICY IF EXISTS "build_strike_org_delete" ON build_strike_schedules;
CREATE POLICY "build_strike_org_delete" ON build_strike_schedules 
    FOR DELETE USING (is_organization_member(organization_id));

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS trg_build_strike_updated_at ON build_strike_schedules;
CREATE TRIGGER trg_build_strike_updated_at
    BEFORE UPDATE ON build_strike_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE build_strike_schedules IS 'Logistics and labor scheduling for load-in, build, strike, and load-out operations. Syncs to calendar_events via trigger.';
COMMENT ON COLUMN build_strike_schedules.schedule_type IS 'Type of schedule: load_in, build, rehearsal, strike, load_out, reset';
COMMENT ON COLUMN build_strike_schedules.depends_on_id IS 'Reference to another build_strike_schedule that must complete before this one starts';
