-- Migration: Production Advancing SSOT Triggers
-- Phase 2: Trigger-based synchronization to SSOT tables
-- See: docs/PRODUCTION_ADVANCING_INTEGRATION_PLAN.md

-- ============================================================================
-- CALENDAR EVENTS SYNC
-- Sync advance item milestones to calendar_events SSOT
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_advance_item_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
    v_event_name TEXT;
    v_event_id UUID;
BEGIN
    -- Get event info from production advance
    SELECT e.name, e.id INTO v_event_name, v_event_id
    FROM production_advances pa
    JOIN events e ON e.id = pa.event_id
    WHERE pa.id = NEW.production_advance_id;

    -- Sync scheduled delivery to calendar
    IF NEW.scheduled_delivery IS NOT NULL THEN
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
            metadata,
            created_at,
            updated_at
        ) VALUES (
            NEW.organization_id,
            'advance_item',
            NEW.id,
            'Delivery: ' || NEW.item_name,
            COALESCE(NEW.description, '') || ' - ' || COALESCE(v_event_name, ''),
            NEW.scheduled_delivery,
            NEW.scheduled_delivery + INTERVAL '1 hour',
            FALSE,
            '#f97316',  -- orange
            jsonb_build_object(
                'advance_item_id', NEW.id,
                'event_id', v_event_id,
                'milestone_type', 'delivery',
                'vendor_id', NEW.vendor_id,
                'is_critical_path', NEW.is_critical_path
            ),
            NOW(),
            NOW()
        )
        ON CONFLICT (entity_type, entity_id) 
        WHERE entity_type = 'advance_item'
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            color = EXCLUDED.color,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
    END IF;

    -- Sync load-in time to calendar (separate entry)
    IF NEW.load_in_time IS NOT NULL THEN
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
            metadata,
            created_at,
            updated_at
        ) VALUES (
            NEW.organization_id,
            'advance_item_load_in',
            NEW.id,
            'Load-In: ' || NEW.item_name,
            'Load-in at ' || COALESCE(NEW.location, 'TBD') || ' - ' || COALESCE(v_event_name, ''),
            NEW.load_in_time,
            NEW.load_in_time + INTERVAL '2 hours',
            FALSE,
            '#8b5cf6',  -- purple
            jsonb_build_object(
                'advance_item_id', NEW.id,
                'event_id', v_event_id,
                'milestone_type', 'load_in',
                'location', NEW.location,
                'is_critical_path', NEW.is_critical_path
            ),
            NOW(),
            NOW()
        )
        ON CONFLICT (entity_type, entity_id) 
        WHERE entity_type = 'advance_item_load_in'
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
    END IF;

    -- Sync strike time to calendar (separate entry)
    IF NEW.strike_time IS NOT NULL THEN
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
            metadata,
            created_at,
            updated_at
        ) VALUES (
            NEW.organization_id,
            'advance_item_strike',
            NEW.id,
            'Strike: ' || NEW.item_name,
            'Strike at ' || COALESCE(NEW.location, 'TBD') || ' - ' || COALESCE(v_event_name, ''),
            NEW.strike_time,
            NEW.strike_time + INTERVAL '2 hours',
            FALSE,
            '#ef4444',  -- red
            jsonb_build_object(
                'advance_item_id', NEW.id,
                'event_id', v_event_id,
                'milestone_type', 'strike',
                'location', NEW.location
            ),
            NOW(),
            NOW()
        )
        ON CONFLICT (entity_type, entity_id) 
        WHERE entity_type = 'advance_item_strike'
        DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_advance_item_calendar_sync
    AFTER INSERT OR UPDATE OF scheduled_delivery, load_in_time, strike_time, item_name, location
    ON advance_items
    FOR EACH ROW
    EXECUTE FUNCTION sync_advance_item_to_calendar();

-- Delete calendar events when advance item is deleted
CREATE OR REPLACE FUNCTION delete_advance_item_calendar_events()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM calendar_events 
    WHERE entity_id = OLD.id 
    AND entity_type IN ('advance_item', 'advance_item_load_in', 'advance_item_strike');
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_advance_item_calendar_delete
    BEFORE DELETE ON advance_items
    FOR EACH ROW
    EXECUTE FUNCTION delete_advance_item_calendar_events();

