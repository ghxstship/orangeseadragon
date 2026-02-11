-- Migration: Gap Implementation Tables
-- Phase 1-3 tables for workflow gap implementation
-- See: docs/GAP_IMPLEMENTATION_PLAN.md and docs/WORKFLOW_GAP_ANALYSIS.md

-- ============================================================================
-- LOOKUP TABLES
-- ============================================================================

-- Registration types (VIP, General, Press, etc.)
CREATE TABLE IF NOT EXISTS registration_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Talent types (speaker, performer, artist, DJ, MC, etc.)
CREATE TABLE IF NOT EXISTS talent_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Talent roles (keynote, panelist, moderator, headliner, opener, etc.)
CREATE TABLE IF NOT EXISTS talent_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    talent_type_id UUID REFERENCES talent_types(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Partner types (sponsor, exhibitor, vendor, media, etc.)
CREATE TABLE IF NOT EXISTS partner_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Sponsorship levels (platinum, gold, silver, bronze, etc.)
CREATE TABLE IF NOT EXISTS sponsorship_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Credential types (badge, wristband, pass, lanyard, etc.)
CREATE TABLE IF NOT EXISTS credential_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    access_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Leave types (vacation, sick, personal, bereavement, etc.)
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    requires_approval BOOLEAN DEFAULT TRUE,
    requires_documentation BOOLEAN DEFAULT FALSE,
    max_days_per_year INTEGER,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Ticket categories for support
CREATE TABLE IF NOT EXISTS ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    default_priority VARCHAR(20) DEFAULT 'medium',
    sla_hours INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Account types for chart of accounts
CREATE TABLE IF NOT EXISTS account_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Fiscal periods
CREATE TABLE IF NOT EXISTS fiscal_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, fiscal_year, period_number)
);

-- ============================================================================
-- PHASE 1: EVENT REGISTRATION & TICKETING
-- ============================================================================

-- Ticket types for events
-- Extend existing ticket_types table (originally from 00008_experience.sql)
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS currency_id UUID;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS registration_type_id UUID;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS sales_start_at TIMESTAMPTZ;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS sales_end_at TIMESTAMPTZ;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS min_per_order INTEGER DEFAULT 1;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS created_by UUID;

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    confirmation_number VARCHAR(50) NOT NULL,
    registration_type_id UUID REFERENCES registration_types(id),
    status_id UUID REFERENCES statuses(id),
    currency_id UUID REFERENCES currencies(id),
    source VARCHAR(50),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, confirmation_number)
);

-- Registration line items (tickets purchased)
CREATE TABLE IF NOT EXISTS registration_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    discount_cents INTEGER DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    attendee_name VARCHAR(255),
    attendee_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    min_order_amount_cents INTEGER,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, code)
);

-- Registration promo code usage
CREATE TABLE IF NOT EXISTS registration_promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
    discount_applied_cents INTEGER NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(registration_id, promo_code_id)
);

-- Event waitlist
CREATE TABLE IF NOT EXISTS event_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    position INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'converted', 'expired', 'cancelled')),
    offered_at TIMESTAMPTZ,
    offer_expires_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    registration_id UUID REFERENCES event_registrations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PHASE 1: TALENT MANAGEMENT
-- ============================================================================

-- Talent profiles (polymorphic: speakers, performers, artists, etc.)
CREATE TABLE IF NOT EXISTS talent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id),
    talent_type_id UUID NOT NULL REFERENCES talent_types(id),
    stage_name VARCHAR(255),
    professional_bio TEXT,
    headshot_url TEXT,
    professional_title VARCHAR(255),
    represented_company VARCHAR(255),
    booking_rate_cents INTEGER,
    booking_rate_type VARCHAR(20) CHECK (booking_rate_type IN ('flat', 'hourly', 'daily', 'per_event')),
    currency_id UUID REFERENCES currencies(id),
    agent_contact_id UUID REFERENCES contacts(id),
    status_id UUID REFERENCES statuses(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, contact_id, talent_type_id)
);

