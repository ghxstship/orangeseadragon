-- RLS Policies: Gap Implementation Tables
-- Row Level Security for Phase 1-3 tables

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

-- Lookup Tables
ALTER TABLE registration_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;

-- Registration & Ticketing
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- Talent Management
ALTER TABLE talent ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_talent ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_riders ENABLE ROW LEVEL SECURITY;

-- Partner Management
ALTER TABLE event_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_benefits_granted ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_assignments ENABLE ROW LEVEL SECURITY;

-- Credential Management
ALTER TABLE issued_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_access_log ENABLE ROW LEVEL SECURITY;

-- Accounting / GL
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;

-- Lead Scoring
ALTER TABLE lead_score_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_score_events ENABLE ROW LEVEL SECURITY;

-- Email Campaigns
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- HR Onboarding
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_instance_items ENABLE ROW LEVEL SECURITY;

-- Leave Management
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- Procurement
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_items ENABLE ROW LEVEL SECURITY;

-- Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- LOOKUP TABLE POLICIES (Read by org members, write by admins)
-- ============================================================================

-- Generic policy creator for lookup tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'registration_types', 'talent_types', 'talent_roles', 'partner_types',
            'sponsorship_levels', 'credential_types', 'leave_types', 'ticket_categories',
            'account_types'
        ])
    LOOP
        -- Select policy
        EXECUTE format('
            DROP POLICY IF EXISTS %I_select ON %I;
            CREATE POLICY %I_select ON %I FOR SELECT
            USING (is_organization_member(organization_id));
        ', tbl, tbl, tbl, tbl);
        
        -- Insert policy
        EXECUTE format('
            DROP POLICY IF EXISTS %I_insert ON %I;
            CREATE POLICY %I_insert ON %I FOR INSERT
            WITH CHECK (is_organization_member(organization_id));
        ', tbl, tbl, tbl, tbl);
        
        -- Update policy
        EXECUTE format('
            DROP POLICY IF EXISTS %I_update ON %I;
            CREATE POLICY %I_update ON %I FOR UPDATE
            USING (is_organization_member(organization_id));
        ', tbl, tbl, tbl, tbl);
        
        -- Delete policy
        EXECUTE format('
            DROP POLICY IF EXISTS %I_delete ON %I;
            CREATE POLICY %I_delete ON %I FOR DELETE
            USING (is_organization_owner(organization_id));
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END;
$$;

-- Fiscal periods (special handling - finance team only for modifications)
DROP POLICY IF EXISTS fiscal_periods_select ON fiscal_periods;
CREATE POLICY fiscal_periods_select ON fiscal_periods FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS fiscal_periods_insert ON fiscal_periods;
CREATE POLICY fiscal_periods_insert ON fiscal_periods FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS fiscal_periods_update ON fiscal_periods;
CREATE POLICY fiscal_periods_update ON fiscal_periods FOR UPDATE
USING (is_organization_member(organization_id));

-- ============================================================================
-- REGISTRATION & TICKETING POLICIES
-- ============================================================================

-- Ticket Types
DROP POLICY IF EXISTS ticket_types_select ON ticket_types;
CREATE POLICY ticket_types_select ON ticket_types FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS ticket_types_insert ON ticket_types;
CREATE POLICY ticket_types_insert ON ticket_types FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS ticket_types_update ON ticket_types;
CREATE POLICY ticket_types_update ON ticket_types FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS ticket_types_delete ON ticket_types;
CREATE POLICY ticket_types_delete ON ticket_types FOR DELETE
USING (is_organization_member(organization_id));

-- Event Registrations
DROP POLICY IF EXISTS event_registrations_select ON event_registrations;
CREATE POLICY event_registrations_select ON event_registrations FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_registrations_insert ON event_registrations;
CREATE POLICY event_registrations_insert ON event_registrations FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_registrations_update ON event_registrations;
CREATE POLICY event_registrations_update ON event_registrations FOR UPDATE
USING (is_organization_member(organization_id));

-- Registration Line Items (via registration)
DROP POLICY IF EXISTS registration_line_items_select ON registration_line_items;
CREATE POLICY registration_line_items_select ON registration_line_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_registrations r
    WHERE r.id = registration_id AND is_organization_member(r.organization_id)
));

DROP POLICY IF EXISTS registration_line_items_insert ON registration_line_items;
CREATE POLICY registration_line_items_insert ON registration_line_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_registrations r
    WHERE r.id = registration_id AND is_organization_member(r.organization_id)
));

