# Database Schema Enrichment: Account, Auth & Onboarding

**Reference Document:** `COMPETITIVE_ENRICHMENT_ACCOUNT_AUTH_ONBOARDING.md`  
**Last Updated:** February 2026

---

## Overview

This document contains the complete database schema additions required to implement the competitive enrichment recommendations for the Account, Authentication, and Onboarding modules.

---

## 1. Account Module Tables

### 1.1 User Sessions

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, expires_at) 
    WHERE revoked_at IS NULL;
```

### 1.2 Login History

```sql
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'login_success', 'login_failed', 'logout', 'password_reset'
    auth_method VARCHAR(50), -- 'password', 'magic_link', 'oauth', 'passkey', 'mfa'
    ip_address INET,
    device_info JSONB,
    location JSONB, -- {city, country, coords}
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);
```

### 1.3 Notification Preferences

```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'activity', 'updates', 'marketing', 'security'
    event_type VARCHAR(100) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    frequency VARCHAR(50) DEFAULT 'instant', -- 'instant', 'daily', 'weekly'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, event_type)
);

CREATE TABLE notification_quiet_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT false,
    start_time TIME DEFAULT '22:00',
    end_time TIME DEFAULT '08:00',
    timezone VARCHAR(100) DEFAULT 'UTC',
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6]
);
```

### 1.4 Connected Apps

```sql
CREATE TABLE connected_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider VARCHAR(100) NOT NULL,
    provider_account_id VARCHAR(255),
    scopes JSONB,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    disconnected_at TIMESTAMPTZ
);

CREATE INDEX idx_connected_apps_org ON connected_apps(organization_id);
```

### 1.5 API Tokens

```sql
CREATE TABLE api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_prefix VARCHAR(10) NOT NULL, -- First 8 chars for identification
    scopes JSONB DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_tokens_org ON api_tokens(organization_id);
CREATE INDEX idx_api_tokens_hash ON api_tokens(token_hash) WHERE revoked_at IS NULL;
```

### 1.6 Webhooks

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    secret_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    duration_ms INTEGER,
    success BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries ON webhook_deliveries(webhook_id, created_at DESC);
```

### 1.7 Data Export & Deletion

```sql
CREATE TABLE data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'ready', 'expired'
    format VARCHAR(20) DEFAULT 'json', -- 'json', 'csv'
    download_url TEXT,
    file_size_bytes BIGINT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    feedback TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL, -- 30 days from request
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Authentication Module Tables

### 2.1 Passkeys (WebAuthn)

```sql
CREATE TABLE passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    device_name VARCHAR(255),
    transports JSONB, -- ['usb', 'ble', 'nfc', 'internal']
    aaguid BYTEA,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_passkeys_user ON passkeys(user_id);
CREATE INDEX idx_passkeys_credential ON passkeys(credential_id);
```

### 2.2 Magic Links

```sql
CREATE TABLE magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    redirect_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_magic_links_token ON magic_links(token_hash) WHERE used_at IS NULL;
CREATE INDEX idx_magic_links_cleanup ON magic_links(expires_at) WHERE used_at IS NULL;
```

### 2.3 OAuth Accounts

```sql
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'microsoft', 'apple', 'github'
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_name VARCHAR(255),
    provider_avatar_url TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_oauth_accounts_user ON oauth_accounts(user_id);
```

### 2.4 Rate Limiting

```sql
CREATE TABLE rate_limit_buckets (
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 10,
    last_refill TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (identifier, action)
);