-- Talent skills/topics
CREATE TABLE IF NOT EXISTS talent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    expertise_level VARCHAR(20) CHECK (expertise_level IN ('beginner', 'intermediate', 'expert')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(talent_id, skill_name)
);

-- Talent social links
CREATE TABLE IF NOT EXISTS talent_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(talent_id, platform)
);

-- Talent media (videos, audio samples, etc.)
CREATE TABLE IF NOT EXISTS talent_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session talent assignments
CREATE TABLE IF NOT EXISTS session_talent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
    talent_role_id UUID REFERENCES talent_roles(id),
    status_id UUID REFERENCES statuses(id),
    sort_order INTEGER DEFAULT 0,
    invited_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    decline_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, talent_id)
);

-- Talent riders (requirements)
CREATE TABLE IF NOT EXISTS talent_riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_id UUID NOT NULL REFERENCES talent(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    requirements TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PHASE 1: PARTNER MANAGEMENT
-- ============================================================================

-- Event partners (sponsors, exhibitors, vendors)
-- Extend existing event_partners table (originally from 00016_additional_entities.sql)
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS partner_type_id UUID;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS sponsorship_level_id UUID;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS status_id UUID;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS display_logo_url TEXT;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS display_description TEXT;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS display_website_url TEXT;
ALTER TABLE event_partners ADD COLUMN IF NOT EXISTS created_by UUID;

-- Partner contacts (people from partner companies)
CREATE TABLE IF NOT EXISTS partner_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id),
    role VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id, contact_id)
);

-- Sponsorship benefits
CREATE TABLE IF NOT EXISTS sponsorship_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sponsorship_level_id UUID NOT NULL REFERENCES sponsorship_levels(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner benefits granted
CREATE TABLE IF NOT EXISTS partner_benefits_granted (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
    benefit_id UUID NOT NULL REFERENCES sponsorship_benefits(id),
    quantity_granted INTEGER DEFAULT 1,
    quantity_used INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id, benefit_id)
);

-- Partner deliverables
CREATE TABLE IF NOT EXISTS partner_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    file_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booth assignments for exhibitors
CREATE TABLE IF NOT EXISTS booth_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES event_partners(id) ON DELETE CASCADE,
    booth_number VARCHAR(50) NOT NULL,
    booth_size VARCHAR(50),
    location_description TEXT,
    floor_plan_zone_id UUID REFERENCES venue_spaces(id),
    setup_time TIMESTAMPTZ,
    teardown_time TIMESTAMPTZ,
    power_requirements TEXT,
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PHASE 1: CREDENTIAL MANAGEMENT
-- ============================================================================

-- Issued credentials (badges, passes, wristbands)
CREATE TABLE IF NOT EXISTS issued_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    credential_type_id UUID NOT NULL REFERENCES credential_types(id),
    credential_number VARCHAR(100) NOT NULL,
    holder_contact_id UUID NOT NULL REFERENCES contacts(id),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('registration', 'partner', 'talent', 'staff', 'vip', 'press', 'vendor', 'manual')),
    source_entity_id UUID,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    status_id UUID REFERENCES statuses(id),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    issued_by UUID REFERENCES users(id),
    activated_at TIMESTAMPTZ,
    printed_at TIMESTAMPTZ,
    print_count INTEGER DEFAULT 0,
    collected_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    suspended_reason TEXT,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, credential_number)
);

-- Credential access log
CREATE TABLE IF NOT EXISTS credential_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id UUID NOT NULL REFERENCES issued_credentials(id) ON DELETE CASCADE,
    checkpoint_id UUID REFERENCES checkpoints(id),
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('entry', 'exit', 'scan', 'denied')),
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    scanned_by UUID REFERENCES users(id),
    location_description TEXT,
    denial_reason TEXT
);

