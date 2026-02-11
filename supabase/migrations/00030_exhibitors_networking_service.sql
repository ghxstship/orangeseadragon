-- Migration: Exhibitors, Networking, and Service Hub Tables
-- Created: 2026-01-27
-- Description: Tables for exhibitor management, networking sessions, and service tickets

-- ============================================================================
-- EXHIBITORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS exhibitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  booth_number TEXT,
  booth_size TEXT CHECK (booth_size IN ('standard', 'premium', 'island', 'custom')),
  category TEXT CHECK (category IN ('technology', 'services', 'products', 'food_beverage', 'entertainment', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'setup_complete', 'active', 'cancelled')),
  contract_amount DECIMAL(12,2),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  setup_date DATE,
  teardown_date DATE,
  special_requirements TEXT,
  leads_collected INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exhibitors_event ON exhibitors(event_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_org ON exhibitors(org_id);

CREATE TABLE IF NOT EXISTS exhibitor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id UUID NOT NULL REFERENCES exhibitors(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exhibitor_leads_exhibitor ON exhibitor_leads(exhibitor_id);

-- ============================================================================
-- NETWORKING SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS networking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('speed_networking', 'roundtable', 'mixer', 'matchmaking', 'bof', 'open')),
  venue_space_id UUID REFERENCES venue_spaces(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INT,
  registered_count INT DEFAULT 0,
  description TEXT,
  matching_criteria TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')),
  requires_registration BOOLEAN DEFAULT TRUE,
  connections_made INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_networking_sessions_event ON networking_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_networking_sessions_org ON networking_sessions(org_id);

CREATE TABLE IF NOT EXISTS networking_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES networking_sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'no_show', 'cancelled')),
  interests TEXT,
  looking_for TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  UNIQUE(session_id, registration_id)
);

CREATE TABLE IF NOT EXISTS networking_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES networking_sessions(id) ON DELETE CASCADE,
  participant_1_id UUID NOT NULL REFERENCES networking_participants(id),
  participant_2_id UUID NOT NULL REFERENCES networking_participants(id),
  match_score DECIMAL(5,2),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'declined', 'completed')),
  meeting_time TIMESTAMPTZ,
  table_number TEXT,
  feedback_1 TEXT,
  feedback_2 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SERVICE TICKETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'technical', 'billing', 'account', 'feature', 'bug', 'complaint')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_third_party', 'resolved', 'closed')),
  assigned_to_id UUID REFERENCES contacts(id),
  channel TEXT CHECK (channel IN ('email', 'phone', 'chat', 'web', 'social')),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  satisfaction_rating INT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  related_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_tickets_org ON service_tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_contact ON service_tickets(contact_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status);

-- Auto-generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

DROP TRIGGER IF EXISTS set_ticket_number ON service_tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON service_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_id UUID,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Exhibitors
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exhibitors_org_read" ON exhibitors;
CREATE POLICY "exhibitors_org_read" ON exhibitors FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "exhibitors_org_insert" ON exhibitors;
CREATE POLICY "exhibitors_org_insert" ON exhibitors FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "exhibitors_org_update" ON exhibitors;
CREATE POLICY "exhibitors_org_update" ON exhibitors FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "exhibitors_org_delete" ON exhibitors;
CREATE POLICY "exhibitors_org_delete" ON exhibitors FOR DELETE USING (is_organization_member(org_id));

-- Networking Sessions
ALTER TABLE networking_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "networking_sessions_org_read" ON networking_sessions;
CREATE POLICY "networking_sessions_org_read" ON networking_sessions FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "networking_sessions_org_insert" ON networking_sessions;
CREATE POLICY "networking_sessions_org_insert" ON networking_sessions FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "networking_sessions_org_update" ON networking_sessions;
CREATE POLICY "networking_sessions_org_update" ON networking_sessions FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "networking_sessions_org_delete" ON networking_sessions;
CREATE POLICY "networking_sessions_org_delete" ON networking_sessions FOR DELETE USING (is_organization_member(org_id));

-- Service Tickets
ALTER TABLE service_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_tickets_org_read" ON service_tickets;
CREATE POLICY "service_tickets_org_read" ON service_tickets FOR SELECT USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "service_tickets_org_insert" ON service_tickets;
CREATE POLICY "service_tickets_org_insert" ON service_tickets FOR INSERT WITH CHECK (is_organization_member(org_id));
DROP POLICY IF EXISTS "service_tickets_org_update" ON service_tickets;
CREATE POLICY "service_tickets_org_update" ON service_tickets FOR UPDATE USING (is_organization_member(org_id));
DROP POLICY IF EXISTS "service_tickets_org_delete" ON service_tickets;
CREATE POLICY "service_tickets_org_delete" ON service_tickets FOR DELETE USING (is_organization_member(org_id));

COMMIT;
