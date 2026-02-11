-- ============================================================================
-- Migration: Expense Approval Workflows
-- Description: Add approval workflow support for expenses with multi-level approvals
-- ============================================================================

-- Create expense approval policies table
CREATE TABLE IF NOT EXISTS expense_approval_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_amount DECIMAL(15,2) DEFAULT 0,
  max_amount DECIMAL(15,2),
  categories TEXT[],
  requires_receipt BOOLEAN DEFAULT TRUE,
  auto_approve_below DECIMAL(15,2),
  approval_levels INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create expense approval levels table
CREATE TABLE IF NOT EXISTS expense_approval_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES expense_approval_policies(id) ON DELETE CASCADE,
  level_order INTEGER NOT NULL,
  approver_type VARCHAR(50) NOT NULL,
  approver_id UUID,
  approver_role VARCHAR(100),
  can_skip BOOLEAN DEFAULT FALSE,
  timeout_hours INTEGER DEFAULT 72,
  escalation_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, level_order)
);

-- Create expense approval requests table
CREATE TABLE IF NOT EXISTS expense_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES expense_approval_policies(id),
  current_level INTEGER DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expense approval actions table (audit trail)
CREATE TABLE IF NOT EXISTS expense_approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES expense_approval_requests(id) ON DELETE CASCADE,
  level_order INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  action_by UUID NOT NULL REFERENCES auth.users(id),
  action_at TIMESTAMPTZ DEFAULT NOW(),
  comments TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Add approval fields to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_for_approval_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_expense_approval_policies_tenant ON expense_approval_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_levels_policy ON expense_approval_levels(policy_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_requests_expense ON expense_approval_requests(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_requests_status ON expense_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_expense_approval_actions_request ON expense_approval_actions(request_id);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(approval_status);

-- RLS policies
ALTER TABLE expense_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approval_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approval_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view approval policies for their tenant" ON expense_approval_policies;
CREATE POLICY "Users can view approval policies for their tenant"
  ON expense_approval_policies FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage approval policies" ON expense_approval_policies;
CREATE POLICY "Admins can manage approval policies"
  ON expense_approval_policies FOR ALL
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view approval levels for their tenant" ON expense_approval_levels;
CREATE POLICY "Users can view approval levels for their tenant"
  ON expense_approval_levels FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage approval levels" ON expense_approval_levels;
CREATE POLICY "Admins can manage approval levels"
  ON expense_approval_levels FOR ALL
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own approval requests" ON expense_approval_requests;
CREATE POLICY "Users can view their own approval requests"
  ON expense_approval_requests FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    AND (
      submitted_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM expense_approval_levels eal
        WHERE eal.policy_id = expense_approval_requests.policy_id
        AND eal.level_order = expense_approval_requests.current_level
        AND (
          eal.approver_id = auth.uid()
          OR eal.approver_type = 'manager'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create approval requests" ON expense_approval_requests;
CREATE POLICY "Users can create approval requests"
  ON expense_approval_requests FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Approvers can update approval requests" ON expense_approval_requests;
CREATE POLICY "Approvers can update approval requests"
  ON expense_approval_requests FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view approval actions" ON expense_approval_actions;
CREATE POLICY "Users can view approval actions"
  ON expense_approval_actions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Approvers can create approval actions" ON expense_approval_actions;
CREATE POLICY "Approvers can create approval actions"
  ON expense_approval_actions FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- Function to get applicable approval policy for an expense
CREATE OR REPLACE FUNCTION get_expense_approval_policy(
  p_organization_id UUID,
  p_amount DECIMAL(15,2),
  p_category TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_policy_id UUID;
BEGIN
  SELECT id INTO v_policy_id
  FROM expense_approval_policies
  WHERE organization_id = p_organization_id
    AND is_active = TRUE
    AND min_amount <= p_amount
    AND (max_amount IS NULL OR max_amount >= p_amount)
    AND (categories IS NULL OR p_category = ANY(categories))
  ORDER BY min_amount DESC
  LIMIT 1;
  
  RETURN v_policy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit expense for approval
CREATE OR REPLACE FUNCTION submit_expense_for_approval(
  p_expense_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_expense RECORD;
  v_policy_id UUID;
  v_request_id UUID;
  v_auto_approve_amount DECIMAL(15,2);
BEGIN
  -- Get expense details
  SELECT * INTO v_expense FROM expenses WHERE id = p_expense_id;
  
  IF v_expense IS NULL THEN
    RAISE EXCEPTION 'Expense not found';
  END IF;
  
  IF v_expense.approval_status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Expense cannot be submitted for approval in current status';
  END IF;
  
  -- Get applicable policy
  v_policy_id := get_expense_approval_policy(v_expense.organization_id, v_expense.amount, v_expense.category);
  
  -- Check for auto-approval
  IF v_policy_id IS NOT NULL THEN
    SELECT auto_approve_below INTO v_auto_approve_amount
    FROM expense_approval_policies
    WHERE id = v_policy_id;
    
    IF v_auto_approve_amount IS NOT NULL AND v_expense.amount < v_auto_approve_amount THEN
      -- Auto-approve
      UPDATE expenses
      SET 
        approval_status = 'approved',
        approved_at = NOW(),
        status = 'approved'
      WHERE id = p_expense_id;
      
      RETURN NULL; -- No approval request needed
    END IF;
  END IF;
  
  -- Create approval request
  INSERT INTO expense_approval_requests (
    organization_id,
    expense_id,
    policy_id,
    current_level,
    status,
    submitted_by,
    notes
  )
  VALUES (
    v_expense.organization_id,
    p_expense_id,
    v_policy_id,
    1,
    'pending',
    auth.uid(),
    p_notes
  )
  RETURNING id INTO v_request_id;
  
  -- Update expense status
  UPDATE expenses
  SET 
    approval_status = 'pending',
    submitted_for_approval_at = NOW()
  WHERE id = p_expense_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve/reject expense
CREATE OR REPLACE FUNCTION process_expense_approval(
  p_request_id UUID,
  p_action VARCHAR(50), -- 'approved', 'rejected', 'returned'
  p_comments TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
  v_policy RECORD;
  v_next_level INTEGER;
  v_max_levels INTEGER;
BEGIN
  -- Get request details
  SELECT * INTO v_request FROM expense_approval_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Approval request not found';
  END IF;
  
  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is not pending approval';
  END IF;
  
  -- Record the action
  INSERT INTO expense_approval_actions (
    organization_id,
    request_id,
    level_order,
    action,
    action_by,
    comments
  )
  VALUES (
    v_request.organization_id,
    p_request_id,
    v_request.current_level,
    p_action,
    auth.uid(),
    p_comments
  );
  
  IF p_action = 'rejected' THEN
    -- Reject the expense
    UPDATE expense_approval_requests
    SET status = 'rejected', completed_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;
    
    UPDATE expenses
    SET 
      approval_status = 'rejected',
      rejection_reason = p_comments
    WHERE id = v_request.expense_id;
    
  ELSIF p_action = 'returned' THEN
    -- Return to submitter for revision
    UPDATE expense_approval_requests
    SET status = 'cancelled', completed_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;
    
    UPDATE expenses
    SET approval_status = 'draft'
    WHERE id = v_request.expense_id;
    
  ELSIF p_action = 'approved' THEN
    -- Check if there are more levels
    IF v_request.policy_id IS NOT NULL THEN
      SELECT approval_levels INTO v_max_levels
      FROM expense_approval_policies
      WHERE id = v_request.policy_id;
      
      v_next_level := v_request.current_level + 1;
      
      IF v_next_level <= v_max_levels THEN
        -- Move to next level
        UPDATE expense_approval_requests
        SET current_level = v_next_level, updated_at = NOW()
        WHERE id = p_request_id;
        
        RETURN;
      END IF;
    END IF;
    
    -- Final approval
    UPDATE expense_approval_requests
    SET status = 'approved', completed_at = NOW(), updated_at = NOW()
    WHERE id = p_request_id;
    
    UPDATE expenses
    SET 
      approval_status = 'approved',
      approved_at = NOW(),
      approved_by = auth.uid(),
      status = 'approved'
    WHERE id = v_request.expense_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default approval policy
INSERT INTO expense_approval_policies (organization_id, name, description, min_amount, auto_approve_below, approval_levels, is_active)
SELECT 
  id,
  'Default Expense Policy',
  'Standard approval workflow for all expenses',
  0,
  50.00,
  2,
  TRUE
FROM organizations
ON CONFLICT DO NOTHING;

COMMENT ON TABLE expense_approval_policies IS 'Defines approval rules based on amount thresholds and categories';
COMMENT ON TABLE expense_approval_levels IS 'Defines the approval chain for each policy';
COMMENT ON TABLE expense_approval_requests IS 'Tracks individual expense approval requests';
COMMENT ON TABLE expense_approval_actions IS 'Audit trail of all approval actions';