-- Cleanup old entries periodically
CREATE INDEX idx_rate_limit_cleanup ON rate_limit_buckets(last_refill);
```

---

## 3. Onboarding Module Tables

### 3.1 Onboarding Paths

```sql
CREATE TABLE onboarding_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_role VARCHAR(100), -- NULL = all roles
    target_use_case VARCHAR(100), -- NULL = all use cases
    steps JSONB NOT NULL, -- [{key, title, description, required, component}]
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default path
INSERT INTO onboarding_paths (name, is_default, steps) VALUES (
    'Default Onboarding',
    true,
    '[
        {"key": "welcome", "title": "Welcome", "required": true},
        {"key": "profile", "title": "Profile", "required": true},
        {"key": "organization", "title": "Organization", "required": true},
        {"key": "team", "title": "Team", "required": false},
        {"key": "preferences", "title": "Preferences", "required": false},
        {"key": "integrations", "title": "Integrations", "required": false},
        {"key": "tour", "title": "Tour", "required": false},
        {"key": "complete", "title": "Complete", "required": true}
    ]'::jsonb
);
```

### 3.2 User Onboarding Progress

```sql
CREATE TABLE user_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    path_id UUID REFERENCES onboarding_paths(id),
    selected_role VARCHAR(100),
    selected_use_case VARCHAR(100),
    current_step VARCHAR(100),
    completed_steps JSONB DEFAULT '[]'::jsonb,
    step_data JSONB DEFAULT '{}'::jsonb, -- Form data per step
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

### 3.3 Setup Checklist

```sql
CREATE TABLE setup_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    action_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Default checklist items
INSERT INTO setup_checklist_items (key, title, description, action_url, sort_order) VALUES
    ('create_event', 'Create your first event', 'Set up a production or event', '/productions/events/new', 1),
    ('invite_team', 'Invite a team member', 'Collaboration is better together', '/account/organization', 2),
    ('connect_integration', 'Connect an integration', 'Sync with tools you use', '/account/integrations', 3),
    ('customize_profile', 'Complete your profile', 'Add a photo and bio', '/account/profile', 4),
    ('explore_dashboard', 'Explore the dashboard', 'See your command center', '/core/dashboard', 5);

CREATE TABLE setup_checklist_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_key VARCHAR(100) NOT NULL REFERENCES setup_checklist_items(key),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    dismissed BOOLEAN DEFAULT false,
    UNIQUE (user_id, item_key)
);

CREATE INDEX idx_checklist_progress_user ON setup_checklist_progress(user_id);
```

### 3.4 Onboarding Templates

```sql
CREATE TABLE onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'events', 'tours', 'festivals', 'corporate'
    industry VARCHAR(100),
    preview_image_url TEXT,
    template_data JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON onboarding_templates(category, is_active);
```

---

## 4. Row Level Security Policies

```sql
-- User Sessions: Users can only see their own sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Login History: Users can only see their own history
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY login_history_policy ON login_history
    FOR ALL USING (user_id = auth.uid());

-- Notification Preferences: Users can only manage their own
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_prefs_policy ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Passkeys: Users can only manage their own
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY passkeys_policy ON passkeys
    FOR ALL USING (user_id = auth.uid());

-- OAuth Accounts: Users can only see their own
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY oauth_accounts_policy ON oauth_accounts
    FOR ALL USING (user_id = auth.uid());

-- Onboarding Progress: Users can only see their own
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY onboarding_progress_policy ON user_onboarding_progress
    FOR ALL USING (user_id = auth.uid());

-- Checklist Progress: Users can only see their own
ALTER TABLE setup_checklist_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY checklist_progress_policy ON setup_checklist_progress
    FOR ALL USING (user_id = auth.uid());
```

---

## 5. Functions & Triggers

### 5.1 Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_prefs_updated
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER oauth_accounts_updated
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER onboarding_paths_updated
    BEFORE UPDATE ON onboarding_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5.2 Session Cleanup

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';
    DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '1 day';
    DELETE FROM rate_limit_buckets WHERE last_refill < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Migration Order

1. Account tables (sessions, login_history, notifications)
2. Auth tables (passkeys, magic_links, oauth_accounts)
3. Onboarding tables (paths, progress, checklist, templates)
4. RLS policies
5. Functions and triggers
6. Seed data (checklist items, default path)

---

*Schema designed for Supabase/PostgreSQL. Adjust for other databases as needed.*
