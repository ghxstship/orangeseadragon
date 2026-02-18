/**
 * Preference Cascade Service
 *
 * Resolves user preferences across five scopes (highest to lowest priority):
 *   1. org_enforced   — org admin locks a value; user cannot override
 *   2. user_org       — user's per-org preference
 *   3. user_global    — user's global preference (no org)
 *   4. org_default    — org-level default for new members
 *   5. system_default — platform-wide fallback
 *
 * Resolution: walk from highest priority to lowest; first non-null value wins.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ResolvedPreferences {
  theme: string;
  language: string;
  timezone: string | null;
  date_format: string;
  time_format: string;
  first_day_of_week: number;
  sidebar_collapsed: boolean;
  default_view: string | null;
  notifications: Record<string, unknown>;
  email_preferences: Record<string, unknown>;
  accessibility: Record<string, unknown>;
}

const SYSTEM_DEFAULTS: ResolvedPreferences = {
  theme: 'system',
  language: 'en',
  timezone: null,
  date_format: 'YYYY-MM-DD',
  time_format: '24h',
  first_day_of_week: 1,
  sidebar_collapsed: false,
  default_view: null,
  notifications: {},
  email_preferences: {},
  accessibility: {},
};

type PreferenceRow = Record<string, unknown> & {
  preference_scope: string;
  organization_id: string | null;
};

const PREF_KEYS = [
  'theme', 'language', 'timezone', 'date_format', 'time_format',
  'first_day_of_week', 'sidebar_collapsed', 'default_view',
  'notifications', 'email_preferences', 'accessibility',
] as const;

export class PreferenceCascadeService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Resolve effective preferences for a user within an organization context.
   */
  async resolve(userId: string, organizationId?: string | null): Promise<ResolvedPreferences> {
    const { data: rows } = await this.supabase
      .from('user_preferences')
      .select('*')
      .or(
        organizationId
          ? `and(user_id.eq.${userId},organization_id.is.null),and(user_id.eq.${userId},organization_id.eq.${organizationId}),and(preference_scope.in.(org_default,org_enforced),organization_id.eq.${organizationId})`
          : `user_id.eq.${userId}`
      );

    if (!rows || rows.length === 0) {
      return { ...SYSTEM_DEFAULTS };
    }

    // Bucket rows by scope
    const buckets: Record<string, PreferenceRow | undefined> = {};
    for (const row of rows as PreferenceRow[]) {
      const scope = row.preference_scope ?? 'user_global';
      // For user_org, only match the current org
      if (scope === 'user_org' && row.organization_id !== organizationId) continue;
      if (scope === 'org_default' && row.organization_id !== organizationId) continue;
      if (scope === 'org_enforced' && row.organization_id !== organizationId) continue;
      buckets[scope] = row;
    }

    // Resolution order: org_enforced > user_org > user_global > org_default > system_default
    const cascade = [
      buckets['org_enforced'],
      buckets['user_org'],
      buckets['user_global'],
      buckets['org_default'],
    ];

    const result = { ...SYSTEM_DEFAULTS };

    for (const key of PREF_KEYS) {
      for (const layer of cascade) {
        if (!layer) continue;
        const val = layer[key];
        if (val !== null && val !== undefined) {
          (result as Record<string, unknown>)[key] = val;
          break;
        }
      }
    }

    return result;
  }

  /**
   * Save a user's preference at a specific scope.
   */
  async save(
    userId: string,
    scope: 'user_global' | 'user_org',
    preferences: Partial<ResolvedPreferences>,
    organizationId?: string | null
  ): Promise<{ success: boolean; error?: string }> {
    const orgId = scope === 'user_org' ? organizationId ?? null : null;

    const { error } = await this.supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          organization_id: orgId,
          preference_scope: scope,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,organization_id' }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  /**
   * Save org-level defaults or enforced preferences (admin only).
   */
  async saveOrgPreference(
    adminUserId: string,
    organizationId: string,
    scope: 'org_default' | 'org_enforced',
    preferences: Partial<ResolvedPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: adminUserId,
          organization_id: organizationId,
          preference_scope: scope,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,organization_id' }
      );

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}
