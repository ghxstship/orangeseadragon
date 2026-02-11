-- Migration: Productive.io Ecosystem Enhancements
-- Created: 2026-02-07
-- Description: Adds client portal access, integrations framework (webhooks, API keys,
--              OAuth connections), document versioning, and client approval workflows.

-- ============================================================================
-- STEP 1: CLIENT PORTAL ACCESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_portal_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Access control
    is_active BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(20) DEFAULT 'viewer'
        CHECK (access_level IN ('viewer', 'commenter', 'collaborator', 'admin')),
    portal_password_hash TEXT,
    magic_link_token TEXT,
    magic_link_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,

    -- Permissions
    can_view_budgets BOOLEAN DEFAULT FALSE,
    can_view_invoices BOOLEAN DEFAULT TRUE,
    can_view_tasks BOOLEAN DEFAULT FALSE,
    can_view_documents BOOLEAN DEFAULT TRUE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    can_comment BOOLEAN DEFAULT TRUE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_upload BOOLEAN DEFAULT FALSE,

    -- Branding
    custom_welcome_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT uq_portal_access UNIQUE (organization_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_access_org ON client_portal_access(organization_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_company ON client_portal_access(company_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_contact ON client_portal_access(contact_id);
CREATE INDEX IF NOT EXISTS idx_portal_access_active ON client_portal_access(organization_id, is_active) WHERE is_active = TRUE;

-- Shared items (what the client can see)
CREATE TABLE IF NOT EXISTS client_shared_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    portal_access_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    shared_by UUID REFERENCES users(id) ON DELETE SET NULL,
    access_level VARCHAR(20) DEFAULT 'view'
        CHECK (access_level IN ('view', 'comment', 'approve', 'edit')),
    expires_at TIMESTAMPTZ,
    notes TEXT,

    CONSTRAINT uq_shared_item UNIQUE (portal_access_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_shared_items_portal ON client_shared_items(portal_access_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_entity ON client_shared_items(entity_type, entity_id);

-- Client comments (separate from internal comments)
CREATE TABLE IF NOT EXISTS client_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    portal_access_id UUID NOT NULL REFERENCES client_portal_access(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES client_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal_reply BOOLEAN DEFAULT FALSE,
    replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_comments_entity ON client_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_client_comments_portal ON client_comments(portal_access_id);

-- ============================================================================
-- STEP 2: INTEGRATIONS FRAMEWORK
-- ============================================================================

-- Webhook registry
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    -- Events to subscribe to
    events TEXT[] NOT NULL DEFAULT '{}',

    -- Headers
    custom_headers JSONB DEFAULT '{}',

    -- Retry config
    max_retries INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 60,

    -- Stats
    last_triggered_at TIMESTAMPTZ,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_response_code INTEGER,
    last_error TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhook_endpoints(organization_id, is_active) WHERE is_active = TRUE;

-- Webhook delivery log
-- Extend existing webhook_deliveries table (originally from 00015_account_platform.sql)
ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS webhook_endpoint_id UUID;
ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS response_code INTEGER;
ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(webhook_endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);

-- API keys
-- Extend existing api_keys table (originally from 00015_account_platform.sql)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rate_limit_per_minute INTEGER DEFAULT 60;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS allowed_ips TEXT[];

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(organization_id, is_active) WHERE is_active = TRUE;

-- OAuth connections (third-party integrations)
CREATE TABLE IF NOT EXISTS oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL
        CHECK (provider IN ('google', 'microsoft', 'slack', 'quickbooks', 'xero', 'hubspot', 'salesforce', 'jira', 'asana', 'github', 'figma', 'dropbox', 'box')),
    provider_user_id VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'idle'
        CHECK (sync_status IN ('idle', 'syncing', 'error', 'paused')),
    sync_error TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_oauth_connection UNIQUE (organization_id, user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_connections_org ON oauth_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON oauth_connections(provider);

-- ============================================================================
-- STEP 3: DOCUMENT VERSIONING
-- ============================================================================

-- Extend existing document_versions table (originally from 00009_workflows_documents.sql)
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS version_number INTEGER;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

-- ============================================================================
-- STEP 4: CLIENT APPROVAL WORKFLOWS ON DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,

    -- Approval details
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ,
    responded_by_portal_id UUID REFERENCES client_portal_access(id) ON DELETE SET NULL,

    -- Feedback
    feedback TEXT,
    revision_notes TEXT,
    approval_signature TEXT,

    -- Deadline
    due_date TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_approvals_entity ON client_approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_client_approvals_status ON client_approvals(status);
CREATE INDEX IF NOT EXISTS idx_client_approvals_org ON client_approvals(organization_id);

-- ============================================================================
-- STEP 5: FOLDER VISIBILITY CONTROLS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'visibility'
    ) THEN
        ALTER TABLE folders ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'team'
            CHECK (visibility IN ('private', 'team', 'organization', 'client'));
        ALTER TABLE folders ADD COLUMN IF NOT EXISTS client_visible BOOLEAN DEFAULT FALSE;
        ALTER TABLE folders ADD COLUMN IF NOT EXISTS password_protected BOOLEAN DEFAULT FALSE;
        ALTER TABLE folders ADD COLUMN IF NOT EXISTS password_hash TEXT;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: RLS POLICIES
-- ============================================================================

ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_shared_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY portal_access_org_isolation ON client_portal_access
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY shared_items_org_isolation ON client_shared_items
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY client_comments_org_isolation ON client_comments
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY webhooks_org_isolation ON webhook_endpoints
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY webhook_deliveries_org_isolation ON webhook_deliveries
    USING (webhook_endpoint_id IN (
        SELECT id FROM webhook_endpoints WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY api_keys_org_isolation ON api_keys
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY oauth_connections_org_isolation ON oauth_connections
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY document_versions_org_isolation ON document_versions
    USING (document_id IN (
        SELECT id FROM documents WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY client_approvals_org_isolation ON client_approvals
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));