-- Promo Codes
DROP POLICY IF EXISTS promo_codes_select ON promo_codes;
CREATE POLICY promo_codes_select ON promo_codes FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS promo_codes_insert ON promo_codes;
CREATE POLICY promo_codes_insert ON promo_codes FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS promo_codes_update ON promo_codes;
CREATE POLICY promo_codes_update ON promo_codes FOR UPDATE
USING (is_organization_member(organization_id));

-- Event Waitlist
DROP POLICY IF EXISTS event_waitlist_select ON event_waitlist;
CREATE POLICY event_waitlist_select ON event_waitlist FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_waitlist_insert ON event_waitlist;
CREATE POLICY event_waitlist_insert ON event_waitlist FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_waitlist_update ON event_waitlist;
CREATE POLICY event_waitlist_update ON event_waitlist FOR UPDATE
USING (is_organization_member(organization_id));

-- ============================================================================
-- TALENT MANAGEMENT POLICIES
-- ============================================================================

-- Talent
DROP POLICY IF EXISTS talent_select ON talent;
CREATE POLICY talent_select ON talent FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS talent_insert ON talent;
CREATE POLICY talent_insert ON talent FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS talent_update ON talent;
CREATE POLICY talent_update ON talent FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS talent_delete ON talent;
CREATE POLICY talent_delete ON talent FOR DELETE
USING (is_organization_member(organization_id));

-- Talent Skills (via talent)
DROP POLICY IF EXISTS talent_skills_select ON talent_skills;
CREATE POLICY talent_skills_select ON talent_skills FOR SELECT
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_skills_insert ON talent_skills;
CREATE POLICY talent_skills_insert ON talent_skills FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_skills_delete ON talent_skills;
CREATE POLICY talent_skills_delete ON talent_skills FOR DELETE
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

-- Talent Social Links (via talent)
DROP POLICY IF EXISTS talent_social_links_select ON talent_social_links;
CREATE POLICY talent_social_links_select ON talent_social_links FOR SELECT
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_social_links_insert ON talent_social_links;
CREATE POLICY talent_social_links_insert ON talent_social_links FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

-- Talent Media (via talent)
DROP POLICY IF EXISTS talent_media_select ON talent_media;
CREATE POLICY talent_media_select ON talent_media FOR SELECT
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_media_insert ON talent_media;
CREATE POLICY talent_media_insert ON talent_media FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

-- Session Talent (via session -> event)
DROP POLICY IF EXISTS session_talent_select ON session_talent;
CREATE POLICY session_talent_select ON session_talent FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_sessions s
    JOIN events e ON e.id = s.event_id
    WHERE s.id = session_id AND is_organization_member(e.organization_id)
));

DROP POLICY IF EXISTS session_talent_insert ON session_talent;
CREATE POLICY session_talent_insert ON session_talent FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_sessions s
    JOIN events e ON e.id = s.event_id
    WHERE s.id = session_id AND is_organization_member(e.organization_id)
));

DROP POLICY IF EXISTS session_talent_update ON session_talent;
CREATE POLICY session_talent_update ON session_talent FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM event_sessions s
    JOIN events e ON e.id = s.event_id
    WHERE s.id = session_id AND is_organization_member(e.organization_id)
));

-- Talent Riders (via talent)
DROP POLICY IF EXISTS talent_riders_select ON talent_riders;
CREATE POLICY talent_riders_select ON talent_riders FOR SELECT
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_riders_insert ON talent_riders;
CREATE POLICY talent_riders_insert ON talent_riders FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS talent_riders_update ON talent_riders;
CREATE POLICY talent_riders_update ON talent_riders FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM talent t WHERE t.id = talent_id AND is_organization_member(t.organization_id)
));

-- ============================================================================
-- PARTNER MANAGEMENT POLICIES
-- ============================================================================

-- Event Partners
DROP POLICY IF EXISTS event_partners_select ON event_partners;
CREATE POLICY event_partners_select ON event_partners FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_partners_insert ON event_partners;
CREATE POLICY event_partners_insert ON event_partners FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_partners_update ON event_partners;
CREATE POLICY event_partners_update ON event_partners FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS event_partners_delete ON event_partners;
CREATE POLICY event_partners_delete ON event_partners FOR DELETE
USING (is_organization_member(organization_id));

