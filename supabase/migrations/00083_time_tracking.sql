-- ============================================================================
-- Migration: Time Tracking with Geofencing
-- Description: Add mobile clock in/out, geofencing, and time punch management
-- ============================================================================

-- Create venue geofences table
CREATE TABLE IF NOT EXISTS venue_geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255),
  center_latitude DECIMAL(10,8) NOT NULL,
  center_longitude DECIMAL(11,8) NOT NULL,
  radius_meters INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create time punches table
CREATE TABLE IF NOT EXISTS time_punches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  shift_id UUID REFERENCES shifts(id),
  punch_type VARCHAR(20) NOT NULL, -- 'clock_in', 'clock_out', 'break_start', 'break_end'
  punch_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  accuracy_meters DECIMAL(10,2),
  altitude_meters DECIMAL(10,2),
  venue_id UUID REFERENCES venues(id),
  geofence_id UUID REFERENCES venue_geofences(id),
  is_within_geofence BOOLEAN,
  distance_from_geofence_meters DECIMAL(10,2),
  photo_url TEXT,
  device_id TEXT,
  device_type VARCHAR(50), -- 'ios', 'android', 'web'
  ip_address INET,
  user_agent TEXT,
  notes TEXT,
  is_manual_entry BOOLEAN DEFAULT FALSE,
  manual_entry_reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
  flagged_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time punch pairs view for calculating hours
-- Extend existing time_entries table (originally from 00029_payroll_resources_time.sql)
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS employee_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS shift_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_in_punch_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_out_punch_id UUID;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_in_time TIMESTAMPTZ;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS clock_out_time TIMESTAMPTZ;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS break_minutes INTEGER DEFAULT 0;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS total_minutes INTEGER;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS regular_minutes INTEGER;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS double_time_minutes INTEGER;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS regular_pay DECIMAL(10,2);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS overtime_pay DECIMAL(10,2);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS total_pay DECIMAL(10,2);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create break tracking table
CREATE TABLE IF NOT EXISTS break_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  break_start_punch_id UUID REFERENCES time_punches(id),
  break_end_punch_id UUID REFERENCES time_punches(id),
  break_start_time TIMESTAMPTZ NOT NULL,
  break_end_time TIMESTAMPTZ,
  break_type VARCHAR(50) DEFAULT 'unpaid', -- 'paid', 'unpaid', 'meal'
  duration_minutes INTEGER,
  is_compliant BOOLEAN DEFAULT TRUE,
  compliance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create overtime rules table
