-- ATLVS Platform Database Schema
-- Workflow Templates Seed Data (73 templates as per specification)

-- ============================================================================
-- PROJECT MANAGEMENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
-- Project Workflows
('00000000-0000-0000-0001-000000000001', NULL, 'Project Created Notification', 'project-created-notification', 'Notify team members when a new project is created', 'entity_created', '{"entity_type": "projects"}', true, true, 'project_management', 1),
('00000000-0000-0000-0001-000000000002', NULL, 'Project Status Changed', 'project-status-changed', 'Trigger actions when project status changes', 'status_changed', '{"entity_type": "projects"}', true, true, 'project_management', 1),
('00000000-0000-0000-0001-000000000003', NULL, 'Project Deadline Reminder', 'project-deadline-reminder', 'Send reminders before project deadlines', 'schedule', '{"cron": "0 9 * * *", "check_field": "end_date", "days_before": 7}', true, true, 'project_management', 1),
('00000000-0000-0000-0001-000000000004', NULL, 'Project Budget Alert', 'project-budget-alert', 'Alert when project budget exceeds threshold', 'field_changed', '{"entity_type": "projects", "field": "budget_spent", "threshold_percent": 80}', true, true, 'project_management', 1),

-- Task Workflows
('00000000-0000-0000-0001-000000000005', NULL, 'Task Assignment Notification', 'task-assignment-notification', 'Notify user when assigned to a task', 'entity_created', '{"entity_type": "task_assignments"}', true, true, 'task_management', 1),
('00000000-0000-0000-0001-000000000006', NULL, 'Task Due Date Reminder', 'task-due-date-reminder', 'Send reminder before task due date', 'schedule', '{"cron": "0 9 * * *", "check_field": "due_date", "days_before": 1}', true, true, 'task_management', 1),
('00000000-0000-0000-0001-000000000007', NULL, 'Task Overdue Alert', 'task-overdue-alert', 'Alert when task becomes overdue', 'schedule', '{"cron": "0 10 * * *", "check_condition": "overdue"}', true, true, 'task_management', 1),
('00000000-0000-0000-0001-000000000008', NULL, 'Task Completed Notification', 'task-completed-notification', 'Notify stakeholders when task is completed', 'status_changed', '{"entity_type": "tasks", "new_status": "done"}', true, true, 'task_management', 1),
('00000000-0000-0000-0001-000000000009', NULL, 'Task Priority Escalation', 'task-priority-escalation', 'Escalate task priority based on due date', 'schedule', '{"cron": "0 8 * * *", "auto_escalate": true}', true, true, 'task_management', 1),

-- Milestone Workflows
('00000000-0000-0000-0001-000000000010', NULL, 'Milestone Approaching', 'milestone-approaching', 'Notify when milestone is approaching', 'schedule', '{"cron": "0 9 * * 1", "check_field": "due_date", "days_before": 14}', true, true, 'project_management', 1),
('00000000-0000-0000-0001-000000000011', NULL, 'Milestone Completed', 'milestone-completed', 'Celebrate and notify when milestone is completed', 'status_changed', '{"entity_type": "milestones", "new_status": "completed"}', true, true, 'project_management', 1);

-- ============================================================================
-- EVENT & PRODUCTION WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0002-000000000001', NULL, 'Event Created Notification', 'event-created-notification', 'Notify team when new event is created', 'entity_created', '{"entity_type": "events"}', true, true, 'event_management', 1),
('00000000-0000-0000-0002-000000000002', NULL, 'Event Status Update', 'event-status-update', 'Handle event status transitions', 'status_changed', '{"entity_type": "events"}', true, true, 'event_management', 1),
('00000000-0000-0000-0002-000000000003', NULL, 'Event Countdown Reminder', 'event-countdown-reminder', 'Send countdown reminders before event', 'schedule', '{"cron": "0 9 * * *", "milestones": [30, 14, 7, 3, 1]}', true, true, 'event_management', 1),
('00000000-0000-0000-0002-000000000004', NULL, 'Show Call Published', 'show-call-published', 'Notify crew when show call is published', 'status_changed', '{"entity_type": "show_calls", "new_status": "published"}', true, true, 'production', 1),
('00000000-0000-0000-0002-000000000005', NULL, 'Runsheet Updated', 'runsheet-updated', 'Notify stakeholders when runsheet is updated', 'entity_updated', '{"entity_type": "runsheets"}', true, true, 'production', 1),
('00000000-0000-0000-0002-000000000006', NULL, 'Cue Sheet Finalized', 'cue-sheet-finalized', 'Lock and distribute cue sheet when finalized', 'status_changed', '{"entity_type": "cue_sheets", "new_status": "finalized"}', true, true, 'production', 1),
('00000000-0000-0000-0002-000000000007', NULL, 'Incident Report Created', 'incident-report-created', 'Alert management when incident is reported', 'entity_created', '{"entity_type": "incident_reports"}', true, true, 'production', 1),
('00000000-0000-0000-0002-000000000008', NULL, 'Production Note Added', 'production-note-added', 'Notify relevant parties of new production notes', 'entity_created', '{"entity_type": "production_notes"}', true, true, 'production', 1);

