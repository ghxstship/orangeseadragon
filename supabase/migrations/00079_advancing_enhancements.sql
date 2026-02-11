-- Migration 00070: Advancing Module Enhancements
-- Implements competitive analysis recommendations:
-- 1. Asset Tags for QR/Barcode scanning
-- 2. Scan Events for tracking
-- 3. Inventory Conflicts detection
-- 4. Activity Events for audit trail
-- 5. Comments system
-- 6. Reminders system
-- 7. Crew scheduling foundation

-- ============================================================================
-- 1. ASSET TAGS (QR/Barcode Scanning)
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES advance_items(id) ON DELETE CASCADE,
    catalog_item_id UUID REFERENCES advancing_catalog_items(id) ON DELETE SET NULL,
    tag_type VARCHAR(20) NOT NULL CHECK (tag_type IN ('qr', 'barcode', 'rfid', 'nfc')),
    tag_value VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_scanned_at TIMESTAMPTZ,
    last_scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_location VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    UNIQUE(organization_id, tag_value)
);

COMMENT ON TABLE asset_tags IS 'QR codes, barcodes, RFID tags for inventory tracking';
COMMENT ON COLUMN asset_tags.tag_value IS 'The actual code value (QR content, barcode number, etc.)';

CREATE INDEX IF NOT EXISTS idx_asset_tags_org ON asset_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_item ON asset_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_value ON asset_tags(tag_value);
CREATE INDEX IF NOT EXISTS idx_asset_tags_type ON asset_tags(tag_type);

-- ============================================================================
-- 2. SCAN EVENTS (Scan History/Audit)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scan_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_tag_id UUID NOT NULL REFERENCES asset_tags(id) ON DELETE CASCADE,
    scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'check_out', 'check_in', 'verify', 'locate', 'transfer', 
        'inspect', 'maintenance', 'damage_report'
    )),
    location VARCHAR(255),
    geo_lat DECIMAL(10, 8),
    geo_lng DECIMAL(11, 8),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    advance_id UUID REFERENCES production_advances(id) ON DELETE SET NULL,
    notes TEXT,
    photo_urls JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE scan_events IS 'Audit trail of all asset scans';
COMMENT ON COLUMN scan_events.geo_lat IS 'GPS latitude if available';
COMMENT ON COLUMN scan_events.geo_lng IS 'GPS longitude if available';

