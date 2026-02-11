-- ============================================================================
-- Migration: Shift Swap Requests & Open Shift Marketplace
-- Description: Add shift swap requests, open shifts, and approval workflows
-- ============================================================================

-- Create shift swap requests table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  original_shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  requesting_employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  target_employee_id UUID REFERENCES employee_profiles(id),
  swap_type VARCHAR(20) NOT NULL DEFAULT 'swap', -- 'swap', 'giveaway', 'cover'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'target_accepted', 'approved', 'rejected', 'cancelled', 'expired'
  reason TEXT,
  requester_notes TEXT,
  target_notes TEXT,
  manager_notes TEXT,
  target_shift_id UUID REFERENCES shifts(id), -- For swap type, the shift being offered in return
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  target_responded_at TIMESTAMPTZ,
  manager_responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create open shifts table (shifts available for claiming)
CREATE TABLE IF NOT EXISTS open_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES auth.users(id),
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reason VARCHAR(100), -- 'callout', 'understaffed', 'new_shift', 'swap_giveaway'
  required_skills TEXT[],
  required_certifications UUID[], -- certification_type_ids
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  bonus_amount DECIMAL(10,2),
  bonus_description TEXT,
  max_claimants INTEGER DEFAULT 1,
  claimed_by UUID REFERENCES employee_profiles(id),
  claimed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'claimed', 'filled', 'cancelled', 'expired'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shift claim requests table (for when approval is needed)