-- Partner Contacts (via partner)
DROP POLICY IF EXISTS partner_contacts_select ON partner_contacts;
CREATE POLICY partner_contacts_select ON partner_contacts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS partner_contacts_insert ON partner_contacts;
CREATE POLICY partner_contacts_insert ON partner_contacts FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

-- Sponsorship Benefits
DROP POLICY IF EXISTS sponsorship_benefits_select ON sponsorship_benefits;
CREATE POLICY sponsorship_benefits_select ON sponsorship_benefits FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS sponsorship_benefits_insert ON sponsorship_benefits;
CREATE POLICY sponsorship_benefits_insert ON sponsorship_benefits FOR INSERT
WITH CHECK (is_organization_member(organization_id));

-- Partner Benefits Granted (via partner)
DROP POLICY IF EXISTS partner_benefits_granted_select ON partner_benefits_granted;
CREATE POLICY partner_benefits_granted_select ON partner_benefits_granted FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS partner_benefits_granted_insert ON partner_benefits_granted;
CREATE POLICY partner_benefits_granted_insert ON partner_benefits_granted FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

-- Partner Deliverables (via partner)
DROP POLICY IF EXISTS partner_deliverables_select ON partner_deliverables;
CREATE POLICY partner_deliverables_select ON partner_deliverables FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS partner_deliverables_insert ON partner_deliverables;
CREATE POLICY partner_deliverables_insert ON partner_deliverables FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS partner_deliverables_update ON partner_deliverables;
CREATE POLICY partner_deliverables_update ON partner_deliverables FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

-- Booth Assignments (via partner)
DROP POLICY IF EXISTS booth_assignments_select ON booth_assignments;
CREATE POLICY booth_assignments_select ON booth_assignments FOR SELECT
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS booth_assignments_insert ON booth_assignments;
CREATE POLICY booth_assignments_insert ON booth_assignments FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

DROP POLICY IF EXISTS booth_assignments_update ON booth_assignments;
CREATE POLICY booth_assignments_update ON booth_assignments FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM event_partners p WHERE p.id = partner_id AND is_organization_member(p.organization_id)
));

-- ============================================================================
-- CREDENTIAL MANAGEMENT POLICIES
-- ============================================================================

-- Issued Credentials
DROP POLICY IF EXISTS issued_credentials_select ON issued_credentials;
CREATE POLICY issued_credentials_select ON issued_credentials FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS issued_credentials_insert ON issued_credentials;
CREATE POLICY issued_credentials_insert ON issued_credentials FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS issued_credentials_update ON issued_credentials;
CREATE POLICY issued_credentials_update ON issued_credentials FOR UPDATE
USING (is_organization_member(organization_id));

-- Credential Access Log (via credential)
DROP POLICY IF EXISTS credential_access_log_select ON credential_access_log;
CREATE POLICY credential_access_log_select ON credential_access_log FOR SELECT
USING (EXISTS (
    SELECT 1 FROM issued_credentials c WHERE c.id = credential_id AND is_organization_member(c.organization_id)
));

DROP POLICY IF EXISTS credential_access_log_insert ON credential_access_log;
CREATE POLICY credential_access_log_insert ON credential_access_log FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM issued_credentials c WHERE c.id = credential_id AND is_organization_member(c.organization_id)
));

-- ============================================================================
-- ACCOUNTING / GL POLICIES
-- ============================================================================

-- Chart of Accounts
DROP POLICY IF EXISTS chart_of_accounts_select ON chart_of_accounts;
CREATE POLICY chart_of_accounts_select ON chart_of_accounts FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS chart_of_accounts_insert ON chart_of_accounts;
CREATE POLICY chart_of_accounts_insert ON chart_of_accounts FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS chart_of_accounts_update ON chart_of_accounts;
CREATE POLICY chart_of_accounts_update ON chart_of_accounts FOR UPDATE
USING (is_organization_member(organization_id));

-- Journal Entries (immutable - no update/delete)
DROP POLICY IF EXISTS journal_entries_select ON journal_entries;
CREATE POLICY journal_entries_select ON journal_entries FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS journal_entries_insert ON journal_entries;
CREATE POLICY journal_entries_insert ON journal_entries FOR INSERT
WITH CHECK (is_organization_member(organization_id));