CREATE INDEX IF NOT EXISTS idx_scan_events_org ON scan_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_tag ON scan_events(asset_tag_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_user ON scan_events(scanned_by);
CREATE INDEX IF NOT EXISTS idx_scan_events_time ON scan_events(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_events_action ON scan_events(action);
CREATE INDEX IF NOT EXISTS idx_scan_events_event ON scan_events(event_id);

-- ============================================================================
-- 3. INVENTORY CONFLICTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN (
        'double_booking', 'overlap', 'insufficient_buffer', 
        'quantity_exceeded', 'dependency_violation', 'capacity_exceeded'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('warning', 'blocking')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored', 'auto_resolved')),
    
    -- Conflicting entities
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    conflicting_entity_type VARCHAR(50),
    conflicting_entity_id UUID,
    
    -- Context
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    advance_id UUID REFERENCES production_advances(id) ON DELETE SET NULL,
    item_id UUID REFERENCES advance_items(id) ON DELETE SET NULL,
    
    -- Details
    description TEXT NOT NULL,
    conflict_start TIMESTAMPTZ,
    conflict_end TIMESTAMPTZ,
    suggested_resolutions JSONB DEFAULT '[]',
    
    -- Resolution
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_action VARCHAR(100),
    resolution_notes TEXT,
    
    -- Metadata
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE inventory_conflicts IS 'Detected scheduling and resource conflicts';
COMMENT ON COLUMN inventory_conflicts.suggested_resolutions IS 'Array of resolution options: [{action: "substitute", label: "Use Item B", data: {...}}]';

CREATE INDEX IF NOT EXISTS idx_conflicts_org ON inventory_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_status ON inventory_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_severity ON inventory_conflicts(severity);
CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON inventory_conflicts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_event ON inventory_conflicts(event_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_item ON inventory_conflicts(item_id);

-- ============================================================================
-- 4. ACTIVITY EVENTS (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'created', 'updated', 'deleted', 'status_changed', 
        'assigned', 'unassigned', 'commented', 'mentioned',
        'approved', 'rejected', 'completed', 'reopened',
        'attached', 'detached', 'moved', 'duplicated'
    )),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),
    
    -- Change details
    field_changes JSONB DEFAULT '[]',
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    
    -- Context
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    parent_entity_type VARCHAR(100),
    parent_entity_id UUID,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE activity_events IS 'Comprehensive audit trail for all entity changes';
COMMENT ON COLUMN activity_events.field_changes IS 'Array of changed fields: [{field: "status", from: "pending", to: "confirmed"}]';

CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_events(action);
CREATE INDEX IF NOT EXISTS idx_activity_time ON activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_event ON activity_events(event_id);

-- ============================================================================
-- 5. COMMENTS SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    -- Content
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_html TEXT,
    
    -- Mentions & Attachments
    mentions JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '{}',
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE comments IS 'Threaded comments on any entity';
COMMENT ON COLUMN comments.mentions IS 'Array of mentioned user IDs: ["uuid1", "uuid2"]';
COMMENT ON COLUMN comments.reactions IS 'Reaction counts: {"👍": ["user1", "user2"], "🎉": ["user3"]}';

CREATE INDEX IF NOT EXISTS idx_comments_org ON comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_time ON comments(created_at DESC);

-- ============================================================================
-- 6. REMINDERS SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Target
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Reminder details
    title VARCHAR(255) NOT NULL,
    message TEXT,
    remind_at TIMESTAMPTZ NOT NULL,
    
    -- Recipients
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipients JSONB NOT NULL DEFAULT '[]',
    
    -- Recurrence
    recurrence VARCHAR(20) CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly', 'custom')),
    recurrence_config JSONB DEFAULT '{}',
    next_occurrence TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'snoozed', 'cancelled', 'completed')),
    sent_at TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,
    
    -- Channels
    channels JSONB DEFAULT '["in_app"]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reminders IS 'Scheduled reminders for entities';
COMMENT ON COLUMN reminders.recipients IS 'Array of user IDs or special values: ["uuid1", "assigned_to", "team:uuid"]';
COMMENT ON COLUMN reminders.channels IS 'Delivery channels: ["in_app", "email", "push", "sms"]';

CREATE INDEX IF NOT EXISTS idx_reminders_org ON reminders(organization_id);
CREATE INDEX IF NOT EXISTS idx_reminders_entity ON reminders(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_creator ON reminders(created_by);

-- ============================================================================
-- 7. CREW MEMBERS (Staff Scheduling Foundation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Profile
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    
    -- Skills & Certifications
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    equipment_trained JSONB DEFAULT '[]',
    
    -- Rates
    hourly_rate DECIMAL(10, 2),
    day_rate DECIMAL(10, 2),
    overtime_multiplier DECIMAL(3, 2) DEFAULT 1.5,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Availability
    default_availability JSONB DEFAULT '{}',
    
    -- Performance
    rating DECIMAL(3, 2) DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

COMMENT ON TABLE crew_members IS 'Crew/staff profiles for scheduling';
COMMENT ON COLUMN crew_members.skills IS 'Array of skill tags: ["audio", "lighting", "rigging", "video"]';
COMMENT ON COLUMN crew_members.certifications IS 'Array: [{name: "Forklift", expires: "2025-12-31", verified: true}]';
COMMENT ON COLUMN crew_members.default_availability IS 'Weekly availability: {monday: {start: "09:00", end: "17:00"}, ...}';

CREATE INDEX IF NOT EXISTS idx_crew_org ON crew_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_user ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_email ON crew_members(email);

-- ============================================================================
-- 8. CREW AVAILABILITY
-- ============================================================================
CREATE TABLE IF NOT EXISTS crew_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    crew_member_id UUID NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    
    -- Date range
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'unavailable', 'tentative', 'booked')),
    
    -- Context
    reason VARCHAR(255),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crew_member_id, date, start_time)
);

COMMENT ON TABLE crew_availability IS 'Daily availability calendar for crew members';

