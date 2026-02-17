-- Migration: Budget Alert Rules
-- Created: 2026-02-16
-- Description: Creates the budget_alert_rules table for threshold-based
--              budget overrun warnings (G8 feature).

CREATE TABLE IF NOT EXISTS budget_alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,

    -- Rule configuration
    threshold_percent NUMERIC(6,2) NOT NULL CHECK (threshold_percent > 0),
    channel VARCHAR(20) NOT NULL DEFAULT 'in-app'
        CHECK (channel IN ('in-app', 'email', 'slack')),
    recipients JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Trigger tracking
    last_triggered_at TIMESTAMPTZ,

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_alert_rules_org ON budget_alert_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_alert_rules_budget ON budget_alert_rules(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_alert_rules_enabled ON budget_alert_rules(enabled) WHERE enabled = TRUE;