-- Journal Entry Lines (via entry)
DROP POLICY IF EXISTS journal_entry_lines_select ON journal_entry_lines;
CREATE POLICY journal_entry_lines_select ON journal_entry_lines FOR SELECT
USING (EXISTS (
    SELECT 1 FROM journal_entries je WHERE je.id = journal_entry_id AND is_organization_member(je.organization_id)
));

DROP POLICY IF EXISTS journal_entry_lines_insert ON journal_entry_lines;
CREATE POLICY journal_entry_lines_insert ON journal_entry_lines FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM journal_entries je WHERE je.id = journal_entry_id AND is_organization_member(je.organization_id)
));

-- Bank Accounts
DROP POLICY IF EXISTS bank_accounts_select ON bank_accounts;
CREATE POLICY bank_accounts_select ON bank_accounts FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS bank_accounts_insert ON bank_accounts;
CREATE POLICY bank_accounts_insert ON bank_accounts FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS bank_accounts_update ON bank_accounts;
CREATE POLICY bank_accounts_update ON bank_accounts FOR UPDATE
USING (is_organization_member(organization_id));

-- Bank Transactions (via bank account)
DROP POLICY IF EXISTS bank_transactions_select ON bank_transactions;
CREATE POLICY bank_transactions_select ON bank_transactions FOR SELECT
USING (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

DROP POLICY IF EXISTS bank_transactions_insert ON bank_transactions;
CREATE POLICY bank_transactions_insert ON bank_transactions FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

DROP POLICY IF EXISTS bank_transactions_update ON bank_transactions;
CREATE POLICY bank_transactions_update ON bank_transactions FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

-- Bank Reconciliations (via bank account)
DROP POLICY IF EXISTS bank_reconciliations_select ON bank_reconciliations;
CREATE POLICY bank_reconciliations_select ON bank_reconciliations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

DROP POLICY IF EXISTS bank_reconciliations_insert ON bank_reconciliations;
CREATE POLICY bank_reconciliations_insert ON bank_reconciliations FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

DROP POLICY IF EXISTS bank_reconciliations_update ON bank_reconciliations;
CREATE POLICY bank_reconciliations_update ON bank_reconciliations FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM bank_accounts ba WHERE ba.id = bank_account_id AND is_organization_member(ba.organization_id)
));

-- ============================================================================
-- LEAD SCORING POLICIES
-- ============================================================================

-- Lead Score Rules
DROP POLICY IF EXISTS lead_score_rules_select ON lead_score_rules;
CREATE POLICY lead_score_rules_select ON lead_score_rules FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS lead_score_rules_insert ON lead_score_rules;
CREATE POLICY lead_score_rules_insert ON lead_score_rules FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS lead_score_rules_update ON lead_score_rules;
CREATE POLICY lead_score_rules_update ON lead_score_rules FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS lead_score_rules_delete ON lead_score_rules;
CREATE POLICY lead_score_rules_delete ON lead_score_rules FOR DELETE
USING (is_organization_member(organization_id));

-- Lead Score Events (via lead)
DROP POLICY IF EXISTS lead_score_events_select ON lead_score_events;
CREATE POLICY lead_score_events_select ON lead_score_events FOR SELECT
USING (EXISTS (
    SELECT 1 FROM leads l WHERE l.id = lead_id AND is_organization_member(l.organization_id)
));

DROP POLICY IF EXISTS lead_score_events_insert ON lead_score_events;
CREATE POLICY lead_score_events_insert ON lead_score_events FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM leads l WHERE l.id = lead_id AND is_organization_member(l.organization_id)
));

-- ============================================================================
-- EMAIL CAMPAIGN POLICIES
-- ============================================================================

-- Email Templates
DROP POLICY IF EXISTS email_templates_select ON email_templates;
CREATE POLICY email_templates_select ON email_templates FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS email_templates_insert ON email_templates;
CREATE POLICY email_templates_insert ON email_templates FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS email_templates_update ON email_templates;
CREATE POLICY email_templates_update ON email_templates FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS email_templates_delete ON email_templates;
CREATE POLICY email_templates_delete ON email_templates FOR DELETE
USING (is_organization_member(organization_id));

-- Campaigns
DROP POLICY IF EXISTS campaigns_select ON campaigns;
CREATE POLICY campaigns_select ON campaigns FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS campaigns_insert ON campaigns;
CREATE POLICY campaigns_insert ON campaigns FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS campaigns_update ON campaigns;
CREATE POLICY campaigns_update ON campaigns FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS campaigns_delete ON campaigns;
CREATE POLICY campaigns_delete ON campaigns FOR DELETE
USING (is_organization_member(organization_id));

