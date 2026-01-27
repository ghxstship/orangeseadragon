-- Workflow Templates: Gap Implementation Features
-- Automated workflows for registration, ticketing, talent, partners, credentials, etc.

-- ============================================================================
-- REGISTRATION WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Registration Confirmation',
    'Send confirmation email when registration is confirmed',
    'registration',
    'entity_updated',
    '{
        "entity": "event_registrations",
        "conditions": [
            {"field": "status_id", "operator": "changed_to", "value": "confirmed"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Registration Check-in Notification',
    'Send welcome message when attendee checks in',
    'registration',
    'entity_updated',
    '{
        "entity": "event_registrations",
        "conditions": [
            {"field": "checked_in_at", "operator": "is_not_null"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Waitlist Promotion',
    'Automatically offer ticket to next person on waitlist when cancellation occurs',
    'registration',
    'entity_updated',
    '{
        "entity": "event_registrations",
        "conditions": [
            {"field": "status_id", "operator": "changed_to", "value": "cancelled"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Event Reminder - 24 Hours',
    'Send reminder email 24 hours before event',
    'registration',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "event.start_date",
        "offset": "-24h"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TICKETING WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Low Ticket Inventory Alert',
    'Alert when ticket type reaches 10% remaining',
    'ticketing',
    'entity_updated',
    '{
        "entity": "ticket_types",
        "conditions": [
            {"field": "quantity_available", "operator": "less_than_percent", "value": 10, "compare_field": "quantity_sold"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Sold Out Notification',
    'Notify team when ticket type sells out',
    'ticketing',
    'entity_updated',
    '{
        "entity": "ticket_types",
        "conditions": [
            {"field": "quantity_available", "operator": "equals", "value": 0}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TALENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Talent Invitation',
    'Send invitation email when talent is assigned to session',
    'talent',
    'entity_created',
    '{
        "entity": "session_talent"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Talent Confirmation Reminder',
    'Send reminder if talent has not confirmed within 7 days',
    'talent',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "session_talent.invited_at",
        "offset": "+7d",
        "conditions": [
            {"field": "status_id", "operator": "equals", "value": "invited"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Talent Rider Review',
    'Route talent rider to production manager for review',
    'talent',
    'entity_created',
    '{
        "entity": "talent_riders"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PARTNER WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Partner Onboarding',
    'Send welcome package when partner is confirmed',
    'partner',
    'entity_updated',
    '{
        "entity": "event_partners",
        "conditions": [
            {"field": "status_id", "operator": "changed_to", "value": "confirmed"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Deliverable Due Reminder',
    'Remind partner of upcoming deliverable deadline',
    'partner',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "partner_deliverables.due_date",
        "offset": "-3d",
        "conditions": [
            {"field": "status", "operator": "in", "value": ["pending", "in_progress"]}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Deliverable Overdue Alert',
    'Alert team when partner deliverable is overdue',
    'partner',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "partner_deliverables.due_date",
        "offset": "+1d",
        "conditions": [
            {"field": "status", "operator": "in", "value": ["pending", "in_progress"]}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CREDENTIAL WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Credential Issued Notification',
    'Notify holder when credential is issued',
    'credential',
    'entity_created',
    '{
        "entity": "issued_credentials"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Credential Expiring Soon',
    'Alert holder when credential expires in 7 days',
    'credential',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "issued_credentials.valid_until",
        "offset": "-7d",
        "conditions": [
            {"field": "status_id", "operator": "equals", "value": "active"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Credential Suspended Alert',
    'Alert security when credential is suspended',
    'credential',
    'entity_updated',
    '{
        "entity": "issued_credentials",
        "conditions": [
            {"field": "suspended_at", "operator": "is_not_null"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINANCE WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Journal Entry Approval',
    'Route journal entry for approval before posting',
    'finance',
    'entity_created',
    '{
        "entity": "journal_entries",
        "conditions": [
            {"field": "status", "operator": "equals", "value": "draft"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Bank Reconciliation Reminder',
    'Monthly reminder to reconcile bank accounts',
    'finance',
    'schedule',
    '{
        "schedule_type": "cron",
        "cron": "0 9 1 * *"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LEAD SCORING WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Hot Lead Alert',
    'Alert sales when lead score exceeds threshold',
    'sales',
    'entity_updated',
    '{
        "entity": "leads",
        "conditions": [
            {"field": "score", "operator": "greater_than", "value": 80}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Lead Score Decay',
    'Reduce lead scores for inactive leads',
    'sales',
    'schedule',
    '{
        "schedule_type": "cron",
        "cron": "0 0 * * *"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CAMPAIGN WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Campaign Scheduled',
    'Notify team when campaign is scheduled',
    'marketing',
    'entity_updated',
    '{
        "entity": "campaigns",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "scheduled"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Campaign Completed Report',
    'Generate and send campaign performance report',
    'marketing',
    'entity_updated',
    '{
        "entity": "campaigns",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "sent"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ONBOARDING WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Onboarding Started',
    'Notify HR and manager when employee onboarding begins',
    'hr',
    'entity_created',
    '{
        "entity": "onboarding_instances"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Onboarding Task Due',
    'Remind assignee of upcoming onboarding task',
    'hr',
    'schedule',
    '{
        "schedule_type": "relative",
        "relative_to": "onboarding_instance_items.due_date",
        "offset": "-1d",
        "conditions": [
            {"field": "status", "operator": "equals", "value": "pending"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Onboarding Completed',
    'Notify HR when employee completes onboarding',
    'hr',
    'entity_updated',
    '{
        "entity": "onboarding_instances",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "completed"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LEAVE MANAGEMENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Leave Request Submitted',
    'Notify manager when leave request is submitted',
    'hr',
    'entity_created',
    '{
        "entity": "leave_requests"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Leave Request Approved',
    'Notify employee when leave is approved',
    'hr',
    'entity_updated',
    '{
        "entity": "leave_requests",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "approved"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Leave Request Rejected',
    'Notify employee when leave is rejected',
    'hr',
    'entity_updated',
    '{
        "entity": "leave_requests",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "rejected"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PROCUREMENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'PO Approval Required',
    'Route purchase order for approval',
    'procurement',
    'entity_updated',
    '{
        "entity": "purchase_orders",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "pending_approval"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'PO Approved',
    'Notify requester when PO is approved',
    'procurement',
    'entity_updated',
    '{
        "entity": "purchase_orders",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "approved"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Goods Received',
    'Update PO status when goods are received',
    'procurement',
    'entity_created',
    '{
        "entity": "goods_receipts"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUPPORT TICKET WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'New Ticket Created',
    'Notify support team of new ticket',
    'support',
    'entity_created',
    '{
        "entity": "support_tickets"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Ticket Assigned',
    'Notify agent when ticket is assigned',
    'support',
    'entity_updated',
    '{
        "entity": "support_tickets",
        "conditions": [
            {"field": "assigned_to_user_id", "operator": "changed"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Ticket SLA Warning',
    'Alert when ticket approaches SLA deadline',
    'support',
    'schedule',
    '{
        "schedule_type": "interval",
        "interval": "15m"
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Ticket Resolved',
    'Send satisfaction survey when ticket is resolved',
    'support',
    'entity_updated',
    '{
        "entity": "support_tickets",
        "conditions": [
            {"field": "status", "operator": "changed_to", "value": "resolved"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO workflow_templates (organization_id, name, description, category, trigger_type, trigger_config, is_active, created_by)
SELECT 
    o.id,
    'Urgent Ticket Escalation',
    'Escalate urgent tickets to manager',
    'support',
    'entity_created',
    '{
        "entity": "support_tickets",
        "conditions": [
            {"field": "priority", "operator": "equals", "value": "urgent"}
        ]
    }'::jsonb,
    true,
    NULL
FROM organizations o
ON CONFLICT DO NOTHING;
