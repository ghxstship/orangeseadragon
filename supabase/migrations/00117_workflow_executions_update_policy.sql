-- Migration 00117: workflow_executions update policy hardening
-- Ensures authenticated organization members can update execution state transitions.

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update executions in their organization" ON workflow_executions;
CREATE POLICY "Users can update executions in their organization"
  ON workflow_executions FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