-- Campaign Recipients (via campaign)
DROP POLICY IF EXISTS campaign_recipients_select ON campaign_recipients;
CREATE POLICY campaign_recipients_select ON campaign_recipients FOR SELECT
USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_organization_member(c.organization_id)
));

DROP POLICY IF EXISTS campaign_recipients_insert ON campaign_recipients;
CREATE POLICY campaign_recipients_insert ON campaign_recipients FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_organization_member(c.organization_id)
));

DROP POLICY IF EXISTS campaign_recipients_update ON campaign_recipients;
CREATE POLICY campaign_recipients_update ON campaign_recipients FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_organization_member(c.organization_id)
));

-- ============================================================================
-- HR ONBOARDING POLICIES
-- ============================================================================

-- Onboarding Templates
DROP POLICY IF EXISTS onboarding_templates_select ON onboarding_templates;
CREATE POLICY onboarding_templates_select ON onboarding_templates FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS onboarding_templates_insert ON onboarding_templates;
CREATE POLICY onboarding_templates_insert ON onboarding_templates FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS onboarding_templates_update ON onboarding_templates;
CREATE POLICY onboarding_templates_update ON onboarding_templates FOR UPDATE
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS onboarding_templates_delete ON onboarding_templates;
CREATE POLICY onboarding_templates_delete ON onboarding_templates FOR DELETE
USING (is_organization_member(organization_id));

-- Onboarding Items (via template)
DROP POLICY IF EXISTS onboarding_items_select ON onboarding_items;
CREATE POLICY onboarding_items_select ON onboarding_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM onboarding_templates t WHERE t.id = template_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS onboarding_items_insert ON onboarding_items;
CREATE POLICY onboarding_items_insert ON onboarding_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM onboarding_templates t WHERE t.id = template_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS onboarding_items_update ON onboarding_items;
CREATE POLICY onboarding_items_update ON onboarding_items FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM onboarding_templates t WHERE t.id = template_id AND is_organization_member(t.organization_id)
));

DROP POLICY IF EXISTS onboarding_items_delete ON onboarding_items;
CREATE POLICY onboarding_items_delete ON onboarding_items FOR DELETE
USING (EXISTS (
    SELECT 1 FROM onboarding_templates t WHERE t.id = template_id AND is_organization_member(t.organization_id)
));

-- Onboarding Instances
DROP POLICY IF EXISTS onboarding_instances_select ON onboarding_instances;
CREATE POLICY onboarding_instances_select ON onboarding_instances FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS onboarding_instances_insert ON onboarding_instances;
CREATE POLICY onboarding_instances_insert ON onboarding_instances FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS onboarding_instances_update ON onboarding_instances;
CREATE POLICY onboarding_instances_update ON onboarding_instances FOR UPDATE
USING (is_organization_member(organization_id));

-- Onboarding Instance Items (via instance)
DROP POLICY IF EXISTS onboarding_instance_items_select ON onboarding_instance_items;
CREATE POLICY onboarding_instance_items_select ON onboarding_instance_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM onboarding_instances i WHERE i.id = instance_id AND is_organization_member(i.organization_id)
));

DROP POLICY IF EXISTS onboarding_instance_items_insert ON onboarding_instance_items;
CREATE POLICY onboarding_instance_items_insert ON onboarding_instance_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM onboarding_instances i WHERE i.id = instance_id AND is_organization_member(i.organization_id)
));

DROP POLICY IF EXISTS onboarding_instance_items_update ON onboarding_instance_items;
CREATE POLICY onboarding_instance_items_update ON onboarding_instance_items FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM onboarding_instances i WHERE i.id = instance_id AND is_organization_member(i.organization_id)
));

-- ============================================================================
-- LEAVE MANAGEMENT POLICIES
-- ============================================================================

-- Leave Requests
DROP POLICY IF EXISTS leave_requests_select ON leave_requests;
CREATE POLICY leave_requests_select ON leave_requests FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS leave_requests_insert ON leave_requests;
CREATE POLICY leave_requests_insert ON leave_requests FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS leave_requests_update ON leave_requests;
CREATE POLICY leave_requests_update ON leave_requests FOR UPDATE
USING (is_organization_member(organization_id));