-- ============================================================================
-- PHASE 1: ACCOUNTING / GL
-- ============================================================================

-- Chart of accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type_id UUID NOT NULL REFERENCES account_types(id),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    is_header BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    allow_direct_posting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, account_number)
);

-- Journal entries (immutable)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id),
    description TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    is_adjusting BOOLEAN DEFAULT FALSE,
    is_closing BOOLEAN DEFAULT FALSE,
    reversal_of_id UUID REFERENCES journal_entries(id),
    reversed_by_id UUID REFERENCES journal_entries(id),
    posted_at TIMESTAMPTZ,
    posted_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, entry_number)
);

-- Journal entry lines (immutable)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    description TEXT,
    debit_cents INTEGER DEFAULT 0,
    credit_cents INTEGER DEFAULT 0,
    line_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (debit_cents >= 0 AND credit_cents >= 0),
    CHECK ((debit_cents > 0 AND credit_cents = 0) OR (credit_cents > 0 AND debit_cents = 0))
);

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_last4 VARCHAR(4),
    routing_number VARCHAR(50),
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'credit_card', 'line_of_credit')),
    currency_id UUID NOT NULL REFERENCES currencies(id),
    gl_account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_reconciled_at TIMESTAMPTZ,
    last_reconciled_balance_cents INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Bank transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'fee', 'interest', 'adjustment')),
    reference_number VARCHAR(100),
    payee VARCHAR(255),
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciliation_id UUID,
    journal_entry_id UUID REFERENCES journal_entries(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank reconciliations
CREATE TABLE IF NOT EXISTS bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    statement_date DATE NOT NULL,
    statement_ending_balance_cents INTEGER NOT NULL,
    reconciled_balance_cents INTEGER,
    difference_cents INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- PHASE 2: LEAD SCORING
-- ============================================================================

-- Lead scoring rules
CREATE TABLE IF NOT EXISTS lead_score_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('demographic', 'behavioral', 'engagement', 'firmographic', 'intent')),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('field_value', 'activity', 'page_visit', 'email_action', 'form_submit', 'event_attendance')),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    points INTEGER NOT NULL,
    max_occurrences INTEGER,
    decay_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Lead score events (history)
CREATE TABLE IF NOT EXISTS lead_score_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES lead_score_rules(id),
    points_awarded INTEGER NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    trigger_data JSONB,
    expires_at TIMESTAMPTZ
);

-- ============================================================================
-- PHASE 2: EMAIL CAMPAIGNS
-- ============================================================================

-- Email templates
-- Extend existing email_templates table (originally from 00016_additional_entities.sql)
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS preview_text VARCHAR(500);
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS text_content TEXT;

-- Campaigns
-- Extend existing campaigns table (originally from 00007_content_talent.sql)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS subject_line VARCHAR(500);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS preview_text VARCHAR(500);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS from_name VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS from_email VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS reply_to_email VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS audience_filter JSONB;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Campaign recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_reason TEXT,
    UNIQUE(campaign_id, contact_id)
);

-- ============================================================================
-- PHASE 2: HR ONBOARDING
-- ============================================================================

-- Onboarding templates
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_type_id UUID REFERENCES position_types(id),
    department_id UUID REFERENCES departments(id),
    employment_type_id UUID REFERENCES employment_types(id),
    duration_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Onboarding checklist items
CREATE TABLE IF NOT EXISTS onboarding_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    assigned_role VARCHAR(100),
    due_day INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding instances (for specific employees)
CREATE TABLE IF NOT EXISTS onboarding_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES onboarding_templates(id),
    staff_member_id UUID NOT NULL REFERENCES staff_members(id),
    start_date DATE NOT NULL,
    target_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Onboarding instance items (progress tracking)
