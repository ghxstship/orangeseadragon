-- Real-Time Collaboration Layer Migration
-- Creates tables for activity logging, polymorphic comments, and presence tracking

-- ============================================================================
-- ENTITY ACTIVITY LOGS
-- Tracks all changes to production entities for audit trail and activity feeds
-- ============================================================================

CREATE TABLE IF NOT EXISTS entity_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_avatar_url TEXT,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN (
        'created', 'updated', 'deleted', 'status_changed', 'assigned',
        'commented', 'mentioned', 'approved', 'rejected', 'completed',
        'started', 'paused', 'resumed'
    )),
    changes JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_entity_activity_logs_org ON entity_activity_logs(organization_id);
CREATE INDEX idx_entity_activity_logs_entity ON entity_activity_logs(entity_type, entity_id);
CREATE INDEX idx_entity_activity_logs_user ON entity_activity_logs(user_id);
CREATE INDEX idx_entity_activity_logs_created ON entity_activity_logs(created_at DESC);
CREATE INDEX idx_entity_activity_logs_org_created ON entity_activity_logs(organization_id, created_at DESC);

-- Enable RLS
ALTER TABLE entity_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view activity logs in their organization"
    ON entity_activity_logs FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can create activity logs in their organization"
    ON entity_activity_logs FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE entity_activity_logs;

-- ============================================================================
-- ENTITY COMMENTS
-- Polymorphic comments that can be attached to any entity
-- ============================================================================

CREATE TABLE IF NOT EXISTS entity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    parent_id UUID REFERENCES entity_comments(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar_url TEXT,
    content TEXT NOT NULL,
    mentions TEXT[] DEFAULT '{}',
    attachments JSONB,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entity_comments_org ON entity_comments(organization_id);
CREATE INDEX idx_entity_comments_entity ON entity_comments(entity_type, entity_id);
CREATE INDEX idx_entity_comments_parent ON entity_comments(parent_id);
CREATE INDEX idx_entity_comments_author ON entity_comments(author_id);
CREATE INDEX idx_entity_comments_created ON entity_comments(created_at);

-- Enable RLS
ALTER TABLE entity_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view comments in their organization"
    ON entity_comments FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can create comments in their organization"
    ON entity_comments FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        AND author_id = auth.uid()
    );