-- Leave Balances (via staff member)
DROP POLICY IF EXISTS leave_balances_select ON leave_balances;
CREATE POLICY leave_balances_select ON leave_balances FOR SELECT
USING (EXISTS (
    SELECT 1 FROM staff_members sm WHERE sm.id = staff_member_id AND is_organization_member(sm.organization_id)
));

DROP POLICY IF EXISTS leave_balances_insert ON leave_balances;
CREATE POLICY leave_balances_insert ON leave_balances FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM staff_members sm WHERE sm.id = staff_member_id AND is_organization_member(sm.organization_id)
));

DROP POLICY IF EXISTS leave_balances_update ON leave_balances;
CREATE POLICY leave_balances_update ON leave_balances FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM staff_members sm WHERE sm.id = staff_member_id AND is_organization_member(sm.organization_id)
));

-- ============================================================================
-- PROCUREMENT POLICIES
-- ============================================================================

-- Purchase Orders
DROP POLICY IF EXISTS purchase_orders_select ON purchase_orders;
CREATE POLICY purchase_orders_select ON purchase_orders FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS purchase_orders_insert ON purchase_orders;
CREATE POLICY purchase_orders_insert ON purchase_orders FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS purchase_orders_update ON purchase_orders;
CREATE POLICY purchase_orders_update ON purchase_orders FOR UPDATE
USING (is_organization_member(organization_id));

-- Purchase Order Items (via PO)
DROP POLICY IF EXISTS purchase_order_items_select ON purchase_order_items;
CREATE POLICY purchase_order_items_select ON purchase_order_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM purchase_orders po WHERE po.id = purchase_order_id AND is_organization_member(po.organization_id)
));

DROP POLICY IF EXISTS purchase_order_items_insert ON purchase_order_items;
CREATE POLICY purchase_order_items_insert ON purchase_order_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM purchase_orders po WHERE po.id = purchase_order_id AND is_organization_member(po.organization_id)
));

DROP POLICY IF EXISTS purchase_order_items_update ON purchase_order_items;
CREATE POLICY purchase_order_items_update ON purchase_order_items FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM purchase_orders po WHERE po.id = purchase_order_id AND is_organization_member(po.organization_id)
));

-- Goods Receipts
DROP POLICY IF EXISTS goods_receipts_select ON goods_receipts;
CREATE POLICY goods_receipts_select ON goods_receipts FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS goods_receipts_insert ON goods_receipts;
CREATE POLICY goods_receipts_insert ON goods_receipts FOR INSERT
WITH CHECK (is_organization_member(organization_id));

-- Goods Receipt Items (via receipt)
DROP POLICY IF EXISTS goods_receipt_items_select ON goods_receipt_items;
CREATE POLICY goods_receipt_items_select ON goods_receipt_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM goods_receipts gr WHERE gr.id = goods_receipt_id AND is_organization_member(gr.organization_id)
));

DROP POLICY IF EXISTS goods_receipt_items_insert ON goods_receipt_items;
CREATE POLICY goods_receipt_items_insert ON goods_receipt_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM goods_receipts gr WHERE gr.id = goods_receipt_id AND is_organization_member(gr.organization_id)
));

-- ============================================================================
-- SUPPORT TICKET POLICIES
-- ============================================================================

-- Support Tickets
DROP POLICY IF EXISTS support_tickets_select ON support_tickets;
CREATE POLICY support_tickets_select ON support_tickets FOR SELECT
USING (is_organization_member(organization_id));

DROP POLICY IF EXISTS support_tickets_insert ON support_tickets;
CREATE POLICY support_tickets_insert ON support_tickets FOR INSERT
WITH CHECK (is_organization_member(organization_id));

DROP POLICY IF EXISTS support_tickets_update ON support_tickets;
CREATE POLICY support_tickets_update ON support_tickets FOR UPDATE
USING (is_organization_member(organization_id));

-- Ticket Comments (via ticket)
DROP POLICY IF EXISTS ticket_comments_select ON ticket_comments;
CREATE POLICY ticket_comments_select ON ticket_comments FOR SELECT
USING (EXISTS (
    SELECT 1 FROM support_tickets st WHERE st.id = ticket_id AND is_organization_member(st.organization_id)
));

DROP POLICY IF EXISTS ticket_comments_insert ON ticket_comments;
CREATE POLICY ticket_comments_insert ON ticket_comments FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM support_tickets st WHERE st.id = ticket_id AND is_organization_member(st.organization_id)
));