CREATE TABLE IF NOT EXISTS onboarding_instance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES onboarding_instances(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES onboarding_items(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    UNIQUE(instance_id, item_id)
);

-- ============================================================================
-- PHASE 2: LEAVE MANAGEMENT
-- ============================================================================

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    staff_member_id UUID NOT NULL REFERENCES staff_members(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_half_day VARCHAR(20) DEFAULT 'full' CHECK (start_half_day IN ('full', 'morning', 'afternoon')),
    end_half_day VARCHAR(20) DEFAULT 'full' CHECK (end_half_day IN ('full', 'morning', 'afternoon')),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approver_id UUID REFERENCES staff_members(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID NOT NULL REFERENCES staff_members(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    entitled_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    used_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    pending_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    carried_over_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_member_id, leave_type_id, year)
);

-- ============================================================================
-- PHASE 3: PROCUREMENT
-- ============================================================================

-- Purchase orders
-- Extend existing purchase_orders table (originally from 00005_finance.sql)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS shipping_address_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS billing_address_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS currency_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tax_cents INTEGER DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS shipping_cents INTEGER DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS total_cents INTEGER DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Purchase order line items
-- Extend existing purchase_order_items table (originally from 00005_finance.sql)
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2);
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS unit_price_cents INTEGER;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS tax_cents INTEGER DEFAULT 0;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS total_cents INTEGER;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS asset_id UUID;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS gl_account_id UUID;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS received_quantity DECIMAL(10,2) DEFAULT 0;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS line_number INTEGER;

-- Goods receipts
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    receipt_number VARCHAR(50) NOT NULL,
    receipt_date DATE NOT NULL,
    received_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, receipt_number)
);

-- Goods receipt items
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
    quantity_received DECIMAL(10,2) NOT NULL,
    condition VARCHAR(50) DEFAULT 'good',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PHASE 3: SUPPORT TICKETS
-- ============================================================================

-- Support tickets
-- Extend existing support_tickets table (originally from 00015_account_platform.sql)
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS assigned_team_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS registration_id UUID;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS created_by UUID;

-- Ticket comments
-- Extend existing ticket_comments table (originally from 00015_account_platform.sql)
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS author_contact_id UUID;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_contact ON event_registrations(contact_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status_id);
CREATE INDEX IF NOT EXISTS idx_registration_line_items_registration ON registration_line_items(registration_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_talent_contact ON talent(contact_id);
CREATE INDEX IF NOT EXISTS idx_talent_type ON talent(talent_type_id);
CREATE INDEX IF NOT EXISTS idx_session_talent_session ON session_talent(session_id);
CREATE INDEX IF NOT EXISTS idx_session_talent_talent ON session_talent(talent_id);
CREATE INDEX IF NOT EXISTS idx_event_partners_event ON event_partners(event_id);
CREATE INDEX IF NOT EXISTS idx_event_partners_company ON event_partners(company_id);
CREATE INDEX IF NOT EXISTS idx_issued_credentials_event ON issued_credentials(event_id);
CREATE INDEX IF NOT EXISTS idx_issued_credentials_holder ON issued_credentials(holder_contact_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_log_credential ON credential_access_log(credential_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_period ON journal_entries(fiscal_period_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_lead_score_events_lead ON lead_score_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff ON leave_requests(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'registration_types', 'talent_types', 'talent_roles', 'partner_types',
            'sponsorship_levels', 'credential_types', 'leave_types', 'ticket_categories',
            'account_types', 'fiscal_periods', 'ticket_types', 'event_registrations',
            'promo_codes', 'event_waitlist', 'talent', 'talent_riders', 'event_partners',
            'partner_deliverables', 'booth_assignments', 'issued_credentials',
            'chart_of_accounts', 'bank_accounts', 'bank_transactions', 'bank_reconciliations',
            'lead_score_rules', 'email_templates', 'campaigns', 'onboarding_templates',
            'onboarding_instances', 'leave_requests', 'leave_balances', 'purchase_orders',
            'support_tickets'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;