CREATE POLICY "Users can update their own comments"
    ON entity_comments FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
    ON entity_comments FOR DELETE
    USING (author_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE entity_comments;

-- ============================================================================
-- COMMENT MENTIONS (Junction table for efficient mention queries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS comment_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES entity_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_mentions_user ON comment_mentions(user_id);
CREATE INDEX idx_comment_mentions_comment ON comment_mentions(comment_id);

-- Enable RLS
ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mentions in their organization"
    ON comment_mentions FOR SELECT
    USING (
        comment_id IN (
            SELECT id FROM entity_comments WHERE organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- ============================================================================
-- RUNSHEET TABLES (for Show Calling feature)
-- ============================================================================

-- Runsheets table (if not exists - may already be defined)
CREATE TABLE IF NOT EXISTS runsheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES stages(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    date DATE,
    scheduled_start TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'rehearsal', 'live', 'completed', 'cancelled')),
    version INTEGER DEFAULT 1,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Runsheet Items (cues, segments, breaks)
CREATE TABLE IF NOT EXISTS runsheet_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runsheet_id UUID NOT NULL REFERENCES runsheets(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES runsheet_items(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('segment', 'cue', 'break', 'changeover', 'note')),
    name TEXT NOT NULL,
    description TEXT,
    duration_planned INTERVAL,
    duration_actual INTERVAL,
    start_time_planned TIME,
    start_time_actual TIME,
    end_time_planned TIME,
    end_time_actual TIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'standby', 'go', 'running', 'complete', 'skipped')),
    color TEXT,
    icon TEXT,
    assigned_to UUID[] DEFAULT '{}',
    notes TEXT,
    cue_number TEXT,
    technical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_runsheet_items_runsheet ON runsheet_items(runsheet_id);
CREATE INDEX idx_runsheet_items_order ON runsheet_items(runsheet_id, item_order);
CREATE INDEX idx_runsheet_items_status ON runsheet_items(status);

-- Enable RLS
ALTER TABLE runsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE runsheet_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view runsheets in their organization"
    ON runsheets FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage runsheets in their organization"
    ON runsheets FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can view runsheet items in their organization"
    ON runsheet_items FOR SELECT
    USING (
        runsheet_id IN (
            SELECT id FROM runsheets WHERE organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can manage runsheet items in their organization"
    ON runsheet_items FOR ALL
    USING (
        runsheet_id IN (
            SELECT id FROM runsheets WHERE organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Enable realtime for runsheets
ALTER PUBLICATION supabase_realtime ADD TABLE runsheets;
ALTER PUBLICATION supabase_realtime ADD TABLE runsheet_items;

-- ============================================================================
-- SHOW CALL LOG (for live show calling history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS show_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runsheet_id UUID NOT NULL REFERENCES runsheets(id) ON DELETE CASCADE,
    runsheet_item_id UUID REFERENCES runsheet_items(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('go', 'standby', 'skip', 'pause', 'resume', 'reset', 'note')),
    called_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    called_by_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    metadata JSONB
);

CREATE INDEX idx_show_call_logs_runsheet ON show_call_logs(runsheet_id);
CREATE INDEX idx_show_call_logs_timestamp ON show_call_logs(timestamp);

-- Enable RLS
ALTER TABLE show_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view show call logs in their organization"
    ON show_call_logs FOR SELECT
    USING (
        runsheet_id IN (
            SELECT id FROM runsheets WHERE organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can create show call logs"
    ON show_call_logs FOR INSERT
    WITH CHECK (
        runsheet_id IN (
            SELECT id FROM runsheets WHERE organization_id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE show_call_logs;

-- ============================================================================
-- EVENT TEMPLATES (for cloning)
-- ============================================================================

-- Add template fields to events table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'is_template') THEN
        ALTER TABLE events ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'template_id') THEN
        ALTER TABLE events ADD COLUMN template_id UUID REFERENCES events(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'template_name') THEN
        ALTER TABLE events ADD COLUMN template_name TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_template ON events(is_template) WHERE is_template = TRUE;

-- ============================================================================
-- NOTIFICATION RULES (for expiration alerts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    entity_type TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('expiration', 'status_change', 'assignment', 'due_date', 'custom')),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    notification_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_rules_org ON notification_rules(organization_id);
CREATE INDEX idx_notification_rules_entity ON notification_rules(entity_type);
CREATE INDEX idx_notification_rules_active ON notification_rules(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notification rules in their organization"
    ON notification_rules FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins can manage notification rules"
    ON notification_rules FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN roles r ON om.role_id = r.id
            WHERE om.user_id = auth.uid() 
            AND om.status = 'active'
            AND r.slug IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically log activity on entity changes
CREATE OR REPLACE FUNCTION log_entity_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_user_name TEXT;
    v_action TEXT;
    v_entity_name TEXT;
    v_changes JSONB;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Get user name
    SELECT full_name INTO v_user_name FROM users WHERE id = v_user_id;
    
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        v_entity_name := COALESCE(NEW.name, NEW.title, NEW.id::TEXT);
        v_changes := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'updated';
        v_entity_name := COALESCE(NEW.name, NEW.title, NEW.id::TEXT);
        -- Calculate changes
        v_changes := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'deleted';
        v_entity_name := COALESCE(OLD.name, OLD.title, OLD.id::TEXT);
        v_changes := to_jsonb(OLD);
    END IF;
    
    -- Insert activity log (only if user is authenticated)
    IF v_user_id IS NOT NULL THEN
        INSERT INTO entity_activity_logs (
            organization_id,
            user_id,
            user_name,
            entity_type,
            entity_id,
            entity_name,
            action,
            changes
        ) VALUES (
            COALESCE(NEW.organization_id, OLD.organization_id),
            v_user_id,
            COALESCE(v_user_name, 'System'),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            v_entity_name,
            v_action,
            v_changes
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging triggers to production entities
DO $$
DECLARE
    tables TEXT[] := ARRAY['events', 'runsheets', 'work_orders', 'inspections', 'punch_items', 
                           'permits', 'catering_orders', 'guest_lists', 'riders', 'stages',
                           'hospitality_requests', 'tech_specs'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Check if table exists before creating trigger
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            EXECUTE format('
                DROP TRIGGER IF EXISTS log_%s_activity ON %s;
                CREATE TRIGGER log_%s_activity
                AFTER INSERT OR UPDATE OR DELETE ON %s
                FOR EACH ROW EXECUTE FUNCTION log_entity_activity();
            ', t, t, t, t);
        END IF;
    END LOOP;
END $$;

-- Function to check for expiring items and create notifications
CREATE OR REPLACE FUNCTION check_expiring_items()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Check permits expiring in next 30 days
    FOR r IN 
        SELECT p.id, p.name, p.organization_id, p.expiration_date,
               EXTRACT(DAY FROM p.expiration_date - NOW()) as days_until_expiry
        FROM permits p
        WHERE p.status = 'approved'
        AND p.expiration_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.data->>'permit_id' = p.id::TEXT
            AND n.created_at > NOW() - INTERVAL '7 days'
        )
    LOOP
        -- Create notification for organization admins
        INSERT INTO notifications (type, title, message, user_id, data, action_url)
        SELECT 
            'warning',
            'Permit Expiring Soon',
            format('Permit "%s" expires in %s days', r.name, r.days_until_expiry::INTEGER),
            om.user_id,
            jsonb_build_object('permit_id', r.id, 'expiration_date', r.expiration_date),
            format('/productions/compliance/%s', r.id)
        FROM organization_members om
        JOIN roles rl ON om.role_id = rl.id
        WHERE om.organization_id = r.organization_id
        AND om.status = 'active'
        AND rl.slug IN ('owner', 'admin', 'manager');
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the expiration check (requires pg_cron extension)
-- SELECT cron.schedule('check-expiring-items', '0 9 * * *', 'SELECT check_expiring_items()');

COMMENT ON TABLE entity_activity_logs IS 'Audit trail for all entity changes in the Productions module';
COMMENT ON TABLE entity_comments IS 'Polymorphic comments that can be attached to any entity';
COMMENT ON TABLE runsheet_items IS 'Individual items (cues, segments) within a runsheet for show calling';
COMMENT ON TABLE show_call_logs IS 'History of show calling actions during live events';
COMMENT ON TABLE notification_rules IS 'Configurable rules for automated notifications';
