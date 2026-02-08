-- ATLVS Meeting Scheduler
-- Calendar Integration, Booking Links, and Meeting Management
-- Migration: 00043

-- ============================================================================
-- MEETING TYPES (Configurable meeting templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS meeting_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Duration
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Availability settings
    availability_schedule JSONB DEFAULT '{}', -- day-of-week availability windows
    buffer_before_minutes INTEGER DEFAULT 0,
    buffer_after_minutes INTEGER DEFAULT 15,
    min_notice_hours INTEGER DEFAULT 24,
    max_days_ahead INTEGER DEFAULT 60,
    
    -- Booking settings
    max_bookings_per_day INTEGER,
    requires_confirmation BOOLEAN DEFAULT FALSE,
    
    -- Location
    location_type VARCHAR(20) DEFAULT 'video' CHECK (location_type IN ('video', 'phone', 'in_person', 'custom')),
    location_details TEXT,
    video_provider VARCHAR(20), -- zoom, google_meet, teams, etc.
    
    -- Customization
    color VARCHAR(7) DEFAULT '#3b82f6',
    questions JSONB DEFAULT '[]', -- custom questions for bookers
    
    -- Notifications
    confirmation_email_template_id UUID,
    reminder_email_template_id UUID,
    reminder_hours_before INTEGER DEFAULT 24,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(owner_id, slug)
);

CREATE INDEX idx_meeting_types_organization ON meeting_types(organization_id);
CREATE INDEX idx_meeting_types_owner ON meeting_types(owner_id);
CREATE INDEX idx_meeting_types_active ON meeting_types(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- MEETING BOOKINGS (Scheduled meetings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS meeting_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    meeting_type_id UUID NOT NULL REFERENCES meeting_types(id) ON DELETE CASCADE,
    
    -- Host
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Guest info
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_timezone VARCHAR(50),
    
    -- CRM associations
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    -- Scheduling
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(20), -- host, guest
    cancellation_reason TEXT,
    
    -- Location
    location_type VARCHAR(20),
    location_details TEXT,
    video_link TEXT,
    
    -- Custom responses
    custom_responses JSONB DEFAULT '{}',
    
    -- Calendar sync
    calendar_event_id VARCHAR(255),
    calendar_provider VARCHAR(20),
    
    -- Notes
    host_notes TEXT,
    guest_notes TEXT,
    
    -- Reminders
    reminder_sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meeting_bookings_organization ON meeting_bookings(organization_id);
CREATE INDEX idx_meeting_bookings_type ON meeting_bookings(meeting_type_id);
CREATE INDEX idx_meeting_bookings_host ON meeting_bookings(host_id);
CREATE INDEX idx_meeting_bookings_contact ON meeting_bookings(contact_id);
CREATE INDEX idx_meeting_bookings_deal ON meeting_bookings(deal_id);
CREATE INDEX idx_meeting_bookings_starts ON meeting_bookings(starts_at);
CREATE INDEX idx_meeting_bookings_status ON meeting_bookings(status);
CREATE INDEX idx_meeting_bookings_upcoming ON meeting_bookings(host_id, starts_at) 
    WHERE status IN ('pending', 'confirmed');

-- ============================================================================
-- CALENDAR CONNECTIONS (OAuth to Google/Outlook calendars)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calendar_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
    calendar_id VARCHAR(255),
    calendar_name VARCHAR(255),
    
    -- OAuth tokens
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Sync settings
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_direction VARCHAR(20) DEFAULT 'both' CHECK (sync_direction IN ('read', 'write', 'both')),
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'pending',
    
    -- Preferences
    is_primary BOOLEAN DEFAULT FALSE,
    check_conflicts BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, provider, calendar_id)
);

CREATE INDEX idx_calendar_connections_user ON calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_sync ON calendar_connections(sync_enabled, last_sync_at);

-- ============================================================================
-- AVAILABILITY OVERRIDES (Block specific times)
-- ============================================================================

CREATE TABLE IF NOT EXISTS availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('unavailable', 'available')),
    
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    reason VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT, -- iCal RRULE format
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_overrides_user ON availability_overrides(user_id);
CREATE INDEX idx_availability_overrides_dates ON availability_overrides(starts_at, ends_at);

-- ============================================================================
-- TRIGGER: Auto-associate booking with contact
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_associate_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_contact_id UUID;
    v_company_id UUID;
