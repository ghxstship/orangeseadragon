-- ATLVS Platform Database Schema
-- Normalized Configuration Tables for Schema-Driven UI
-- Implements page_layouts, tenant_config, tenant_features, user_roles, translations

-- ============================================================================
-- LOOKUP TABLES (Single Source of Truth for Enums)
-- ============================================================================

-- Lookup Tables (generic enum storage)
CREATE TABLE lookup_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL, -- Which lookup table (e.g., 'account_types', 'priorities')
    key VARCHAR(100) NOT NULL, -- Lookup key (e.g., 'admin', 'high')
    value VARCHAR(255) NOT NULL, -- Display value (e.g., 'Administrator', 'High Priority')
    metadata JSONB DEFAULT '{}', -- Additional data (icon, color, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(table_name, key)
);

CREATE INDEX IF NOT EXISTS idx_lookup_tables_table_name ON lookup_tables(table_name);
CREATE INDEX IF NOT EXISTS idx_lookup_tables_active ON lookup_tables(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- PAGE LAYOUTS (Configuration-Driven UI)
-- ============================================================================

-- Page Layout Configurations
CREATE TABLE page_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    route VARCHAR(255) NOT NULL, -- URL path pattern
    layout_type VARCHAR(50) NOT NULL CHECK (layout_type IN ('dashboard', 'form', 'list', 'detail', 'wizard', 'landing')),
    component_config JSONB NOT NULL DEFAULT '{}', -- Component configuration
    theme_config JSONB DEFAULT '{}', -- Theme overrides
    permissions TEXT[] DEFAULT '{}', -- Required permissions
    applicable_account_types TEXT[] DEFAULT '{}', -- Account type slugs
    applicable_subscription_tiers subscription_tier[] DEFAULT '{}', -- Subscription tiers
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_layouts_slug ON page_layouts(slug);
CREATE INDEX IF NOT EXISTS idx_page_layouts_route ON page_layouts(route);
CREATE INDEX IF NOT EXISTS idx_page_layouts_active ON page_layouts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_page_layouts_type ON page_layouts(layout_type);

-- ============================================================================
-- TENANT CONFIGURATION (Whitelabeling)
-- ============================================================================

-- Tenant Configuration (theme tokens, branding)
CREATE TABLE tenant_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('theme', 'branding', 'feature', 'custom')),
    environment VARCHAR(20) DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, config_key, environment)
);

CREATE INDEX IF NOT EXISTS idx_tenant_config_org ON tenant_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_config_key ON tenant_config(config_key);
CREATE INDEX IF NOT EXISTS idx_tenant_config_active ON tenant_config(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TENANT FEATURES (Feature Flags)
-- ============================================================================

-- Tenant Feature Overrides
CREATE TABLE tenant_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_slug VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}', -- Feature-specific configuration
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    allowed_users UUID[] DEFAULT '{}', -- Specific users if targeted rollout
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, feature_slug)
);

CREATE INDEX IF NOT EXISTS idx_tenant_features_org ON tenant_features(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_slug ON tenant_features(feature_slug);
CREATE INDEX IF NOT EXISTS idx_tenant_features_enabled ON tenant_features(is_enabled) WHERE is_enabled = TRUE;

-- ============================================================================
-- USER ROLES (RBAC - Role-Based Access Control)
-- ============================================================================

-- User Roles (normalized RBAC)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_slug VARCHAR(100) NOT NULL,
    permissions TEXT[] DEFAULT '{}', -- Granted permissions
    granted_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Who granted
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id, role_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_slug ON user_roles(role_slug);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- TRANSLATIONS (i18n)
-- ============================================================================

-- Translations Table
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locale VARCHAR(10) NOT NULL, -- e.g., 'en', 'en-US', 'es'
    namespace VARCHAR(100) NOT NULL, -- e.g., 'auth', 'onboarding', 'common'
    key VARCHAR(255) NOT NULL, -- Translation key
    value TEXT NOT NULL, -- Translated text
    context TEXT, -- Additional context for translators
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(locale, namespace, key)
);

CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
CREATE INDEX IF NOT EXISTS idx_translations_namespace ON translations(namespace);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_approved ON translations(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_translations_search ON translations USING GIN(to_tsvector('english', key || ' ' || COALESCE(value, '')));

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE lookup_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Lookup Tables: Public read for active entries
DROP POLICY IF EXISTS "lookup_tables_public_read" ON lookup_tables;
CREATE POLICY "lookup_tables_public_read" ON lookup_tables
    FOR SELECT USING (is_active = TRUE);

-- Page Layouts: Public read for active layouts
DROP POLICY IF EXISTS "page_layouts_public_read" ON page_layouts;
CREATE POLICY "page_layouts_public_read" ON page_layouts
    FOR SELECT USING (is_active = TRUE);

-- Tenant Config: Organization members can read their org's config
DROP POLICY IF EXISTS "tenant_config_org_read" ON tenant_config;
CREATE POLICY "tenant_config_org_read" ON tenant_config
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Tenant Features: Organization members can read their org's features
DROP POLICY IF EXISTS "tenant_features_org_read" ON tenant_features;
CREATE POLICY "tenant_features_org_read" ON tenant_features
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- User Roles: Organization members can read roles in their org
DROP POLICY IF EXISTS "user_roles_org_read" ON user_roles;
CREATE POLICY "user_roles_org_read" ON user_roles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Translations: Public read for approved translations
DROP POLICY IF EXISTS "translations_public_read" ON translations;
CREATE POLICY "translations_public_read" ON translations
    FOR SELECT USING (is_approved = TRUE);