CREATE TABLE IF NOT EXISTS overtime_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  daily_regular_hours DECIMAL(4,2) DEFAULT 8,
  daily_overtime_hours DECIMAL(4,2) DEFAULT 4, -- hours before double time
  weekly_regular_hours DECIMAL(5,2) DEFAULT 40,
  overtime_multiplier DECIMAL(3,2) DEFAULT 1.5,
  double_time_multiplier DECIMAL(3,2) DEFAULT 2.0,
  seventh_day_overtime BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_venue_geofences_venue ON venue_geofences(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_geofences_active ON venue_geofences(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_time_punches_employee ON time_punches(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_punches_event ON time_punches(event_id);
CREATE INDEX IF NOT EXISTS idx_time_punches_time ON time_punches(punch_time);
CREATE INDEX IF NOT EXISTS idx_time_punches_type ON time_punches(punch_type);
CREATE INDEX IF NOT EXISTS idx_time_punches_status ON time_punches(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_event ON time_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_dates ON time_entries(clock_in_time, clock_out_time);
CREATE INDEX IF NOT EXISTS idx_break_records_entry ON break_records(time_entry_id);

-- RLS policies
ALTER TABLE venue_geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view geofences for their tenant" ON venue_geofences;
CREATE POLICY "Users can view geofences for their tenant"
  ON venue_geofences FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Managers can manage geofences" ON venue_geofences;
CREATE POLICY "Managers can manage geofences"
  ON venue_geofences FOR ALL
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own time punches" ON time_punches;
CREATE POLICY "Users can view their own time punches"
  ON time_punches FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create their own time punches" ON time_punches;
CREATE POLICY "Users can create their own time punches"
  ON time_punches FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Managers can update time punches" ON time_punches;
CREATE POLICY "Managers can update time punches"
  ON time_punches FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage time entries" ON time_entries;
CREATE POLICY "System can manage time entries"
  ON time_entries FOR ALL
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view break records" ON break_records;
CREATE POLICY "Users can view break records"
  ON break_records FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view overtime rules" ON overtime_rules;
CREATE POLICY "Users can view overtime rules"
  ON overtime_rules FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Function to check if coordinates are within a geofence
CREATE OR REPLACE FUNCTION is_within_geofence(
  p_latitude DECIMAL(10,8),
  p_longitude DECIMAL(11,8),
  p_geofence_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_geofence RECORD;
  v_distance DECIMAL;
BEGIN
  SELECT * INTO v_geofence FROM venue_geofences WHERE id = p_geofence_id AND is_active = TRUE;
  
  IF v_geofence IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Haversine formula for distance calculation
  v_distance := 6371000 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(p_latitude - v_geofence.center_latitude) / 2), 2) +
    COS(RADIANS(v_geofence.center_latitude)) * COS(RADIANS(p_latitude)) *
    POWER(SIN(RADIANS(p_longitude - v_geofence.center_longitude) / 2), 2)
  ));
  
  RETURN v_distance <= v_geofence.radius_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get distance from nearest geofence
CREATE OR REPLACE FUNCTION get_nearest_geofence(
  p_organization_id UUID,
  p_latitude DECIMAL(10,8),
  p_longitude DECIMAL(11,8)
)
RETURNS TABLE(geofence_id UUID, venue_id UUID, distance_meters DECIMAL, is_within BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vg.id as geofence_id,
    vg.venue_id,
    (6371000 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(p_latitude - vg.center_latitude) / 2), 2) +
      COS(RADIANS(vg.center_latitude)) * COS(RADIANS(p_latitude)) *
      POWER(SIN(RADIANS(p_longitude - vg.center_longitude) / 2), 2)
    )))::DECIMAL as distance_meters,
    (6371000 * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(p_latitude - vg.center_latitude) / 2), 2) +
      COS(RADIANS(vg.center_latitude)) * COS(RADIANS(p_latitude)) *
      POWER(SIN(RADIANS(p_longitude - vg.center_longitude) / 2), 2)
    ))) <= vg.radius_meters as is_within
  FROM venue_geofences vg
  WHERE vg.organization_id = p_organization_id AND vg.is_active = TRUE
  ORDER BY distance_meters ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a clock in punch