-- ============================================================================
-- WORKFORCE MANAGEMENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0003-000000000001', NULL, 'Crew Call Assignment', 'crew-call-assignment', 'Notify crew member of new assignment', 'entity_created', '{"entity_type": "crew_assignments"}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000002', NULL, 'Shift Reminder', 'shift-reminder', 'Send reminder before scheduled shift', 'schedule', '{"cron": "0 18 * * *", "hours_before": 12}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000003', NULL, 'Timesheet Submission Reminder', 'timesheet-submission-reminder', 'Remind users to submit timesheets', 'schedule', '{"cron": "0 9 * * 5"}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000004', NULL, 'Timesheet Approval Request', 'timesheet-approval-request', 'Request approval when timesheet is submitted', 'status_changed', '{"entity_type": "timesheets", "new_status": "submitted"}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000005', NULL, 'Timesheet Approved', 'timesheet-approved', 'Notify user when timesheet is approved', 'status_changed', '{"entity_type": "timesheets", "new_status": "approved"}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000006', NULL, 'Certification Expiring', 'certification-expiring', 'Alert when certification is about to expire', 'schedule', '{"cron": "0 9 * * 1", "days_before": 30}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000007', NULL, 'Availability Conflict', 'availability-conflict', 'Alert when scheduling conflict detected', 'entity_created', '{"entity_type": "crew_assignments", "check_conflicts": true}', true, true, 'workforce', 1),
('00000000-0000-0000-0003-000000000008', NULL, 'Overtime Alert', 'overtime-alert', 'Alert when user approaches overtime threshold', 'field_changed', '{"entity_type": "timesheet_entries", "threshold_hours": 40}', true, true, 'workforce', 1);

-- ============================================================================
-- ASSET MANAGEMENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0004-000000000001', NULL, 'Asset Check-Out', 'asset-check-out', 'Process asset check-out and notify', 'entity_created', '{"entity_type": "asset_check_actions", "action_type": "check_out"}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000002', NULL, 'Asset Check-In', 'asset-check-in', 'Process asset check-in and update status', 'entity_created', '{"entity_type": "asset_check_actions", "action_type": "check_in"}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000003', NULL, 'Asset Overdue Return', 'asset-overdue-return', 'Alert when asset return is overdue', 'schedule', '{"cron": "0 9 * * *", "check_condition": "overdue_return"}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000004', NULL, 'Maintenance Due', 'maintenance-due', 'Schedule maintenance when due date approaches', 'schedule', '{"cron": "0 8 * * 1", "days_before": 7}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000005', NULL, 'Asset Condition Alert', 'asset-condition-alert', 'Alert when asset condition changes to poor', 'field_changed', '{"entity_type": "assets", "field": "condition", "value": "poor"}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000006', NULL, 'Low Inventory Alert', 'low-inventory-alert', 'Alert when inventory falls below threshold', 'field_changed', '{"entity_type": "inventory_items", "field": "quantity", "below_minimum": true}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000007', NULL, 'Reservation Confirmation', 'reservation-confirmation', 'Confirm asset reservation and send details', 'entity_created', '{"entity_type": "asset_reservations"}', true, true, 'asset_management', 1),
('00000000-0000-0000-0004-000000000008', NULL, 'Reservation Reminder', 'reservation-reminder', 'Remind about upcoming asset reservation', 'schedule', '{"cron": "0 9 * * *", "days_before": 1}', true, true, 'asset_management', 1);

