-- Migration: Show call logs and notification rules tables
-- Required by: src/hooks/use-runsheet-realtime.ts, src/lib/services/expiration-alert.service.ts

-- Show call logs for production show-calling workflow
CREATE TABLE IF NOT EXISTS show_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runsheet_id UUID NOT NULL REFERENCES runsheets(id) ON DELETE CASCADE,
  runsheet_item_id UUID REFERENCES runsheet_items(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  called_by UUID NOT NULL REFERENCES auth.users(id),
  called_by_name TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_show_call_logs_runsheet ON show_call_logs(runsheet_id);
CREATE INDEX idx_show_call_logs_item ON show_call_logs(runsheet_item_id);

ALTER TABLE show_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "show_call_logs_org_access" ON show_call_logs
  FOR ALL USING (
    runsheet_id IN (
      SELECT r.id FROM runsheets r
      JOIN organization_members om ON om.organization_id = r.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Notification rules for configurable alert routing
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notification_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_rules_org ON notification_rules(organization_id);
CREATE INDEX idx_notification_rules_entity ON notification_rules(entity_type, trigger_type);

ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_rules_org_access" ON notification_rules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE show_call_logs IS 'Logs of show-calling actions during live production runsheets';
COMMENT ON TABLE notification_rules IS 'Configurable notification routing rules per entity type and trigger';
