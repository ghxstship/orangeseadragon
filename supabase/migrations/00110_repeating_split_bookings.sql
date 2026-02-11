-- ============================================================================
-- MIGRATION 00110: Repeating Bookings + Split Bookings (Resource Planner)
-- ============================================================================
-- Addresses gaps:
--   - No recurring booking pattern (manual re-creation for regular schedules)
--   - No booking splitting (cannot divide allocation across time)
-- ============================================================================

-- Add recurrence fields to resource_bookings
ALTER TABLE resource_bookings
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
    ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
    ADD COLUMN IF NOT EXISTS recurrence_days_of_week INT[], -- 0=Sun, 1=Mon, ..., 6=Sat
    ADD COLUMN IF NOT EXISTS recurrence_interval INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS parent_booking_id UUID REFERENCES resource_bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_split BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS split_from_id UUID REFERENCES resource_bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS split_percentage NUMERIC(5,2);

-- Index for recurring booking lookups
CREATE INDEX IF NOT EXISTS idx_resource_bookings_parent ON resource_bookings(parent_booking_id) WHERE parent_booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resource_bookings_split ON resource_bookings(split_from_id) WHERE split_from_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resource_bookings_recurring ON resource_bookings(is_recurring) WHERE is_recurring = true;

-- Function: Expand a recurring booking into individual instances
CREATE OR REPLACE FUNCTION expand_recurring_booking(p_booking_id UUID)
RETURNS INT AS $$
DECLARE
    v_booking RECORD;
    v_current_date DATE;
    v_end_date DATE;
    v_duration INTERVAL;
    v_count INT := 0;
    v_dow INT;
BEGIN
    SELECT * INTO v_booking FROM resource_bookings WHERE id = p_booking_id;
    IF NOT FOUND OR NOT v_booking.is_recurring THEN RETURN 0; END IF;

    v_duration := v_booking.end_date::DATE - v_booking.start_date::DATE;
    v_end_date := COALESCE(v_booking.recurrence_end_date, (v_booking.start_date::DATE + INTERVAL '3 months')::DATE);

    -- Start from the next occurrence
    v_current_date := CASE v_booking.recurrence_pattern
        WHEN 'daily' THEN v_booking.start_date::DATE + (v_booking.recurrence_interval || ' days')::INTERVAL
        WHEN 'weekly' THEN v_booking.start_date::DATE + (v_booking.recurrence_interval * 7 || ' days')::INTERVAL
        WHEN 'biweekly' THEN v_booking.start_date::DATE + INTERVAL '14 days'
        WHEN 'monthly' THEN (v_booking.start_date::DATE + (v_booking.recurrence_interval || ' months')::INTERVAL)::DATE
        ELSE v_booking.start_date::DATE + INTERVAL '7 days'
    END;

    WHILE v_current_date <= v_end_date AND v_count < 52 LOOP
        -- For weekly with specific days, check day of week
        IF v_booking.recurrence_days_of_week IS NOT NULL THEN
            v_dow := EXTRACT(DOW FROM v_current_date)::INT;
            IF NOT (v_dow = ANY(v_booking.recurrence_days_of_week)) THEN
                v_current_date := v_current_date + INTERVAL '1 day';
                CONTINUE;
            END IF;
        END IF;

        INSERT INTO resource_bookings (
            organization_id, user_id, project_id, deal_id, budget_id,
            start_date, end_date, hours_per_day, booking_type, status,
            notes, parent_booking_id
        ) VALUES (
            v_booking.organization_id, v_booking.user_id, v_booking.project_id,
            v_booking.deal_id, v_booking.budget_id,
            v_current_date, (v_current_date + v_duration)::DATE,
            v_booking.hours_per_day, v_booking.booking_type, v_booking.status,
            v_booking.notes, p_booking_id
        );

        v_count := v_count + 1;

        v_current_date := CASE v_booking.recurrence_pattern
            WHEN 'daily' THEN v_current_date + (v_booking.recurrence_interval || ' days')::INTERVAL
            WHEN 'weekly' THEN v_current_date + (v_booking.recurrence_interval * 7 || ' days')::INTERVAL
            WHEN 'biweekly' THEN v_current_date + INTERVAL '14 days'
            WHEN 'monthly' THEN (v_current_date + (v_booking.recurrence_interval || ' months')::INTERVAL)::DATE
            ELSE v_current_date + INTERVAL '7 days'
        END;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Split a booking into two parts at a given date
CREATE OR REPLACE FUNCTION split_booking(
    p_booking_id UUID,
    p_split_date DATE,
    p_first_percentage NUMERIC DEFAULT 50.0
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_second_id UUID;
BEGIN
    SELECT * INTO v_booking FROM resource_bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;

    IF p_split_date <= v_booking.start_date::DATE OR p_split_date >= v_booking.end_date::DATE THEN
        RAISE EXCEPTION 'Split date must be between booking start and end dates';
    END IF;

    -- Update original booking to end at split date
    UPDATE resource_bookings
    SET end_date = (p_split_date - INTERVAL '1 day')::DATE,
        is_split = true,
        split_percentage = p_first_percentage,
        updated_at = now()
    WHERE id = p_booking_id;

    -- Create second half
    INSERT INTO resource_bookings (
        organization_id, user_id, project_id, deal_id, budget_id,
        start_date, end_date, hours_per_day, booking_type, status,
        notes, is_split, split_from_id, split_percentage
    ) VALUES (
        v_booking.organization_id, v_booking.user_id, v_booking.project_id,
        v_booking.deal_id, v_booking.budget_id,
        p_split_date, v_booking.end_date,
        v_booking.hours_per_day, v_booking.booking_type, v_booking.status,
        v_booking.notes, true, p_booking_id, 100.0 - p_first_percentage
    ) RETURNING id INTO v_second_id;

    RETURN jsonb_build_object(
        'success', true,
        'first_booking_id', p_booking_id,
        'second_booking_id', v_second_id,
        'split_date', p_split_date
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