-- ============================================================================
-- ACTIVITY FEED SYNC
-- Sync advance item status changes to activity_feed SSOT
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_advance_item_to_activity_feed()
RETURNS TRIGGER AS $$
DECLARE
    v_activity_type TEXT;
    v_title TEXT;
    v_content TEXT;
    v_event_id UUID;
BEGIN
    -- Get event_id from production advance
    SELECT pa.event_id INTO v_event_id
    FROM production_advances pa
    WHERE pa.id = NEW.production_advance_id;

    -- Determine activity type and content based on operation
    IF TG_OP = 'INSERT' THEN
        v_activity_type := 'advance_item_created';
        v_title := 'Advance item created: ' || NEW.item_name;
        v_content := 'New advance item added';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            v_activity_type := 'advance_item_status_changed';
            v_title := 'Status changed: ' || NEW.item_name;
            v_content := 'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status;
        ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
            v_activity_type := 'advance_item_assigned';
            v_title := 'Assignment changed: ' || NEW.item_name;
            v_content := 'Item reassigned';
        ELSE
            -- Skip if no significant change
            RETURN NEW;
        END IF;
    END IF;

    -- Insert into activity_feed
    INSERT INTO activity_feed (
        organization_id,
        activity_type,
        entity_type,
        entity_id,
        title,
        content,
        actor_id,
        event_id,
        metadata,
        created_at
    ) VALUES (
        NEW.organization_id,
        v_activity_type,
        'advance_item',
        NEW.id,
        v_title,
        v_content,
        COALESCE(NEW.assigned_to, NEW.created_by),
        v_event_id,
        jsonb_build_object(
            'item_name', NEW.item_name,
            'status', NEW.status,
            'category_id', NEW.category_id,
            'vendor_id', NEW.vendor_id,
            'is_critical_path', NEW.is_critical_path,
            'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_advance_item_activity_feed
    AFTER INSERT OR UPDATE OF status, assigned_to
    ON advance_items
    FOR EACH ROW
    EXECUTE FUNCTION sync_advance_item_to_activity_feed();

-- ============================================================================
-- FULFILLMENT STAGE ACTIVITY SYNC
-- Sync fulfillment stage changes to activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_fulfillment_to_activity_feed()
RETURNS TRIGGER AS $$
DECLARE
    v_item_name TEXT;
    v_event_id UUID;
    v_org_id UUID;
BEGIN
    -- Get item and event info
    SELECT ai.item_name, ai.organization_id, pa.event_id 
    INTO v_item_name, v_org_id, v_event_id
    FROM advance_items ai
    JOIN production_advances pa ON pa.id = ai.production_advance_id
    WHERE ai.id = NEW.advance_item_id;

    INSERT INTO activity_feed (
        organization_id,
        activity_type,
        entity_type,
        entity_id,
        title,
        content,
        actor_id,
        event_id,
        metadata,
        created_at
    ) VALUES (
        v_org_id,
        'fulfillment_stage_entered',
        'advance_item_fulfillment',
        NEW.id,
        'Fulfillment: ' || v_item_name || ' - ' || NEW.fulfillment_stage,
        'Item entered ' || NEW.fulfillment_stage || ' stage',
        NEW.assigned_to,
        v_event_id,
        jsonb_build_object(
            'advance_item_id', NEW.advance_item_id,
            'stage', NEW.fulfillment_stage,
            'percentage_complete', NEW.percentage_complete,
            'expected_completion', NEW.expected_completion
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fulfillment_activity_feed
    AFTER INSERT ON advance_item_fulfillment
    FOR EACH ROW
    EXECUTE FUNCTION sync_fulfillment_to_activity_feed();

-- ============================================================================
-- PRODUCTION ADVANCE STATUS SYNC
-- Sync production advance status changes to activity_feed
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_production_advance_to_activity_feed()
RETURNS TRIGGER AS $$
DECLARE
    v_activity_type TEXT;
    v_title TEXT;
    v_content TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_activity_type := 'production_advance_created';
        v_title := 'Production advance created: ' || NEW.advance_code;
        v_content := 'New ' || NEW.advance_type || ' advance created';
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        v_activity_type := 'production_advance_status_changed';
        v_title := 'Advance status changed: ' || NEW.advance_code;
        v_content := 'Status changed from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status;
    ELSE
        RETURN NEW;
    END IF;

    INSERT INTO activity_feed (
        organization_id,
        activity_type,
        entity_type,
        entity_id,
        title,
        content,
        actor_id,
        event_id,
        metadata,
        created_at
    ) VALUES (
        NEW.organization_id,
        v_activity_type,
        'production_advance',
        NEW.id,
        v_title,
        v_content,
        COALESCE(NEW.assigned_to, NEW.created_by),
        NEW.event_id,
        jsonb_build_object(
            'advance_code', NEW.advance_code,
            'advance_type', NEW.advance_type,
            'status', NEW.status,
            'priority', NEW.priority,
            'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_production_advance_activity_feed
    AFTER INSERT OR UPDATE OF status
    ON production_advances
    FOR EACH ROW
    EXECUTE FUNCTION sync_production_advance_to_activity_feed();

-- ============================================================================
-- VENDOR RATING AGGREGATION
-- Update vendor metadata with performance metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION update_vendor_performance_metadata()
RETURNS TRIGGER AS $$
DECLARE
    v_avg_rating DECIMAL(3,2);
    v_total_ratings INTEGER;
    v_on_time_pct DECIMAL(5,2);
BEGIN
    -- Calculate aggregate metrics
    SELECT 
        AVG(overall_rating)::DECIMAL(3,2),
        COUNT(*),
        (COUNT(*) FILTER (WHERE on_time_delivery = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL(5,2)
    INTO v_avg_rating, v_total_ratings, v_on_time_pct
    FROM vendor_ratings
    WHERE vendor_id = NEW.vendor_id;

    -- Update company metadata with performance metrics
    UPDATE companies
    SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'vendor_performance', jsonb_build_object(
            'avg_rating', v_avg_rating,
            'total_ratings', v_total_ratings,
            'on_time_delivery_pct', v_on_time_pct,
            'last_rated_at', NOW()
        )
    )
    WHERE id = NEW.vendor_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendor_rating_aggregation
    AFTER INSERT ON vendor_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_performance_metadata();

-- ============================================================================
-- AUTO-UPDATE ADVANCE ITEM STATUS FROM FULFILLMENT
-- When fulfillment reaches certain stages, update item status
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_update_item_status_from_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    -- Map fulfillment stages to item statuses
    UPDATE advance_items
    SET status = CASE NEW.fulfillment_stage
        WHEN 'confirmed' THEN 'confirmed'
        WHEN 'shipped' THEN 'in_transit'
        WHEN 'in_transit' THEN 'in_transit'
        WHEN 'delivered' THEN 'delivered'
        WHEN 'installed' THEN 'installed'
        WHEN 'tested' THEN 'tested'
        WHEN 'complete' THEN 'complete'
        WHEN 'struck' THEN 'struck'
        WHEN 'returned' THEN 'returned'
        ELSE status  -- Keep current status for other stages
    END,
    updated_at = NOW()
    WHERE id = NEW.advance_item_id
    AND status != CASE NEW.fulfillment_stage
        WHEN 'confirmed' THEN 'confirmed'
        WHEN 'shipped' THEN 'in_transit'
        WHEN 'in_transit' THEN 'in_transit'
        WHEN 'delivered' THEN 'delivered'
        WHEN 'installed' THEN 'installed'
        WHEN 'tested' THEN 'tested'
        WHEN 'complete' THEN 'complete'
        WHEN 'struck' THEN 'struck'
        WHEN 'returned' THEN 'returned'
        ELSE status
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fulfillment_auto_status
    AFTER INSERT ON advance_item_fulfillment
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_item_status_from_fulfillment();