-- ============================================================================
-- FINANCE WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0005-000000000001', NULL, 'Invoice Created', 'invoice-created', 'Process new invoice and send to client', 'entity_created', '{"entity_type": "invoices"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000002', NULL, 'Invoice Payment Received', 'invoice-payment-received', 'Update invoice status when payment received', 'entity_created', '{"entity_type": "payments"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000003', NULL, 'Invoice Overdue', 'invoice-overdue', 'Send reminder for overdue invoices', 'schedule', '{"cron": "0 9 * * *", "check_condition": "overdue"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000004', NULL, 'Expense Submitted', 'expense-submitted', 'Route expense for approval', 'entity_created', '{"entity_type": "expenses"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000005', NULL, 'Expense Approved', 'expense-approved', 'Notify user and process approved expense', 'status_changed', '{"entity_type": "expenses", "new_status": "approved"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000006', NULL, 'Budget Threshold Alert', 'budget-threshold-alert', 'Alert when budget usage exceeds threshold', 'field_changed', '{"entity_type": "budgets", "threshold_percent": 80}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000007', NULL, 'Purchase Order Approval', 'purchase-order-approval', 'Route PO for approval based on amount', 'entity_created', '{"entity_type": "purchase_orders"}', true, true, 'finance', 1),
('00000000-0000-0000-0005-000000000008', NULL, 'Contract Expiring', 'contract-expiring', 'Alert when contract is about to expire', 'schedule', '{"cron": "0 9 * * 1", "days_before": 60}', true, true, 'finance', 1);

-- ============================================================================
-- CRM WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0006-000000000001', NULL, 'New Lead Created', 'new-lead-created', 'Process new lead and assign to sales rep', 'entity_created', '{"entity_type": "contacts", "is_lead": true}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000002', NULL, 'Deal Stage Changed', 'deal-stage-changed', 'Handle deal stage transitions', 'field_changed', '{"entity_type": "deals", "field": "stage_id"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000003', NULL, 'Deal Won', 'deal-won', 'Celebrate and process won deal', 'status_changed', '{"entity_type": "deals", "new_status": "won"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000004', NULL, 'Deal Lost', 'deal-lost', 'Process lost deal and gather feedback', 'status_changed', '{"entity_type": "deals", "new_status": "lost"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000005', NULL, 'Follow-up Reminder', 'follow-up-reminder', 'Remind sales rep to follow up', 'schedule', '{"cron": "0 9 * * *", "check_field": "next_follow_up"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000006', NULL, 'Proposal Sent', 'proposal-sent', 'Track and follow up on sent proposals', 'status_changed', '{"entity_type": "proposals", "new_status": "sent"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000007', NULL, 'Proposal Accepted', 'proposal-accepted', 'Process accepted proposal and create contract', 'status_changed', '{"entity_type": "proposals", "new_status": "accepted"}', true, true, 'crm', 1),
('00000000-0000-0000-0006-000000000008', NULL, 'Activity Logged', 'activity-logged', 'Update deal and contact records when activity logged', 'entity_created', '{"entity_type": "activities"}', true, true, 'crm', 1);

-- ============================================================================
-- CONTENT & TALENT WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0007-000000000001', NULL, 'Content Approval Request', 'content-approval-request', 'Route content for approval', 'entity_created', '{"entity_type": "content_approvals"}', true, true, 'content', 1),
('00000000-0000-0000-0007-000000000002', NULL, 'Content Approved', 'content-approved', 'Process approved content for publishing', 'status_changed', '{"entity_type": "content_approvals", "new_status": "approved"}', true, true, 'content', 1),
('00000000-0000-0000-0007-000000000003', NULL, 'Social Post Scheduled', 'social-post-scheduled', 'Queue social post for publishing', 'status_changed', '{"entity_type": "social_posts", "new_status": "scheduled"}', true, true, 'content', 1),
('00000000-0000-0000-0007-000000000004', NULL, 'Campaign Launched', 'campaign-launched', 'Activate campaign and notify team', 'status_changed', '{"entity_type": "campaigns", "new_status": "active"}', true, true, 'content', 1),
('00000000-0000-0000-0007-000000000005', NULL, 'Talent Booking Confirmed', 'talent-booking-confirmed', 'Process confirmed talent booking', 'status_changed', '{"entity_type": "talent_bookings", "new_status": "confirmed"}', true, true, 'talent', 1),
('00000000-0000-0000-0007-000000000006', NULL, 'Rider Requirements', 'rider-requirements', 'Process and assign rider requirements', 'entity_created', '{"entity_type": "riders"}', true, true, 'talent', 1),
('00000000-0000-0000-0007-000000000007', NULL, 'Talent Payment Due', 'talent-payment-due', 'Process talent payment when due', 'schedule', '{"cron": "0 9 * * *", "check_field": "payment_due_date"}', true, true, 'talent', 1);

-- ============================================================================
-- EXPERIENCE WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0008-000000000001', NULL, 'Ticket Order Confirmation', 'ticket-order-confirmation', 'Send confirmation for ticket order', 'entity_created', '{"entity_type": "ticket_orders"}', true, true, 'ticketing', 1),
('00000000-0000-0000-0008-000000000002', NULL, 'Ticket Check-In', 'ticket-check-in', 'Process ticket check-in at event', 'scan_event', '{"entity_type": "tickets", "action": "check_in"}', true, true, 'ticketing', 1),
('00000000-0000-0000-0008-000000000003', NULL, 'Guest List Updated', 'guest-list-updated', 'Notify when guest list is updated', 'entity_updated', '{"entity_type": "guest_lists"}', true, true, 'ticketing', 1),
('00000000-0000-0000-0008-000000000004', NULL, 'Hospitality Request', 'hospitality-request', 'Process hospitality request', 'entity_created', '{"entity_type": "hospitality_requests"}', true, true, 'hospitality', 1),
('00000000-0000-0000-0008-000000000005', NULL, 'Accommodation Booked', 'accommodation-booked', 'Confirm accommodation booking', 'status_changed', '{"entity_type": "accommodations", "new_status": "booked"}', true, true, 'hospitality', 1),
('00000000-0000-0000-0008-000000000006', NULL, 'Transportation Scheduled', 'transportation-scheduled', 'Confirm transportation schedule', 'entity_created', '{"entity_type": "transportation"}', true, true, 'hospitality', 1),
('00000000-0000-0000-0008-000000000007', NULL, 'Catering Order Placed', 'catering-order-placed', 'Process catering order', 'entity_created', '{"entity_type": "catering_orders"}', true, true, 'hospitality', 1);

-- ============================================================================
-- DOCUMENT & APPROVAL WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-0009-000000000001', NULL, 'Document Uploaded', 'document-uploaded', 'Process new document upload', 'entity_created', '{"entity_type": "documents"}', true, true, 'documents', 1),
('00000000-0000-0000-0009-000000000002', NULL, 'Document Shared', 'document-shared', 'Notify when document is shared', 'entity_created', '{"entity_type": "document_shares"}', true, true, 'documents', 1),
('00000000-0000-0000-0009-000000000003', NULL, 'Document Version Created', 'document-version-created', 'Notify stakeholders of new document version', 'entity_created', '{"entity_type": "document_versions"}', true, true, 'documents', 1),
('00000000-0000-0000-0009-000000000004', NULL, 'Approval Request Created', 'approval-request-created', 'Route approval request to approvers', 'entity_created', '{"entity_type": "approval_requests"}', true, true, 'approvals', 1),
('00000000-0000-0000-0009-000000000005', NULL, 'Approval Decision Made', 'approval-decision-made', 'Process approval decision', 'entity_created', '{"entity_type": "approval_decisions"}', true, true, 'approvals', 1),
('00000000-0000-0000-0009-000000000006', NULL, 'Approval Reminder', 'approval-reminder', 'Remind approvers of pending approvals', 'schedule', '{"cron": "0 9 * * *", "pending_hours": 24}', true, true, 'approvals', 1);

-- ============================================================================
-- SYSTEM & NOTIFICATION WORKFLOWS
-- ============================================================================

INSERT INTO workflow_templates (id, organization_id, name, slug, description, trigger_type, trigger_config, is_active, is_system, category, version) VALUES
('00000000-0000-0000-000a-000000000001', NULL, 'User Onboarding', 'user-onboarding', 'Welcome new user and setup account', 'entity_created', '{"entity_type": "organization_members"}', true, true, 'system', 1),
('00000000-0000-0000-000a-000000000002', NULL, 'Password Reset', 'password-reset', 'Handle password reset request', 'manual', '{"trigger": "password_reset"}', true, true, 'system', 1),
('00000000-0000-0000-000a-000000000003', NULL, 'Daily Digest', 'daily-digest', 'Send daily activity digest', 'schedule', '{"cron": "0 8 * * 1-5"}', true, true, 'system', 1),
('00000000-0000-0000-000a-000000000004', NULL, 'Weekly Summary', 'weekly-summary', 'Send weekly summary report', 'schedule', '{"cron": "0 9 * * 1"}', true, true, 'system', 1),
('00000000-0000-0000-000a-000000000005', NULL, 'Mention Notification', 'mention-notification', 'Notify user when mentioned', 'entity_created', '{"check_mentions": true}', true, true, 'system', 1),
('00000000-0000-0000-000a-000000000006', NULL, 'Comment Added', 'comment-added', 'Notify when comment is added to entity', 'entity_created', '{"entity_types": ["task_comments", "document_comments"]}', true, true, 'system', 1);

-- ============================================================================
-- WORKFLOW STEPS FOR KEY WORKFLOWS
-- ============================================================================

-- Steps for Task Assignment Notification workflow
INSERT INTO workflow_steps (id, workflow_template_id, name, step_type, position, config) VALUES
('00000000-0000-0000-0001-000000000101', '00000000-0000-0000-0001-000000000005', 'Get Assignee Details', 'action', 1, '{"action_type": "fetch_user", "user_field": "user_id"}'),
('00000000-0000-0000-0001-000000000102', '00000000-0000-0000-0001-000000000005', 'Get Task Details', 'action', 2, '{"action_type": "fetch_entity", "entity_type": "tasks", "id_field": "task_id"}'),
('00000000-0000-0000-0001-000000000103', '00000000-0000-0000-0001-000000000005', 'Send Notification', 'action', 3, '{"action_type": "send_notification", "template": "task_assigned", "channels": ["in_app", "email"]}');

-- Steps for Invoice Created workflow
INSERT INTO workflow_steps (id, workflow_template_id, name, step_type, position, config) VALUES
('00000000-0000-0000-0005-000000000101', '00000000-0000-0000-0005-000000000001', 'Generate Invoice PDF', 'action', 1, '{"action_type": "generate_pdf", "template": "invoice"}'),
('00000000-0000-0000-0005-000000000102', '00000000-0000-0000-0005-000000000001', 'Get Client Details', 'action', 2, '{"action_type": "fetch_entity", "entity_type": "contacts", "id_field": "contact_id"}'),
('00000000-0000-0000-0005-000000000103', '00000000-0000-0000-0005-000000000001', 'Send Invoice Email', 'action', 3, '{"action_type": "send_email", "template": "invoice_created", "attach_pdf": true}'),
('00000000-0000-0000-0005-000000000104', '00000000-0000-0000-0005-000000000001', 'Log Activity', 'action', 4, '{"action_type": "log_audit", "message": "Invoice sent to client"}');

-- Steps for Expense Approval workflow
INSERT INTO workflow_steps (id, workflow_template_id, name, step_type, position, config) VALUES
('00000000-0000-0000-0005-000000000401', '00000000-0000-0000-0005-000000000004', 'Check Amount Threshold', 'condition', 1, '{"condition_type": "field_greater_than", "field": "amount", "value": 500}'),
('00000000-0000-0000-0005-000000000402', '00000000-0000-0000-0005-000000000004', 'Route to Manager', 'action', 2, '{"action_type": "create_approval_request", "approver_type": "manager"}'),
('00000000-0000-0000-0005-000000000403', '00000000-0000-0000-0005-000000000004', 'Notify Submitter', 'action', 3, '{"action_type": "send_notification", "template": "expense_pending_approval"}');

-- Steps for Deal Won workflow
INSERT INTO workflow_steps (id, workflow_template_id, name, step_type, position, config) VALUES
('00000000-0000-0000-0006-000000000301', '00000000-0000-0000-0006-000000000003', 'Update Deal Record', 'action', 1, '{"action_type": "update_field", "field": "closed_at", "value": "{{now}}"}'),
('00000000-0000-0000-0006-000000000302', '00000000-0000-0000-0006-000000000003', 'Create Project', 'action', 2, '{"action_type": "create_entity", "entity_type": "projects", "copy_fields": ["name", "company_id"]}'),
('00000000-0000-0000-0006-000000000303', '00000000-0000-0000-0006-000000000003', 'Notify Sales Team', 'action', 3, '{"action_type": "send_notification", "template": "deal_won", "channels": ["in_app", "slack"]}'),
('00000000-0000-0000-0006-000000000304', '00000000-0000-0000-0006-000000000003', 'Update Company Status', 'action', 4, '{"action_type": "update_field", "entity_type": "companies", "field": "company_type", "value": "client"}');

-- Steps for Event Countdown workflow
INSERT INTO workflow_steps (id, workflow_template_id, name, step_type, position, config) VALUES
('00000000-0000-0000-0002-000000000301', '00000000-0000-0000-0002-000000000003', 'Check Days Until Event', 'condition', 1, '{"condition_type": "days_until", "field": "start_date", "values": [30, 14, 7, 3, 1]}'),
('00000000-0000-0000-0002-000000000302', '00000000-0000-0000-0002-000000000003', 'Get Event Team', 'action', 2, '{"action_type": "fetch_related", "relation": "event_team"}'),
('00000000-0000-0000-0002-000000000303', '00000000-0000-0000-0002-000000000003', 'Send Countdown Notification', 'action', 3, '{"action_type": "send_notification", "template": "event_countdown", "channels": ["in_app", "email"]}');
