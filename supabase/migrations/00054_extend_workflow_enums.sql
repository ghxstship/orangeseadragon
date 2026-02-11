-- Extend enums with values needed by subsequent migrations
-- This migration must be separate since ALTER TYPE ADD VALUE cannot run in a transaction block

-- workflow_trigger_type: CRM automation triggers
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'deal_stage_changed';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'deal_created';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'contact_created';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'lead_score_changed';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'email_opened';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'meeting_booked';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'deal_rotting';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE workflow_trigger_type ADD VALUE IF NOT EXISTS 'event';

-- assignment_status: crew scheduling
ALTER TYPE assignment_status ADD VALUE IF NOT EXISTS 'cancelled';

-- budget_status: finance enhancements
ALTER TYPE budget_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE budget_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE budget_status ADD VALUE IF NOT EXISTS 'tentative';

-- invoice_direction: multi-currency
ALTER TYPE invoice_direction ADD VALUE IF NOT EXISTS 'incoming';
ALTER TYPE invoice_direction ADD VALUE IF NOT EXISTS 'outgoing';

-- invoice_type: finance enhancements
ALTER TYPE invoice_type ADD VALUE IF NOT EXISTS 'sponsorship';
ALTER TYPE invoice_type ADD VALUE IF NOT EXISTS 'ticket_sales';

-- po_status: finance enhancements
ALTER TYPE po_status ADD VALUE IF NOT EXISTS 'approved';