CREATE TABLE IF NOT EXISTS shift_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  open_shift_id UUID NOT NULL REFERENCES open_shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'withdrawn'
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add swap-related fields to shifts table
ALTER TABLE shifts
ADD COLUMN IF NOT EXISTS is_swappable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS original_employee_id UUID REFERENCES employee_profiles(id),
ADD COLUMN IF NOT EXISTS swap_request_id UUID REFERENCES shift_swap_requests(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_original_shift ON shift_swap_requests(original_shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_requester ON shift_swap_requests(requesting_employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_target ON shift_swap_requests(target_employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_status ON shift_swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_open_shifts_shift ON open_shifts(shift_id);
CREATE INDEX IF NOT EXISTS idx_open_shifts_status ON open_shifts(status);
CREATE INDEX IF NOT EXISTS idx_open_shifts_expires ON open_shifts(expires_at);
CREATE INDEX IF NOT EXISTS idx_shift_claim_requests_open_shift ON shift_claim_requests(open_shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_claim_requests_employee ON shift_claim_requests(employee_id);

-- RLS policies
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view swap requests they're involved in" ON shift_swap_requests;
CREATE POLICY "Users can view swap requests they're involved in"
  ON shift_swap_requests FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      requesting_employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR target_employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create swap requests" ON shift_swap_requests;
CREATE POLICY "Users can create swap requests"
  ON shift_swap_requests FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND requesting_employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own swap requests" ON shift_swap_requests;
CREATE POLICY "Users can update their own swap requests"
  ON shift_swap_requests FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      requesting_employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR target_employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view open shifts for their tenant" ON open_shifts;
CREATE POLICY "Users can view open shifts for their tenant"
  ON open_shifts FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Managers can manage open shifts" ON open_shifts;
CREATE POLICY "Managers can manage open shifts"
  ON open_shifts FOR ALL
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own claim requests" ON shift_claim_requests;
CREATE POLICY "Users can view their own claim requests"
  ON shift_claim_requests FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create claim requests" ON shift_claim_requests;
CREATE POLICY "Users can create claim requests"
  ON shift_claim_requests FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND employee_id IN (SELECT id FROM employee_profiles WHERE user_id = auth.uid())
  );

-- Function to request a shift swap
CREATE OR REPLACE FUNCTION request_shift_swap(
  p_shift_id UUID,
  p_target_employee_id UUID DEFAULT NULL,
  p_swap_type VARCHAR(20) DEFAULT 'swap',
  p_target_shift_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_shift RECORD;
  v_employee_id UUID;
  v_request_id UUID;
BEGIN
  -- Get the shift
  SELECT * INTO v_shift FROM shifts WHERE id = p_shift_id;
  
  IF v_shift IS NULL THEN
    RAISE EXCEPTION 'Shift not found';
  END IF;
  
  IF NOT v_shift.is_swappable THEN
    RAISE EXCEPTION 'This shift is not available for swapping';
  END IF;
  
  -- Get employee ID for current user
  SELECT id INTO v_employee_id FROM employee_profiles WHERE user_id = auth.uid();
  
  IF v_employee_id IS NULL THEN
    RAISE EXCEPTION 'Employee profile not found';
  END IF;
  
  -- Verify the requester is assigned to this shift
  IF v_shift.employee_id != v_employee_id THEN
    RAISE EXCEPTION 'You can only request swaps for your own shifts';
  END IF;
  
  -- Create the swap request
  INSERT INTO shift_swap_requests (
    organization_id,
    original_shift_id,
    requesting_employee_id,
    target_employee_id,
    swap_type,
    target_shift_id,
    reason,
    requester_notes,
    expires_at
  )
  VALUES (
    v_shift.organization_id,
    p_shift_id,
    v_employee_id,
    p_target_employee_id,
    p_swap_type,
    p_target_shift_id,
    p_reason,
    p_notes,
    v_shift.start_time - INTERVAL '24 hours' -- Expires 24 hours before shift
  )
  RETURNING id INTO v_request_id;
  
  -- If it's a giveaway with no target, create an open shift
  IF p_swap_type = 'giveaway' AND p_target_employee_id IS NULL THEN
    INSERT INTO open_shifts (
      organization_id,
      shift_id,
      posted_by,
      reason,
      expires_at
    )
    VALUES (
      v_shift.organization_id,
      p_shift_id,
      auth.uid(),
      'swap_giveaway',
      v_shift.start_time - INTERVAL '24 hours'
    );
  END IF;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to a swap request (target employee)
CREATE OR REPLACE FUNCTION respond_to_swap_request(
  p_request_id UUID,
  p_accept BOOLEAN,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
  v_employee_id UUID;
BEGIN
  SELECT * INTO v_request FROM shift_swap_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Swap request not found';
  END IF;
  
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'This request has already been processed';
  END IF;
  
  -- Get employee ID for current user
  SELECT id INTO v_employee_id FROM employee_profiles WHERE user_id = auth.uid();
  
  IF v_request.target_employee_id != v_employee_id THEN
    RAISE EXCEPTION 'You are not the target of this swap request';
  END IF;
  
  IF p_accept THEN
    UPDATE shift_swap_requests
    SET 
      status = 'target_accepted',
      target_notes = p_notes,
      target_responded_at = NOW(),
      updated_at = NOW()
    WHERE id = p_request_id;
  ELSE
    UPDATE shift_swap_requests
    SET 
      status = 'rejected',
      target_notes = p_notes,
      target_responded_at = NOW(),
      updated_at = NOW()
    WHERE id = p_request_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve/reject a swap request (manager)
CREATE OR REPLACE FUNCTION process_swap_request(
  p_request_id UUID,
  p_approve BOOLEAN,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
  v_original_shift RECORD;
  v_target_shift RECORD;
BEGIN
  SELECT * INTO v_request FROM shift_swap_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Swap request not found';
  END IF;
  
  IF v_request.status NOT IN ('pending', 'target_accepted') THEN
    RAISE EXCEPTION 'This request cannot be processed in its current state';
  END IF;
  
  IF p_approve THEN
    -- Get the shifts
    SELECT * INTO v_original_shift FROM shifts WHERE id = v_request.original_shift_id;
    
    IF v_request.swap_type = 'swap' AND v_request.target_shift_id IS NOT NULL THEN
      SELECT * INTO v_target_shift FROM shifts WHERE id = v_request.target_shift_id;
      
      -- Swap the employees on both shifts
      UPDATE shifts SET 
        employee_id = v_request.target_employee_id,
        original_employee_id = v_original_shift.employee_id,
        swap_request_id = p_request_id,
        updated_at = NOW()
      WHERE id = v_request.original_shift_id;
      
      UPDATE shifts SET 
        employee_id = v_request.requesting_employee_id,
        original_employee_id = v_target_shift.employee_id,
        swap_request_id = p_request_id,
        updated_at = NOW()
      WHERE id = v_request.target_shift_id;
    ELSE
      -- Just reassign the original shift
      UPDATE shifts SET 
        employee_id = v_request.target_employee_id,
        original_employee_id = v_original_shift.employee_id,
        swap_request_id = p_request_id,
        updated_at = NOW()
      WHERE id = v_request.original_shift_id;
    END IF;
    
    UPDATE shift_swap_requests
    SET 
      status = 'approved',
      manager_notes = p_notes,
      manager_responded_at = NOW(),
      responded_by = auth.uid(),
      updated_at = NOW()
    WHERE id = p_request_id;
  ELSE
    UPDATE shift_swap_requests
    SET 
      status = 'rejected',
      manager_notes = p_notes,
      manager_responded_at = NOW(),
      responded_by = auth.uid(),
      updated_at = NOW()
    WHERE id = p_request_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim an open shift
CREATE OR REPLACE FUNCTION claim_open_shift(
  p_open_shift_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_open_shift RECORD;
  v_employee_id UUID;
  v_claim_id UUID;
BEGIN
  SELECT * INTO v_open_shift FROM open_shifts WHERE id = p_open_shift_id;
  
  IF v_open_shift IS NULL THEN
    RAISE EXCEPTION 'Open shift not found';
  END IF;
  
  IF v_open_shift.status != 'open' THEN
    RAISE EXCEPTION 'This shift is no longer available';
  END IF;
  
  -- Get employee ID for current user
  SELECT id INTO v_employee_id FROM employee_profiles WHERE user_id = auth.uid();
  
  IF v_employee_id IS NULL THEN
    RAISE EXCEPTION 'Employee profile not found';
  END IF;
  
  -- Create claim request
  INSERT INTO shift_claim_requests (
    organization_id,
    open_shift_id,
    employee_id,
    notes
  )
  VALUES (
    v_open_shift.organization_id,
    p_open_shift_id,
    v_employee_id,
    p_notes
  )
  RETURNING id INTO v_claim_id;
  
  RETURN v_claim_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE shift_swap_requests IS 'Requests to swap or give away shifts between employees';
COMMENT ON TABLE open_shifts IS 'Shifts available for claiming by qualified employees';
COMMENT ON TABLE shift_claim_requests IS 'Employee requests to claim open shifts';
