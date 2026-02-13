-- ============================================================================
-- Migration 00111: FK Constraint Remediation, Cascade Standardization & Indexes
-- ============================================================================
-- Phase 3: Add missing FK constraints to unlinked non-polymorphic UUID columns
-- Phase 4: Standardize ON DELETE behavior (RESTRICT for financial/compliance,
--          CASCADE for org-scoped, SET NULL for optional references)
-- Phase 5: Add missing indexes on FK columns for query performance
--
-- All operations are idempotent (safe to re-run).
-- Polymorphic columns (entity_id, target_id, source_id, etc.) are excluded
-- as they reference multiple tables and cannot have standard FK constraints.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: Idempotent FK addition
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: SUPPORT TICKETS & COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_contact' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_company' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_category' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_assigned_user' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_assigned_user FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_assigned_team' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_assigned_team FOREIGN KEY (assigned_team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_event' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_support_tickets_registration' AND table_name = 'support_tickets') THEN
    ALTER TABLE support_tickets ADD CONSTRAINT fk_support_tickets_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_ticket_comments_author' AND table_name = 'ticket_comments') THEN
    ALTER TABLE ticket_comments ADD CONSTRAINT fk_ticket_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_ticket_comments_author_contact' AND table_name = 'ticket_comments') THEN
    ALTER TABLE ticket_comments ADD CONSTRAINT fk_ticket_comments_author_contact FOREIGN KEY (author_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: PURCHASE ORDERS & LINE ITEMS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_purchase_orders_shipping_addr' AND table_name = 'purchase_orders') THEN
    ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_shipping_addr FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_purchase_orders_billing_addr' AND table_name = 'purchase_orders') THEN
    ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_billing_addr FOREIGN KEY (billing_address_id) REFERENCES addresses(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_purchase_orders_currency' AND table_name = 'purchase_orders') THEN
    ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_currency FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_po_items_asset' AND table_name = 'purchase_order_items') THEN
    ALTER TABLE purchase_order_items ADD CONSTRAINT fk_po_items_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_po_items_gl_account' AND table_name = 'purchase_order_items') THEN
    ALTER TABLE purchase_order_items ADD CONSTRAINT fk_po_items_gl_account FOREIGN KEY (gl_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: TIME ENTRIES
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_organization' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_employee' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_employee FOREIGN KEY (employee_id) REFERENCES employee_profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_event' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_shift' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_clock_in' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_clock_in FOREIGN KEY (clock_in_punch_id) REFERENCES time_punches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_time_entries_clock_out' AND table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD CONSTRAINT fk_time_entries_clock_out FOREIGN KEY (clock_out_punch_id) REFERENCES time_punches(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: HOSPITALITY REQUESTS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hospitality_org' AND table_name = 'hospitality_requests') THEN
    ALTER TABLE hospitality_requests ADD CONSTRAINT fk_hospitality_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hospitality_contact' AND table_name = 'hospitality_requests') THEN
    ALTER TABLE hospitality_requests ADD CONSTRAINT fk_hospitality_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hospitality_vendor' AND table_name = 'hospitality_requests') THEN
    ALTER TABLE hospitality_requests ADD CONSTRAINT fk_hospitality_vendor FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_hospitality_approved_by' AND table_name = 'hospitality_requests') THEN
    ALTER TABLE hospitality_requests ADD CONSTRAINT fk_hospitality_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 5: EMAIL & CAMPAIGNS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_email_messages_template' AND table_name = 'email_messages') THEN
    ALTER TABLE email_messages ADD CONSTRAINT fk_email_messages_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_email_messages_sequence' AND table_name = 'email_messages') THEN
    ALTER TABLE email_messages ADD CONSTRAINT fk_email_messages_sequence FOREIGN KEY (sequence_id) REFERENCES email_sequences(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_campaigns_template' AND table_name = 'campaigns') THEN
    ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_template FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_landing_pages_campaign' AND table_name = 'landing_pages') THEN
    ALTER TABLE landing_pages ADD CONSTRAINT fk_landing_pages_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 6: FINANCE — INVOICES, PAYMENTS, JOURNALS (RESTRICT for financial)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_invoice_reminder_log_invoice' AND table_name = 'invoice_reminder_log') THEN
    ALTER TABLE invoice_reminder_log ADD CONSTRAINT fk_invoice_reminder_log_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_invoice_automation_rules_client' AND table_name = 'invoice_automation_rules') THEN
    ALTER TABLE invoice_automation_rules ADD CONSTRAINT fk_invoice_automation_rules_client FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_recurring_invoices_template' AND table_name = 'recurring_invoices') THEN
    ALTER TABLE recurring_invoices ADD CONSTRAINT fk_recurring_invoices_template FOREIGN KEY (invoice_template_id) REFERENCES invoice_templates(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_revenue_recognitions_invoice' AND table_name = 'revenue_recognitions') THEN
    ALTER TABLE revenue_recognitions ADD CONSTRAINT fk_revenue_recognitions_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_financial_ledger_budget_cat' AND table_name = 'financial_ledger') THEN
    ALTER TABLE financial_ledger ADD CONSTRAINT fk_financial_ledger_budget_cat FOREIGN KEY (budget_category_id) REFERENCES budget_categories(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_expense_approval_levels_approver' AND table_name = 'expense_approval_levels') THEN
    ALTER TABLE expense_approval_levels ADD CONSTRAINT fk_expense_approval_levels_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 7: LOGISTICS — SHIPMENTS, LOAD PLANS, PACKING
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_shipments_carrier' AND table_name = 'shipments') THEN
    ALTER TABLE shipments ADD CONSTRAINT fk_shipments_carrier FOREIGN KEY (carrier_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_load_plans_vehicle' AND table_name = 'load_plans') THEN
    ALTER TABLE load_plans ADD CONSTRAINT fk_load_plans_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 8: CREW & WORKFORCE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_crew_assignments_member' AND table_name = 'crew_assignments') THEN
    ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_member FOREIGN KEY (crew_member_id) REFERENCES employee_profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_crew_assignments_event' AND table_name = 'crew_assignments') THEN
    ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_crew_assignments_advance' AND table_name = 'crew_assignments') THEN
    ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_advance FOREIGN KEY (advance_id) REFERENCES production_advances(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_crew_assignments_advance_item' AND table_name = 'crew_assignments') THEN
    ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_advance_item FOREIGN KEY (advance_item_id) REFERENCES advance_items(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_meal_penalties_checkin' AND table_name = 'meal_penalties') THEN
    ALTER TABLE meal_penalties ADD CONSTRAINT fk_meal_penalties_checkin FOREIGN KEY (crew_checkin_id) REFERENCES crew_checkins(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 9: DEALS & CRM
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_deals_pipeline' AND table_name = 'deals') THEN
    ALTER TABLE deals ADD CONSTRAINT fk_deals_pipeline FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_deals_stage' AND table_name = 'deals') THEN
    ALTER TABLE deals ADD CONSTRAINT fk_deals_stage FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_deals_lead' AND table_name = 'deals') THEN
    ALTER TABLE deals ADD CONSTRAINT fk_deals_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_leads_assignee' AND table_name = 'leads') THEN
    ALTER TABLE leads ADD CONSTRAINT fk_leads_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_leads_converted_deal' AND table_name = 'leads') THEN
    ALTER TABLE leads ADD CONSTRAINT fk_leads_converted_deal FOREIGN KEY (converted_deal_id) REFERENCES deals(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_rfp_responses_client' AND table_name = 'rfp_responses') THEN
    ALTER TABLE rfp_responses ADD CONSTRAINT fk_rfp_responses_client FOREIGN KEY (client_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_quotas_team' AND table_name = 'quotas') THEN
    ALTER TABLE quotas ADD CONSTRAINT fk_quotas_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 10: EVENTS & VENUES
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_event_partners_org' AND table_name = 'event_partners') THEN
    ALTER TABLE event_partners ADD CONSTRAINT fk_event_partners_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_ticket_types_currency' AND table_name = 'ticket_types') THEN
    ALTER TABLE ticket_types ADD CONSTRAINT fk_ticket_types_currency FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_venue_holds_converted' AND table_name = 'venue_holds') THEN
    ALTER TABLE venue_holds ADD CONSTRAINT fk_venue_holds_converted FOREIGN KEY (converted_to_booking_id) REFERENCES resource_bookings(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 11: DOCUMENTS & DIGITAL SIGNATURES
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_digital_signatures_document' AND table_name = 'digital_signatures') THEN
    ALTER TABLE digital_signatures ADD CONSTRAINT fk_digital_signatures_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 12: NETWORK & SOCIAL
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_follows_following' AND table_name = 'user_follows') THEN
    ALTER TABLE user_follows ADD CONSTRAINT fk_user_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_discussion_replies_parent' AND table_name = 'discussion_replies') THEN
    ALTER TABLE discussion_replies ADD CONSTRAINT fk_discussion_replies_parent FOREIGN KEY (parent_reply_id) REFERENCES discussion_replies(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 13: VENDOR PAYMENTS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_vendor_payment_schedules_vendor' AND table_name = 'vendor_payment_schedules') THEN
    ALTER TABLE vendor_payment_schedules ADD CONSTRAINT fk_vendor_payment_schedules_vendor FOREIGN KEY (vendor_id) REFERENCES companies(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 14: MEETING TYPES
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_meeting_types_confirm_email' AND table_name = 'meeting_types') THEN
    ALTER TABLE meeting_types ADD CONSTRAINT fk_meeting_types_confirm_email FOREIGN KEY (confirmation_email_template_id) REFERENCES email_templates(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_meeting_types_reminder_email' AND table_name = 'meeting_types') THEN
    ALTER TABLE meeting_types ADD CONSTRAINT fk_meeting_types_reminder_email FOREIGN KEY (reminder_email_template_id) REFERENCES email_templates(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 15: WEBHOOKS & INTEGRATIONS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_webhook_deliveries_endpoint' AND table_name = 'webhook_deliveries') THEN
    ALTER TABLE webhook_deliveries ADD CONSTRAINT fk_webhook_deliveries_endpoint FOREIGN KEY (webhook_endpoint_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 16: REPORTING
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_report_formula_fields_def' AND table_name = 'report_formula_fields') THEN
    ALTER TABLE report_formula_fields ADD CONSTRAINT fk_report_formula_fields_def FOREIGN KEY (report_definition_id) REFERENCES report_definitions(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_report_schedules_org' AND table_name = 'report_schedules') THEN
    ALTER TABLE report_schedules ADD CONSTRAINT fk_report_schedules_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 17: PUNCH ITEMS & INSPECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_punch_items_inspection' AND table_name = 'punch_items') THEN
    ALTER TABLE punch_items ADD CONSTRAINT fk_punch_items_inspection FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 18: FORM SUBMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_form_submissions_contact' AND table_name = 'form_submissions') THEN
    ALTER TABLE form_submissions ADD CONSTRAINT fk_form_submissions_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 19: CURRENCIES & ORG SCOPING
-- ═══════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_currencies_organization' AND table_name = 'currencies') THEN
    ALTER TABLE currencies ADD CONSTRAINT fk_currencies_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 5: MISSING INDEXES ON FK COLUMNS
-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes on FK columns are critical for JOIN performance and cascading
-- delete operations. We add them for all FK columns that don't already
-- have an index.

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_contact ON support_tickets(contact_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_user ON support_tickets(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_team ON support_tickets(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_event ON support_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_registration ON support_tickets(registration_id);

-- Ticket Comments
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author ON ticket_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_contact ON ticket_comments(author_contact_id);

-- Purchase Orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_shipping_addr ON purchase_orders(shipping_address_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_billing_addr ON purchase_orders(billing_address_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_currency ON purchase_orders(currency_id);
CREATE INDEX IF NOT EXISTS idx_po_items_asset ON purchase_order_items(asset_id);
CREATE INDEX IF NOT EXISTS idx_po_items_gl_account ON purchase_order_items(gl_account_id);

-- Time Entries
CREATE INDEX IF NOT EXISTS idx_time_entries_organization ON time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_event ON time_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_shift ON time_entries(shift_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in_punch_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_out ON time_entries(clock_out_punch_id);

-- Hospitality
CREATE INDEX IF NOT EXISTS idx_hospitality_org ON hospitality_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_contact ON hospitality_requests(contact_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_vendor ON hospitality_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_approved_by ON hospitality_requests(approved_by_id);

-- Email & Campaigns
CREATE INDEX IF NOT EXISTS idx_email_messages_template ON email_messages(template_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_sequence ON email_messages(sequence_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_template ON campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign ON landing_pages(campaign_id);

-- Finance
CREATE INDEX IF NOT EXISTS idx_invoice_reminder_log_invoice ON invoice_reminder_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_automation_rules_client ON invoice_automation_rules(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_template ON recurring_invoices(invoice_template_id);
CREATE INDEX IF NOT EXISTS idx_revenue_recognitions_invoice ON revenue_recognitions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_budget_cat ON financial_ledger(budget_category_id);
CREATE INDEX IF NOT EXISTS idx_expense_approval_levels_approver ON expense_approval_levels(approver_id);

-- Logistics
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX IF NOT EXISTS idx_load_plans_vehicle ON load_plans(vehicle_id);

-- Crew & Workforce
CREATE INDEX IF NOT EXISTS idx_crew_assignments_member ON crew_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_event ON crew_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_advance ON crew_assignments(advance_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_advance_item ON crew_assignments(advance_item_id);
CREATE INDEX IF NOT EXISTS idx_meal_penalties_checkin ON meal_penalties(crew_checkin_id);

-- CRM
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_assignee ON leads(assignee_id);
CREATE INDEX IF NOT EXISTS idx_leads_converted_deal ON leads(converted_deal_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_client ON rfp_responses(client_id);
CREATE INDEX IF NOT EXISTS idx_quotas_team ON quotas(team_id);

-- Events & Venues
CREATE INDEX IF NOT EXISTS idx_event_partners_org ON event_partners(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_currency ON ticket_types(currency_id);
CREATE INDEX IF NOT EXISTS idx_venue_holds_converted ON venue_holds(converted_to_booking_id);

-- Documents
CREATE INDEX IF NOT EXISTS idx_digital_signatures_document ON digital_signatures(document_id);

-- Network
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id);

-- Vendor Payments
CREATE INDEX IF NOT EXISTS idx_vendor_payment_schedules_vendor ON vendor_payment_schedules(vendor_id);

-- Meetings
CREATE INDEX IF NOT EXISTS idx_meeting_types_confirm_email ON meeting_types(confirmation_email_template_id);
CREATE INDEX IF NOT EXISTS idx_meeting_types_reminder_email ON meeting_types(reminder_email_template_id);

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(webhook_endpoint_id);

-- Reporting
CREATE INDEX IF NOT EXISTS idx_report_formula_fields_def ON report_formula_fields(report_definition_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_org ON report_schedules(organization_id);

-- Punch Items
CREATE INDEX IF NOT EXISTS idx_punch_items_inspection ON punch_items(inspection_id);

-- Forms
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact ON form_submissions(contact_id);

-- Currencies
CREATE INDEX IF NOT EXISTS idx_currencies_organization ON currencies(organization_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 4 ADDENDUM: AUDIT CASCADE BEHAVIOR ON EXISTING FINANCIAL FKs
-- ═══════════════════════════════════════════════════════════════════════════
-- Ensure financial/compliance tables use ON DELETE RESTRICT instead of CASCADE.
-- This prevents accidental deletion of financial records through cascading.

-- Check and fix invoices.organization_id (should be RESTRICT, not CASCADE)
DO $$ BEGIN
  -- Only fix if the constraint exists with CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'invoices'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%organization%'
    AND rc.delete_rule = 'CASCADE'
  ) THEN
    -- Drop and recreate with RESTRICT
    EXECUTE (
      SELECT 'ALTER TABLE invoices DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'invoices'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name LIKE '%organization%'
      LIMIT 1
    );
    ALTER TABLE invoices ADD CONSTRAINT fk_invoices_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Check and fix payments.organization_id (should be RESTRICT)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'payments'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%organization%'
    AND rc.delete_rule = 'CASCADE'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE payments DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'payments'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name LIKE '%organization%'
      LIMIT 1
    );
    ALTER TABLE payments ADD CONSTRAINT fk_payments_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Check and fix journal_entries.organization_id (should be RESTRICT)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'journal_entries'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%organization%'
    AND rc.delete_rule = 'CASCADE'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE journal_entries DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'journal_entries'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name LIKE '%organization%'
      LIMIT 1
    );
    ALTER TABLE journal_entries ADD CONSTRAINT fk_journal_entries_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Check and fix payroll_runs.organization_id (should be RESTRICT)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'payroll_runs'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%organization%'
    AND rc.delete_rule = 'CASCADE'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE payroll_runs DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'payroll_runs'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name LIKE '%organization%'
      LIMIT 1
    );
    ALTER TABLE payroll_runs ADD CONSTRAINT fk_payroll_runs_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

-- Check and fix settlements.organization_id (should be RESTRICT)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'settlements'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%organization%'
    AND rc.delete_rule = 'CASCADE'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE settlements DROP CONSTRAINT ' || tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = 'settlements'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name LIKE '%organization%'
      LIMIT 1
    );
    ALTER TABLE settlements ADD CONSTRAINT fk_settlements_organization
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
  END IF;
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;
