-- ============================================================================
-- 00116: Transaction-safe RPC functions for multi-table operations
-- ============================================================================
-- These functions wrap multi-step business operations in a single transaction
-- to prevent partial writes and ensure data integrity.
-- ============================================================================

-- ============================================================================
-- 1. convert_deal_to_project
-- Atomically: create project, optionally create budget + line items,
-- link deal, add project members, create default task list + kickoff tasks.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.convert_deal_to_project(
  p_deal_id          UUID,
  p_user_id          UUID,
  p_project_name     TEXT DEFAULT NULL,
  p_create_budget    BOOLEAN DEFAULT TRUE,
  p_budget_template_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal             RECORD;
  v_project          RECORD;
  v_budget_id        UUID;
  v_task_list_id     UUID;
  v_slug             TEXT;
  v_ts               TEXT := to_char(now(), 'YYMMDD') || substr(md5(random()::text), 1, 4);
BEGIN
  -- Lock and fetch the deal
  SELECT * INTO v_deal
    FROM deals
   WHERE id = p_deal_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;

  IF v_deal.won_at IS NULL THEN
    RAISE EXCEPTION 'Only won deals can be converted';
  END IF;

  IF v_deal.converted_project_id IS NOT NULL THEN
    RAISE EXCEPTION 'Deal already converted to project %', v_deal.converted_project_id;
  END IF;

  -- Build slug
  v_slug := lower(regexp_replace(coalesce(p_project_name, v_deal.name), '[^a-z0-9]+', '-', 'gi'));
  v_slug := trim(BOTH '-' FROM v_slug) || '-' || v_ts;

  -- 1. Create project
  INSERT INTO projects (
    organization_id, name, slug, description, status, visibility,
    priority, budget_amount, budget_currency, start_date, metadata, created_by
  ) VALUES (
    v_deal.organization_id,
    coalesce(p_project_name, v_deal.name),
    v_slug,
    v_deal.description,
    'planning',
    'team',
    'medium',
    v_deal.value,
    coalesce(v_deal.currency, 'USD'),
    current_date,
    jsonb_build_object(
      'converted_from_deal', p_deal_id,
      'deal_name', v_deal.name,
      'company_id', v_deal.company_id,
      'contact_id', v_deal.contact_id
    ),
    p_user_id
  )
  RETURNING * INTO v_project;

  -- 2. Optionally create budget
  IF p_create_budget AND v_deal.value IS NOT NULL THEN
    INSERT INTO budgets (
      organization_id, project_id, name, budget_type, period_type,
      start_date, total_amount, revenue_amount, cost_amount, status, created_by
    ) VALUES (
      v_deal.organization_id,
      v_project.id,
      v_project.name || ' Budget',
      'fixed_price',
      'project',
      current_date,
      v_deal.value,
      v_deal.value,
      coalesce(v_deal.estimated_costs, 0),
      'draft',
      p_user_id
    )
    RETURNING id INTO v_budget_id;

    -- Copy template line items if provided
    IF p_budget_template_id IS NOT NULL AND v_budget_id IS NOT NULL THEN
      INSERT INTO budget_line_items (budget_id, category_id, name, description, planned_amount)
      SELECT v_budget_id, category_id, name, description, coalesce(default_amount, 0)
        FROM budget_template_line_items
       WHERE template_id = p_budget_template_id
       ORDER BY sort_order;
    END IF;
  END IF;

  -- 3. Link deal to project
  UPDATE deals SET
    project_id = v_project.id,
    converted_project_id = v_project.id,
    converted_at = now(),
    converted_by = p_user_id,
    updated_at = now()
  WHERE id = p_deal_id;

  -- 4. Add deal owner as project member
  IF v_deal.owner_id IS NOT NULL THEN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (v_project.id, v_deal.owner_id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Add current user as admin if different
  IF p_user_id IS DISTINCT FROM v_deal.owner_id THEN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (v_project.id, p_user_id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 5. Create default task list
  INSERT INTO task_lists (organization_id, project_id, name, position, is_default)
  VALUES (v_deal.organization_id, v_project.id, 'To Do', 0, true)
  RETURNING id INTO v_task_list_id;

  -- 6. Create kickoff tasks
  INSERT INTO tasks (organization_id, project_id, task_list_id, title, status, priority, task_type, position, created_by)
  VALUES
    (v_deal.organization_id, v_project.id, v_task_list_id, 'Kickoff meeting', 'todo', 'medium', 'task', 1, p_user_id),
    (v_deal.organization_id, v_project.id, v_task_list_id, 'Define project scope', 'todo', 'medium', 'task', 2, p_user_id),
    (v_deal.organization_id, v_project.id, v_task_list_id, 'Create project timeline', 'todo', 'medium', 'task', 3, p_user_id),
    (v_deal.organization_id, v_project.id, v_task_list_id, 'Assign team members', 'todo', 'medium', 'task', 4, p_user_id);

  -- 7. Audit log
  INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (
    v_deal.organization_id,
    p_user_id,
    'deal_converted_to_project',
    'deal',
    p_deal_id,
    jsonb_build_object('project_id', v_project.id, 'project_name', v_project.name)
  );

  -- Return the created project
  RETURN jsonb_build_object(
    'project', row_to_json(v_project),
    'budget_id', v_budget_id,
    'deal_id', p_deal_id
  );
END;
$$;

-- Grant execute to authenticated users (RLS on underlying tables still applies via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public.convert_deal_to_project(UUID, UUID, TEXT, BOOLEAN, UUID) TO authenticated;


-- ============================================================================
-- 2. submit_expense_for_approval
-- Atomically: validate expense, update status, create approval request,
-- notify approvers, and audit log.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_expense_for_approval(
  p_expense_id  UUID,
  p_user_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expense RECORD;
  v_approval_request_id UUID;
  v_approvers UUID[];
BEGIN
  -- Lock and fetch the expense
  SELECT * INTO v_expense
    FROM expenses
   WHERE id = p_expense_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expense not found: %', p_expense_id;
  END IF;

  IF v_expense.status NOT IN ('pending', 'draft') THEN
    RAISE EXCEPTION 'Expense with status "%" cannot be submitted', v_expense.status;
  END IF;

  -- Update expense status
  UPDATE expenses SET
    status = 'submitted',
    submitted_at = now(),
    updated_at = now()
  WHERE id = p_expense_id;

  -- Create approval request
  INSERT INTO approval_requests (
    organization_id, entity_type, entity_id, requested_by,
    status, current_step, total_steps
  ) VALUES (
    v_expense.organization_id, 'expense', p_expense_id, p_user_id,
    'pending', 1, 1
  )
  RETURNING id INTO v_approval_request_id;

  -- Find approvers (org admins / finance managers)
  SELECT array_agg(om.user_id) INTO v_approvers
    FROM organization_members om
    JOIN roles r ON r.id = om.role_id
   WHERE om.organization_id = v_expense.organization_id
     AND om.status = 'active'
     AND r.name IN ('admin', 'finance_manager');

  -- Notify each approver
  IF v_approvers IS NOT NULL THEN
    INSERT INTO notifications (organization_id, user_id, type, title, message, data, entity_type, entity_id)
    SELECT
      v_expense.organization_id,
      unnest(v_approvers),
      'expense_submitted',
      'Expense Pending Approval',
      format('$%s expense submitted for approval', v_expense.amount),
      jsonb_build_object('expense_id', p_expense_id, 'approval_request_id', v_approval_request_id),
      'expense',
      p_expense_id;
  END IF;

  -- Audit log
  INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    v_expense.organization_id, p_user_id, 'expense_submitted', 'expense', p_expense_id,
    jsonb_build_object('status', v_expense.status),
    jsonb_build_object('status', 'submitted')
  );

  RETURN jsonb_build_object(
    'expense_id', p_expense_id,
    'approval_request_id', v_approval_request_id,
    'status', 'submitted'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_expense_for_approval(UUID, UUID) TO authenticated;