CREATE OR REPLACE FUNCTION process_clock_in(
  p_employee_id UUID,
  p_event_id UUID DEFAULT NULL,
  p_shift_id UUID DEFAULT NULL,
  p_latitude DECIMAL(10,8) DEFAULT NULL,
  p_longitude DECIMAL(11,8) DEFAULT NULL,
  p_accuracy_meters DECIMAL(10,2) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_device_type VARCHAR(50) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_organization_id UUID;
  v_punch_id UUID;
  v_entry_id UUID;
  v_geofence RECORD;
  v_existing_entry RECORD;
BEGIN
  -- Get tenant ID from employee
  SELECT organization_id INTO v_organization_id FROM employee_profiles WHERE id = p_employee_id;
  
  -- Check for existing active time entry (already clocked in)
  SELECT * INTO v_existing_entry 
  FROM time_entries 
  WHERE employee_id = p_employee_id 
    AND clock_out_time IS NULL 
    AND status = 'active'
  ORDER BY clock_in_time DESC 
  LIMIT 1;
  
  IF v_existing_entry IS NOT NULL THEN
    RAISE EXCEPTION 'Already clocked in. Please clock out first.';
  END IF;
  
  -- Find nearest geofence if coordinates provided
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    SELECT * INTO v_geofence FROM get_nearest_geofence(v_organization_id, p_latitude, p_longitude);
  END IF;
  
  -- Create time punch
  INSERT INTO time_punches (
    organization_id, employee_id, event_id, shift_id, punch_type, punch_time,
    latitude, longitude, accuracy_meters, venue_id, geofence_id,
    is_within_geofence, distance_from_geofence_meters,
    photo_url, device_id, device_type, notes, status
  )
  VALUES (
    v_organization_id, p_employee_id, p_event_id, p_shift_id, 'clock_in', NOW(),
    p_latitude, p_longitude, p_accuracy_meters, 
    v_geofence.venue_id, v_geofence.geofence_id,
    v_geofence.is_within, v_geofence.distance_meters,
    p_photo_url, p_device_id, p_device_type, p_notes,
    CASE WHEN v_geofence.is_within = FALSE THEN 'flagged' ELSE 'approved' END
  )
  RETURNING id INTO v_punch_id;
  
  -- Create time entry
  INSERT INTO time_entries (
    organization_id, employee_id, event_id, shift_id,
    clock_in_punch_id, clock_in_time, status
  )
  VALUES (
    v_organization_id, p_employee_id, p_event_id, p_shift_id,
    v_punch_id, NOW(), 'active'
  )
  RETURNING id INTO v_entry_id;
  
  RETURN v_punch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a clock out punch
CREATE OR REPLACE FUNCTION process_clock_out(
  p_employee_id UUID,
  p_latitude DECIMAL(10,8) DEFAULT NULL,
  p_longitude DECIMAL(11,8) DEFAULT NULL,
  p_accuracy_meters DECIMAL(10,2) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_device_type VARCHAR(50) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_organization_id UUID;
  v_punch_id UUID;
  v_entry RECORD;
  v_geofence RECORD;
  v_total_minutes INTEGER;
  v_break_minutes INTEGER;
BEGIN
  -- Get tenant ID from employee
  SELECT organization_id INTO v_organization_id FROM employee_profiles WHERE id = p_employee_id;
  
  -- Find active time entry
  SELECT * INTO v_entry 
  FROM time_entries 
  WHERE employee_id = p_employee_id 
    AND clock_out_time IS NULL 
    AND status = 'active'
  ORDER BY clock_in_time DESC 
  LIMIT 1;
  
  IF v_entry IS NULL THEN
    RAISE EXCEPTION 'Not clocked in. Please clock in first.';
  END IF;
  
  -- Find nearest geofence if coordinates provided
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN
    SELECT * INTO v_geofence FROM get_nearest_geofence(v_organization_id, p_latitude, p_longitude);
  END IF;
  
  -- Create time punch
  INSERT INTO time_punches (
    organization_id, employee_id, event_id, shift_id, punch_type, punch_time,
    latitude, longitude, accuracy_meters, venue_id, geofence_id,
    is_within_geofence, distance_from_geofence_meters,
    photo_url, device_id, device_type, notes, status
  )
  VALUES (
    v_organization_id, p_employee_id, v_entry.event_id, v_entry.shift_id, 'clock_out', NOW(),
    p_latitude, p_longitude, p_accuracy_meters,
    v_geofence.venue_id, v_geofence.geofence_id,
    v_geofence.is_within, v_geofence.distance_meters,
    p_photo_url, p_device_id, p_device_type, p_notes,
    CASE WHEN v_geofence.is_within = FALSE THEN 'flagged' ELSE 'approved' END
  )
  RETURNING id INTO v_punch_id;
  
  -- Calculate break minutes
  SELECT COALESCE(SUM(duration_minutes), 0) INTO v_break_minutes
  FROM break_records WHERE time_entry_id = v_entry.id;
  
  -- Calculate total minutes
  v_total_minutes := EXTRACT(EPOCH FROM (NOW() - v_entry.clock_in_time)) / 60;
  
  -- Update time entry
  UPDATE time_entries
  SET 
    clock_out_punch_id = v_punch_id,
    clock_out_time = NOW(),
    break_minutes = v_break_minutes,
    total_minutes = v_total_minutes - v_break_minutes,
    status = 'completed',
    updated_at = NOW()
  WHERE id = v_entry.id;
  
  RETURN v_punch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default overtime rule
INSERT INTO overtime_rules (organization_id, name, description, is_default, is_active)
SELECT 
  id,
  'Standard Overtime',
  'Standard US overtime rules: 8 hours daily regular, 40 hours weekly',
  TRUE,
  TRUE
FROM organizations
ON CONFLICT DO NOTHING;

COMMENT ON TABLE venue_geofences IS 'Geographic boundaries for venue-based time tracking';
COMMENT ON TABLE time_punches IS 'Individual clock in/out and break punches with location data';
COMMENT ON TABLE time_entries IS 'Aggregated time entries pairing clock in/out punches';
COMMENT ON TABLE break_records IS 'Break periods within a time entry';
COMMENT ON TABLE overtime_rules IS 'Overtime calculation rules by jurisdiction or contract';
