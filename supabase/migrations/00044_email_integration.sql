-- ATLVS Email Integration
-- 2-Way Email Sync, Tracking, and CRM Integration
-- Migration: 00042

-- ============================================================================
-- EMAIL ACCOUNTS (OAuth connections to Gmail/Outlook)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook', 'smtp')),
    email_address VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- SMTP settings (for custom SMTP)
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    smtp_password TEXT,
    smtp_use_tls BOOLEAN DEFAULT TRUE,
    
    -- Sync settings
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_from_date DATE,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error')),
    sync_error TEXT,
    
    -- Preferences
    is_default BOOLEAN DEFAULT FALSE,
    signature_html TEXT,
    signature_text TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, email_address)
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_organization ON email_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_sync ON email_accounts(sync_enabled, last_sync_at);

-- ============================================================================
-- EMAIL MESSAGES (Synced and sent emails)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    
    -- External IDs for sync
    provider_message_id VARCHAR(255),
    provider_thread_id VARCHAR(255),
    
    -- Message details
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced')),
    
    -- Addresses
    from_address VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    to_addresses JSONB NOT NULL DEFAULT '[]',
    cc_addresses JSONB DEFAULT '[]',
    bcc_addresses JSONB DEFAULT '[]',
    reply_to VARCHAR(255),
    
    -- Content
    subject VARCHAR(500),
    body_html TEXT,
    body_text TEXT,
    snippet VARCHAR(500),
    
    -- Attachments
    has_attachments BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    
    -- Threading
    in_reply_to VARCHAR(255),
    references_header TEXT,
    
    -- Timestamps
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    
    -- CRM associations
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    -- Template tracking
    template_id UUID,
    sequence_id UUID,
    sequence_step_id UUID,
    
    -- Metadata
    labels JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(email_account_id, provider_message_id)
);