CREATE INDEX IF NOT EXISTS idx_crew_avail_org ON crew_availability(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_avail_member ON crew_availability(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_avail_date ON crew_availability(date);
CREATE INDEX IF NOT EXISTS idx_crew_avail_status ON crew_availability(status);

-- ============================================================================
-- 9. CREW ASSIGNMENTS
-- ============================================================================
-- Extend existing crew_assignments table (originally from 00004_workforce.sql)
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS crew_member_id UUID;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS advance_id UUID;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS advance_item_id UUID;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS shift_start TIMESTAMPTZ;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS shift_end TIMESTAMPTZ;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5, 2);
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS confirmed_by UUID;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;
ALTER TABLE crew_assignments ADD COLUMN IF NOT EXISTS special_instructions TEXT;

COMMENT ON TABLE crew_assignments IS 'Crew scheduling assignments to events/advances';

CREATE INDEX IF NOT EXISTS idx_crew_assign_org ON crew_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_assign_member ON crew_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_assign_event ON crew_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_assign_advance ON crew_assignments(advance_id);
CREATE INDEX IF NOT EXISTS idx_crew_assign_status ON crew_assignments(status);
CREATE INDEX IF NOT EXISTS idx_crew_assign_shift ON crew_assignments(shift_start, shift_end);

-- ============================================================================
-- 10. EXTEND ADVANCE_ITEMS FOR AVAILABILITY TRACKING
-- ============================================================================
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS buffer_hours_before INTEGER DEFAULT 0;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS buffer_hours_after INTEGER DEFAULT 0;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS asset_tag_id UUID REFERENCES asset_tags(id) ON DELETE SET NULL;
ALTER TABLE advance_items ADD COLUMN IF NOT EXISTS conflict_count INTEGER DEFAULT 0;

-- ============================================================================
-- 11. EXTEND PRODUCTION_ADVANCES FOR CONFLICT TRACKING
-- ============================================================================
ALTER TABLE production_advances ADD COLUMN IF NOT EXISTS conflict_count INTEGER DEFAULT 0;
ALTER TABLE production_advances ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- ============================================================================
-- 12. TRIGGERS FOR UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS trg_asset_tags_updated_at ON asset_tags;
CREATE TRIGGER trg_asset_tags_updated_at
    BEFORE UPDATE ON asset_tags
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_reminders_updated_at ON reminders;
CREATE TRIGGER trg_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_crew_members_updated_at ON crew_members;
CREATE TRIGGER trg_crew_members_updated_at
    BEFORE UPDATE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_crew_availability_updated_at ON crew_availability;
CREATE TRIGGER trg_crew_availability_updated_at
    BEFORE UPDATE ON crew_availability
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

DROP TRIGGER IF EXISTS trg_crew_assignments_updated_at ON crew_assignments;
CREATE TRIGGER trg_crew_assignments_updated_at
    BEFORE UPDATE ON crew_assignments
    FOR EACH ROW EXECUTE FUNCTION update_advancing_updated_at();

-- ============================================================================
-- 13. FUNCTION: CREATE ACTIVITY EVENT
-- ============================================================================
CREATE OR REPLACE FUNCTION create_activity_event(
    p_org_id UUID,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_action VARCHAR,
    p_actor_id UUID,
    p_field_changes JSONB DEFAULT '[]',
    p_old_values JSONB DEFAULT '{}',
    p_new_values JSONB DEFAULT '{}',
    p_event_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
    v_actor_name VARCHAR;
BEGIN
    SELECT full_name INTO v_actor_name FROM users WHERE id = p_actor_id;
    
    INSERT INTO activity_events (
        organization_id, entity_type, entity_id, action, 
        actor_id, actor_name, field_changes, old_values, new_values,
        event_id, metadata
    ) VALUES (
        p_org_id, p_entity_type, p_entity_id, p_action,
        p_actor_id, v_actor_name, p_field_changes, p_old_values, p_new_values,
        p_event_id, p_metadata
    ) RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 14. FUNCTION: DETECT ITEM CONFLICTS
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_advance_item_conflicts(p_item_id UUID)
RETURNS TABLE (
    conflict_id UUID,
    conflict_type VARCHAR,
    severity VARCHAR,
    description TEXT,
    conflicting_item_id UUID
) AS $$
DECLARE
    v_item RECORD;
    v_org_id UUID;
BEGIN
    -- Get the item details
    SELECT ai.*, pa.event_id, pa.organization_id
    INTO v_item
    FROM advance_items ai
    JOIN production_advances pa ON pa.id = ai.production_advance_id
    WHERE ai.id = p_item_id;
    
    IF v_item IS NULL THEN
        RETURN;
    END IF;
    
    v_org_id := v_item.organization_id;
    
    -- Check for overlapping bookings of the same catalog item
    IF v_item.catalog_item_id IS NOT NULL AND v_item.scheduled_delivery IS NOT NULL THEN
        FOR conflict_id, conflict_type, severity, description, conflicting_item_id IN
            SELECT 
                uuid_generate_v4(),
                'double_booking'::VARCHAR,
                'blocking'::VARCHAR,
                format('Item "%s" is already scheduled for another event during this time', v_item.item_name),
                ai2.id
            FROM advance_items ai2
            JOIN production_advances pa2 ON pa2.id = ai2.production_advance_id
            WHERE ai2.catalog_item_id = v_item.catalog_item_id
              AND ai2.id != p_item_id
              AND ai2.status NOT IN ('cancelled', 'returned', 'complete')
              AND pa2.event_id != v_item.event_id
              AND ai2.scheduled_delivery IS NOT NULL
              AND (
                  -- Check for time overlap with buffer
                  (v_item.scheduled_delivery - (COALESCE(v_item.buffer_hours_before, 0) || ' hours')::INTERVAL)
                  < (ai2.scheduled_delivery + (COALESCE(ai2.buffer_hours_after, 0) || ' hours')::INTERVAL)
                  AND
                  (v_item.scheduled_delivery + (COALESCE(v_item.buffer_hours_after, 0) || ' hours')::INTERVAL)
                  > (ai2.scheduled_delivery - (COALESCE(ai2.buffer_hours_before, 0) || ' hours')::INTERVAL)
              )
        LOOP
            RETURN NEXT;
        END LOOP;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 15. VIEW: ITEM AVAILABILITY TIMELINE
-- ============================================================================
CREATE OR REPLACE VIEW advance_item_availability AS
SELECT 
    ai.id AS item_id,
    ai.item_name,
    ai.catalog_item_id,
    aci.name AS catalog_item_name,
    ai.scheduled_delivery,
    ai.actual_delivery,
    ai.status,
    ai.buffer_hours_before,
    ai.buffer_hours_after,
    pa.id AS advance_id,
    pa.advance_code,
    pa.event_id,
    e.name AS event_name,
    e.start_date AS event_start,
    e.end_date AS event_end,
    ai.organization_id,
    CASE 
        WHEN ai.status IN ('complete', 'returned', 'cancelled') THEN 'available'
        WHEN ai.status IN ('delivered', 'installed', 'tested', 'struck') THEN 'deployed'
        WHEN ai.status IN ('in_transit', 'shipped') THEN 'in_transit'
        WHEN ai.status IN ('confirmed', 'ordered') THEN 'reserved'
        ELSE 'pending'
    END AS availability_status
FROM advance_items ai
JOIN production_advances pa ON pa.id = ai.production_advance_id
JOIN events e ON e.id = pa.event_id
LEFT JOIN advancing_catalog_items aci ON aci.id = ai.catalog_item_id
WHERE pa.deleted_at IS NULL;

-- ============================================================================
-- 16. VIEW: CREW SCHEDULE OVERVIEW
-- ============================================================================
CREATE OR REPLACE VIEW crew_schedule_overview AS
SELECT 
    ca.id AS assignment_id,
    ca.crew_member_id,
    cm.full_name AS crew_name,
    cm.skills,
    ca.event_id,
    e.name AS event_name,
    ca.role,
    ca.department,
    ca.shift_start,
    ca.shift_end,
    ca.status,
    ca.rate_type,
    ca.rate_amount,
    ca.estimated_hours,
    ca.actual_start,
    ca.actual_end,
    ca.organization_id,
    EXTRACT(EPOCH FROM (ca.shift_end - ca.shift_start)) / 3600 AS scheduled_hours
FROM crew_assignments ca
JOIN crew_members cm ON cm.id = ca.crew_member_id
LEFT JOIN events e ON e.id = ca.event_id
WHERE ca.status != 'cancelled';
