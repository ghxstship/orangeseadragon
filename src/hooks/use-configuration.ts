import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './use-supabase';
import type { Json } from '@/types/database';
import type {
  LookupTable,
  PageLayout,
  TenantConfig,
  TenantFeature,
  UserRole,
  Translation
} from '@/lib/schemas/configuration';

// Create supabase client instance
const supabase: ReturnType<typeof createClient> = createClient();

const toJson = (value: unknown): Json => value as Json;

// ============================================================================
// LOOKUP TABLES HOOKS
// ============================================================================

export function useLookupTables(tableName?: string) {
  return useQuery({
    queryKey: ['lookup-tables', tableName],
    queryFn: async (): Promise<LookupTable[]> => {
      let query = supabase
        .from('lookup_tables')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LookupTable[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLookupTable(tableName: string, key: string) {
  return useQuery({
    queryKey: ['lookup-table', tableName, key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_tables')
        .select('*')
        .eq('table_name', tableName)
        .eq('key', key)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as LookupTable;
    },
    enabled: !!tableName && !!key,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// PAGE LAYOUTS HOOKS
// ============================================================================

export function usePageLayouts(filters?: {
  layoutType?: string;
  applicableAccountTypes?: string[];
  applicableSubscriptionTiers?: string[];
}) {
  return useQuery({
    queryKey: ['page-layouts', filters],
    queryFn: async () => {
      let query = supabase
        .from('page_layouts')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (filters?.layoutType) {
        query = query.eq('layout_type', filters.layoutType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side filtering for account types and subscription tiers
      let filteredData = data as PageLayout[];

      if (filters?.applicableAccountTypes?.length) {
        filteredData = filteredData.filter(layout =>
          !layout.applicable_account_types.length ||
          layout.applicable_account_types.some(type =>
            filters.applicableAccountTypes!.includes(type)
          )
        );
      }

      if (filters?.applicableSubscriptionTiers?.length) {
        filteredData = filteredData.filter(layout =>
          !layout.applicable_subscription_tiers.length ||
          layout.applicable_subscription_tiers.some(tier =>
            filters.applicableSubscriptionTiers!.includes(tier)
          )
        );
      }

      return filteredData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePageLayout(slug: string) {
  return useQuery({
    queryKey: ['page-layout', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as PageLayout;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDefaultPageLayout(layoutType: string) {
  return useQuery({
    queryKey: ['default-page-layout', layoutType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_layouts')
        .select('*')
        .eq('layout_type', layoutType)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as PageLayout;
    },
    enabled: !!layoutType,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// TENANT CONFIGURATION HOOKS
// ============================================================================

export function useTenantConfig(organizationId: string, environment: string = 'production') {
  return useQuery({
    queryKey: ['tenant-config', organizationId, environment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('environment', environment)
        .eq('is_active', true);

      if (error) throw error;
      return data as TenantConfig[];
    },
    enabled: !!organizationId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useTenantConfigValue(organizationId: string, configKey: string, environment: string = 'production') {
  return useQuery({
    queryKey: ['tenant-config-value', organizationId, configKey, environment],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_config')
        .select('config_value')
        .eq('organization_id', organizationId)
        .eq('config_key', configKey)
        .eq('environment', environment)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data.config_value;
    },
    enabled: !!organizationId && !!configKey,
    staleTime: 15 * 60 * 1000,
  });
}

// ============================================================================
// TENANT FEATURES HOOKS
// ============================================================================

export function useTenantFeatures(organizationId: string) {
  return useQuery({
    queryKey: ['tenant-features', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_features')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      return data as TenantFeature[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTenantFeature(organizationId: string, featureSlug: string) {
  return useQuery({
    queryKey: ['tenant-feature', organizationId, featureSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_features')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('feature_slug', featureSlug)
        .single();

      if (error) throw error;
      return data as TenantFeature;
    },
    enabled: !!organizationId && !!featureSlug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeatureEnabled(organizationId: string, featureSlug: string, userId?: string) {
  return useQuery({
    queryKey: ['feature-enabled', organizationId, featureSlug, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_features')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('feature_slug', featureSlug)
        .single();

      if (error) throw error;

      const feature = data as TenantFeature;

      // Check if feature is enabled globally
      if (!feature.is_enabled) return false;

      // Check rollout percentage (simplified - in production would use consistent hashing)
      if (feature.rollout_percentage < 100) {
        // For demo, assume current user is in rollout
        // In production: check user ID against rollout logic
        if (Math.random() * 100 > feature.rollout_percentage) return false;
      }

      // Check if user is in allowed users list
      if (feature.allowed_users?.length && userId) {
        return feature.allowed_users.includes(userId);
      }

      return true;
    },
    enabled: !!organizationId && !!featureSlug,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// USER ROLES HOOKS
// ============================================================================

export function useUserRoles(organizationId: string, userId?: string) {
  return useQuery({
    queryKey: ['user-roles', organizationId, userId],
    queryFn: async () => {
      let query = supabase
        .from('user_roles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserRole(organizationId: string, userId: string, roleSlug: string) {
  return useQuery({
    queryKey: ['user-role', organizationId, userId, roleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('role_slug', roleSlug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as UserRole;
    },
    enabled: !!organizationId && !!userId && !!roleSlug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserPermissions(organizationId: string, userId: string) {
  return useQuery({
    queryKey: ['user-permissions', organizationId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('permissions')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      // Flatten and deduplicate permissions
      const allPermissions = (data ?? []).flatMap((role) => role.permissions || []);
      return Array.from(new Set(allPermissions));
    },
    enabled: !!organizationId && !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// TRANSLATIONS HOOKS
// ============================================================================

export function useTranslations(locale: string, namespace?: string) {
  return useQuery({
    queryKey: ['translations', locale, namespace],
    queryFn: async () => {
      let query = supabase
        .from('translations')
        .select('*')
        .eq('locale', locale)
        .eq('is_approved', true);

      if (namespace) {
        query = query.eq('namespace', namespace);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Translation[];
    },
    enabled: !!locale,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTranslation(locale: string, namespace: string, key: string) {
  return useQuery({
    queryKey: ['translation', locale, namespace, key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('value')
        .eq('locale', locale)
        .eq('namespace', namespace)
        .eq('key', key)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      return data.value as string;
    },
    enabled: !!locale && !!namespace && !!key,
    staleTime: 30 * 60 * 1000,
  });
}

// Translation helper hook that returns a translation function
export function useTranslate(locale: string) {
  const { data: translations } = useTranslations(locale);

  const translate = (key: string, namespace: string = 'common', fallback?: string): string => {
    if (!translations) return fallback || key;

    const translation = translations.find(
      t => t.namespace === namespace && t.key === key
    );

    return translation?.value || fallback || key;
  };

  return translate;
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useUpdateTenantConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      configKey,
      configValue,
      configType,
      environment = 'production'
    }: {
      organizationId: string;
      configKey: string;
      configValue: unknown;
      configType: string;
      environment?: string;
    }) => {
      const { data, error } = await supabase
        .from('tenant_config')
        .upsert({
          organization_id: organizationId,
          config_key: configKey,
          config_value: toJson(configValue),
          config_type: configType,
          environment,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-config'] });
    },
  });
}

export function useUpdateTenantFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      featureSlug,
      isEnabled,
      config = {},
      rolloutPercentage = 0,
      allowedUsers = []
    }: {
      organizationId: string;
      featureSlug: string;
      isEnabled: boolean;
      config?: Record<string, unknown>;
      rolloutPercentage?: number;
      allowedUsers?: string[];
    }) => {
      const { data, error } = await supabase
        .from('tenant_features')
        .upsert({
          organization_id: organizationId,
          feature_slug: featureSlug,
          is_enabled: isEnabled,
          config: toJson(config),
          rollout_percentage: rolloutPercentage,
          allowed_users: allowedUsers,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-features'] });
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({
      organizationId,
      userId,
      roleSlug,
      permissions = []
    }: {
      organizationId: string;
      userId: string;
      roleSlug: string;
      permissions?: string[];
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          organization_id: organizationId,
          user_id: userId,
          role_slug: roleSlug,
          permissions,
          granted_by: user?.id ?? userId,
          granted_at: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
  });
}