CREATE INDEX IF NOT EXISTS idx_email_messages_organization ON email_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_account ON email_messages(email_account_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON email_messages(provider_thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_contact ON email_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_company ON email_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_deal ON email_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_sent ON email_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction ON email_messages(direction, sent_at DESC);

-- ============================================================================
-- EMAIL TRACKING EVENTS (Opens, clicks, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
    
    -- Event details
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Click tracking
    link_url TEXT,
    link_index INTEGER,
    
    -- Bounce/complaint details
    bounce_type VARCHAR(50),
    bounce_reason TEXT,
    
    -- Geolocation (optional)
    geo_country VARCHAR(2),
    geo_city VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_message ON email_tracking_events(email_message_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_occurred ON email_tracking_events(occurred_at DESC);

-- ============================================================================
-- EMAIL THREADS (Conversation grouping)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    provider_thread_id VARCHAR(255),
    subject VARCHAR(500),
    
    -- Participants
    participants JSONB DEFAULT '[]',
    
    -- Thread stats
    message_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    
    -- Latest message info
    last_message_at TIMESTAMPTZ,
    last_message_snippet VARCHAR(500),
    
    -- CRM associations
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    -- Status
    is_archived BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_threads_organization ON email_threads(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_contact ON email_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_company ON email_threads(company_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_deal ON email_threads(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message ON email_threads(last_message_at DESC);

-- ============================================================================
-- TRIGGER: Auto-associate emails with contacts/companies
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_associate_email()
RETURNS TRIGGER AS $$
DECLARE
    v_contact_id UUID;
    v_company_id UUID;
    v_email_address VARCHAR(255);
BEGIN
    -- Extract email address based on direction
    IF NEW.direction = 'inbound' THEN
        v_email_address := NEW.from_address;
    ELSE
        -- For outbound, get first recipient
        v_email_address := NEW.to_addresses->0->>'address';
    END IF;
    
    -- Skip if already associated
    IF NEW.contact_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Find matching contact
    SELECT id, company_id INTO v_contact_id, v_company_id
    FROM contacts
    WHERE organization_id = NEW.organization_id
      AND LOWER(email) = LOWER(v_email_address)
    LIMIT 1;
    
    IF v_contact_id IS NOT NULL THEN
        NEW.contact_id := v_contact_id;
        NEW.company_id := COALESCE(NEW.company_id, v_company_id);
    END IF;
    
    -- If no contact but company_id not set, try to match company by domain
    IF NEW.company_id IS NULL AND v_email_address LIKE '%@%' THEN
        SELECT id INTO v_company_id
        FROM companies
        WHERE organization_id = NEW.organization_id
          AND LOWER(website) LIKE '%' || LOWER(SPLIT_PART(v_email_address, '@', 2)) || '%'
        LIMIT 1;
        
        IF v_company_id IS NOT NULL THEN
            NEW.company_id := v_company_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_associate_email ON email_messages;
CREATE TRIGGER trigger_auto_associate_email
    BEFORE INSERT ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_associate_email();

-- ============================================================================
-- TRIGGER: Create activity on email send/receive
-- ============================================================================

CREATE OR REPLACE FUNCTION create_email_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create activity for sent/received emails with CRM associations
    IF NEW.status IN ('sent', 'delivered') AND (NEW.contact_id IS NOT NULL OR NEW.company_id IS NOT NULL OR NEW.deal_id IS NOT NULL) THEN
        INSERT INTO activities (
            organization_id,
            activity_type,
            subject,
            description,
            company_id,
            contact_id,
            deal_id,
            occurred_at,
            is_completed,
            metadata
        ) VALUES (
            NEW.organization_id,
            'email',
            CASE WHEN NEW.direction = 'outbound' THEN 'Sent: ' ELSE 'Received: ' END || COALESCE(NEW.subject, '(no subject)'),
            NEW.snippet,
            NEW.company_id,
            NEW.contact_id,
            NEW.deal_id,
            COALESCE(NEW.sent_at, NEW.received_at, NOW()),
            TRUE,
            jsonb_build_object(
                'email_message_id', NEW.id,
                'direction', NEW.direction,
                'from', NEW.from_address,
                'to', NEW.to_addresses
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_email_activity ON email_messages;
CREATE TRIGGER trigger_create_email_activity
    AFTER INSERT OR UPDATE OF status ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION create_email_activity();

-- ============================================================================
-- TRIGGER: Update thread stats on message insert
-- ============================================================================

CREATE OR REPLACE FUNCTION update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE email_threads
    SET 
        message_count = message_count + 1,
        unread_count = unread_count + CASE WHEN NEW.is_read THEN 0 ELSE 1 END,
        last_message_at = COALESCE(NEW.sent_at, NEW.received_at, NOW()),
        last_message_snippet = NEW.snippet,
        updated_at = NOW()
    WHERE provider_thread_id = NEW.provider_thread_id
      AND organization_id = NEW.organization_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_thread_stats ON email_messages;
CREATE TRIGGER trigger_update_thread_stats
    AFTER INSERT ON email_messages
    FOR EACH ROW
    WHEN (NEW.provider_thread_id IS NOT NULL)
    EXECUTE FUNCTION update_thread_stats();

-- ============================================================================
-- TRIGGER: Update deal last_activity_at on email
-- ============================================================================

CREATE OR REPLACE FUNCTION update_deal_on_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deal_id IS NOT NULL AND NEW.status IN ('sent', 'delivered') THEN
        UPDATE deals
        SET last_activity_at = COALESCE(NEW.sent_at, NEW.received_at, NOW()),
            updated_at = NOW()
        WHERE id = NEW.deal_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deal_on_email ON email_messages;
CREATE TRIGGER trigger_update_deal_on_email
    AFTER INSERT OR UPDATE OF status ON email_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_on_email();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;

-- Email accounts: users can only see their own
DROP POLICY IF EXISTS email_accounts_user_isolation ON email_accounts;
CREATE POLICY email_accounts_user_isolation ON email_accounts
    FOR ALL
    USING (user_id = auth.uid());

-- Email messages: organization isolation
DROP POLICY IF EXISTS email_messages_org_isolation ON email_messages;
CREATE POLICY email_messages_org_isolation ON email_messages
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- Email tracking: organization isolation
DROP POLICY IF EXISTS email_tracking_org_isolation ON email_tracking_events;
CREATE POLICY email_tracking_org_isolation ON email_tracking_events
    FOR ALL
    USING (email_message_id IN (
        SELECT id FROM email_messages 
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    ));

-- Email threads: organization isolation
DROP POLICY IF EXISTS email_threads_org_isolation ON email_threads;
CREATE POLICY email_threads_org_isolation ON email_threads
    FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
    ));

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW email_messages_with_tracking AS
SELECT 
    em.*,
    COALESCE(
        (SELECT COUNT(*) FROM email_tracking_events WHERE email_message_id = em.id AND event_type = 'opened'),
        0
    ) as open_count,
    COALESCE(
        (SELECT COUNT(*) FROM email_tracking_events WHERE email_message_id = em.id AND event_type = 'clicked'),
        0
    ) as click_count,
    (SELECT occurred_at FROM email_tracking_events WHERE email_message_id = em.id AND event_type = 'opened' ORDER BY occurred_at LIMIT 1) as first_opened_at,
    (SELECT occurred_at FROM email_tracking_events WHERE email_message_id = em.id AND event_type = 'clicked' ORDER BY occurred_at LIMIT 1) as first_clicked_at
FROM email_messages em;

COMMENT ON VIEW email_messages_with_tracking IS 'Email messages enriched with tracking statistics';