BEGIN
    -- Skip if already associated
    IF NEW.contact_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Find matching contact by email
    SELECT id, company_id INTO v_contact_id, v_company_id
    FROM contacts
    WHERE organization_id = NEW.organization_id
      AND LOWER(email) = LOWER(NEW.guest_email)
    LIMIT 1;
    
    IF v_contact_id IS NOT NULL THEN
        NEW.contact_id := v_contact_id;
        NEW.company_id := COALESCE(NEW.company_id, v_company_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_associate_booking ON meeting_bookings;
CREATE TRIGGER trigger_auto_associate_booking
    BEFORE INSERT ON meeting_bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_associate_booking();

-- ============================================================================
-- TRIGGER: Create activity on meeting booking
-- ============================================================================

CREATE OR REPLACE FUNCTION create_meeting_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Create activity for confirmed bookings
    IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status != 'confirmed') THEN
        INSERT INTO activities (
            organization_id,
            activity_type,
            subject,
            description,
            company_id,
            contact_id,
            deal_id,
            due_date,
            is_completed,
            metadata
        ) VALUES (
            NEW.organization_id,
            'meeting',
            'Meeting: ' || (SELECT name FROM meeting_types WHERE id = NEW.meeting_type_id),
            'Meeting with ' || NEW.guest_name || ' (' || NEW.guest_email || ')',
            NEW.company_id,
            NEW.contact_id,
            NEW.deal_id,
            NEW.starts_at,
            FALSE,
            jsonb_build_object(
                'booking_id', NEW.id,
                'meeting_type_id', NEW.meeting_type_id,
                'duration_minutes', EXTRACT(EPOCH FROM (NEW.ends_at - NEW.starts_at)) / 60
            )
        );
    END IF;
    
    -- Update deal last_activity_at
    IF NEW.deal_id IS NOT NULL THEN
        UPDATE deals
        SET last_activity_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.deal_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_meeting_activity ON meeting_bookings;
CREATE TRIGGER trigger_create_meeting_activity
    AFTER INSERT OR UPDATE OF status ON meeting_bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_meeting_activity();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE meeting_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;

-- Meeting types: organization members can view, owners can edit
DROP POLICY IF EXISTS meeting_types_org_read ON meeting_types;
CREATE POLICY meeting_types_org_read ON meeting_types
    FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

DROP POLICY IF EXISTS meeting_types_owner_write ON meeting_types;
CREATE POLICY meeting_types_owner_write ON meeting_types
    FOR ALL
    USING (owner_id = auth.uid());

-- Meeting bookings: organization isolation
DROP POLICY IF EXISTS meeting_bookings_org_isolation ON meeting_bookings;
CREATE POLICY meeting_bookings_org_isolation ON meeting_bookings
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- Calendar connections: user isolation
DROP POLICY IF EXISTS calendar_connections_user_isolation ON calendar_connections;
CREATE POLICY calendar_connections_user_isolation ON calendar_connections
    FOR ALL
    USING (user_id = auth.uid());

-- Availability overrides: user isolation
DROP POLICY IF EXISTS availability_overrides_user_isolation ON availability_overrides;
CREATE POLICY availability_overrides_user_isolation ON availability_overrides
    FOR ALL
    USING (user_id = auth.uid());

-- ============================================================================
-- VIEW: Upcoming meetings with details
-- ============================================================================

CREATE OR REPLACE VIEW upcoming_meetings AS
SELECT 
    mb.*,
    mt.name as meeting_type_name,
    mt.duration_minutes,
    mt.color as meeting_type_color,
    u.email as host_email,
    u.raw_user_meta_data->>'full_name' as host_name
FROM meeting_bookings mb
JOIN meeting_types mt ON mb.meeting_type_id = mt.id
JOIN auth.users u ON mb.host_id = u.id
WHERE mb.status IN ('pending', 'confirmed')
  AND mb.starts_at > NOW()
ORDER BY mb.starts_at;

COMMENT ON VIEW upcoming_meetings IS 'Upcoming confirmed meetings with type and host details';

-- ============================================================================
-- FUNCTION: Check availability for a time slot
-- ============================================================================

CREATE OR REPLACE FUNCTION check_availability(
    p_user_id UUID,
    p_meeting_type_id UUID,
    p_starts_at TIMESTAMPTZ,
    p_ends_at TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INTEGER;
    v_override_count INTEGER;
BEGIN
    -- Check for conflicting bookings
    SELECT COUNT(*) INTO v_conflict_count
    FROM meeting_bookings
    WHERE host_id = p_user_id
      AND status IN ('pending', 'confirmed')
      AND (
          (starts_at <= p_starts_at AND ends_at > p_starts_at) OR
          (starts_at < p_ends_at AND ends_at >= p_ends_at) OR
          (starts_at >= p_starts_at AND ends_at <= p_ends_at)
      );
    
    IF v_conflict_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for unavailability overrides
    SELECT COUNT(*) INTO v_override_count
    FROM availability_overrides
    WHERE user_id = p_user_id
      AND override_type = 'unavailable'
      AND (
          (starts_at <= p_starts_at AND ends_at > p_starts_at) OR
          (starts_at < p_ends_at AND ends_at >= p_ends_at) OR
          (starts_at >= p_starts_at AND ends_at <= p_ends_at)
      );
    
    IF v_override_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
