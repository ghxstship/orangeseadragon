-- Extend enums with values needed by late migrations (20260129+)
-- This migration must be separate since ALTER TYPE ADD VALUE cannot run in a transaction block

-- support_ticket_status: workflow tables need 'resolved'
ALTER TYPE support_ticket_status ADD VALUE IF NOT EXISTS 'resolved';
