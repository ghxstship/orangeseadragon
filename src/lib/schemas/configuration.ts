/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION SCHEMA DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file defines the types for application-wide configuration entities
 * stored in Supabase.
 */

export interface LookupTable {
    id: string;
    table_name: string;
    key: string;
    value: string;
    metadata?: Record<string, unknown>;
    is_active: boolean;
    position: number;
    created_at?: string;
    updated_at?: string;
}

export interface PageLayout {
    id: string;
    slug: string;
    route: string;
    name: string;
    description?: string;
    layout_type: string;
    is_default: boolean;
    is_active: boolean;
    component_config: Record<string, unknown>;
    theme_config?: Record<string, unknown>;
    applicable_account_types: string[];
    applicable_subscription_tiers: string[];
    permissions: string[];
    position: number;
    created_at?: string;
    updated_at?: string;
}

export interface TenantConfig {
    id: string;
    organization_id: string;
    config_key: string;
    config_value: unknown;
    config_type: string;
    environment: string;
    status?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface TenantFeature {
    id: string;
    organization_id: string;
    feature_slug: string;
    is_enabled: boolean;
    config: Record<string, unknown>;
    rollout_percentage: number;
    allowed_users: string[];
    created_at?: string;
    updated_at?: string;
}

export interface UserRole {
    id: string;
    organization_id: string;
    user_id: string;
    role_slug: string;
    permissions: string[];
    is_active: boolean;
    granted_by?: string;
    granted_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Translation {
    id: string;
    locale: string;
    namespace: string;
    key: string;
    value: string;
    is_approved: boolean;
    created_at?: string;
    updated_at?: string;
}
