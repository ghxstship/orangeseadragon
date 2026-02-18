// /app/api/system/onboarding-audit/route.ts
// Wire verification endpoint — validates onboarding, profile, settings, and tenant wiring

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';
import { PreferenceCascadeService } from '@/lib/services/preference-cascade.service';

interface AuditCheck {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  detail?: string;
}

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  const checks: AuditCheck[] = [];
  const orgId = membership?.organization_id ?? null;

  // ── 1. Account Type Configs ──────────────────────────────────────────
  try {
    const types = await onboardingService.getAccountTypes();
    checks.push({
      id: 'account-types-exist',
      category: 'Onboarding',
      description: 'Account type configs are seeded in DB',
      status: types.length > 0 ? 'pass' : 'fail',
      detail: `${types.length} active account types found`,
    });
  } catch {
    checks.push({
      id: 'account-types-exist',
      category: 'Onboarding',
      description: 'Account type configs are seeded in DB',
      status: 'fail',
      detail: 'Failed to query account_type_configs',
    });
  }

  // ── 2. Onboarding Steps ──────────────────────────────────────────────
  try {
    const steps = await onboardingService.getOnboardingSteps('owner');
    checks.push({
      id: 'onboarding-steps-seeded',
      category: 'Onboarding',
      description: 'Onboarding steps are seeded for owner account type',
      status: steps.length > 0 ? 'pass' : 'fail',
      detail: `${steps.length} steps found for owner type`,
    });
  } catch {
    checks.push({
      id: 'onboarding-steps-seeded',
      category: 'Onboarding',
      description: 'Onboarding steps are seeded for owner account type',
      status: 'fail',
      detail: 'Failed to query onboarding_steps',
    });
  }

  // ── 3. User Onboarding State ─────────────────────────────────────────
  try {
    const state = await onboardingService.getOnboardingState(user.id, orgId ?? undefined);
    checks.push({
      id: 'user-onboarding-state',
      category: 'Onboarding',
      description: 'Current user has onboarding state record',
      status: state ? 'pass' : 'warn',
      detail: state
        ? `Account type: ${state.accountTypeSlug}, completed: ${state.isCompleted}`
        : 'No onboarding state — user may not have initialized onboarding yet',
    });
  } catch {
    checks.push({
      id: 'user-onboarding-state',
      category: 'Onboarding',
      description: 'Current user has onboarding state record',
      status: 'fail',
      detail: 'Failed to query user_onboarding_state',
    });
  }

  // ── 4. Users Table Columns ───────────────────────────────────────────
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, job_title, bio, account_type, onboarding_completed_at')
      .eq('id', user.id)
      .single();

    if (error) {
      checks.push({
        id: 'users-columns',
        category: 'Schema',
        description: 'Users table has required profile columns',
        status: 'fail',
        detail: error.message,
      });
    } else {
      const missingCols: string[] = [];
      // Check if columns exist by seeing if they're in the response
      if (!('first_name' in (userData ?? {}))) missingCols.push('first_name');
      if (!('last_name' in (userData ?? {}))) missingCols.push('last_name');
      if (!('job_title' in (userData ?? {}))) missingCols.push('job_title');
      if (!('bio' in (userData ?? {}))) missingCols.push('bio');
      if (!('account_type' in (userData ?? {}))) missingCols.push('account_type');

      checks.push({
        id: 'users-columns',
        category: 'Schema',
        description: 'Users table has required profile columns',
        status: missingCols.length === 0 ? 'pass' : 'fail',
        detail: missingCols.length === 0
          ? 'All required columns present'
          : `Missing columns: ${missingCols.join(', ')}`,
      });
    }
  } catch {
    checks.push({
      id: 'users-columns',
      category: 'Schema',
      description: 'Users table has required profile columns',
      status: 'fail',
      detail: 'Failed to query users table',
    });
  }

  // ── 5. Organizations Table Columns ───────────────────────────────────
  try {
    const { error } = await supabase
      .from('organizations')
      .select('id, industry, company_size')
      .limit(1);

    checks.push({
      id: 'orgs-columns',
      category: 'Schema',
      description: 'Organizations table has industry and company_size columns',
      status: error ? 'fail' : 'pass',
      detail: error ? error.message : 'Columns present',
    });
  } catch {
    checks.push({
      id: 'orgs-columns',
      category: 'Schema',
      description: 'Organizations table has industry and company_size columns',
      status: 'fail',
      detail: 'Failed to query organizations table',
    });
  }

  // ── 6. User Preferences Table ────────────────────────────────────────
  try {
    const { error } = await supabase
      .from('user_preferences')
      .select('id, preference_scope, organization_id')
      .eq('user_id', user.id)
      .limit(1);

    checks.push({
      id: 'preferences-table',
      category: 'Schema',
      description: 'user_preferences table supports preference cascade',
      status: error ? 'fail' : 'pass',
      detail: error ? error.message : 'Table accessible with cascade columns',
    });
  } catch {
    checks.push({
      id: 'preferences-table',
      category: 'Schema',
      description: 'user_preferences table supports preference cascade',
      status: 'fail',
      detail: 'Failed to query user_preferences',
    });
  }

  // ── 7. Preference Cascade Resolution ─────────────────────────────────
  try {
    const service = new PreferenceCascadeService(supabase);
    const resolved = await service.resolve(user.id, orgId);
    checks.push({
      id: 'preference-cascade',
      category: 'Preferences',
      description: 'Preference cascade resolves without error',
      status: 'pass',
      detail: `Resolved theme=${resolved.theme}, timezone=${resolved.timezone ?? 'null'}`,
    });
  } catch (err) {
    checks.push({
      id: 'preference-cascade',
      category: 'Preferences',
      description: 'Preference cascade resolves without error',
      status: 'fail',
      detail: String(err),
    });
  }

  // ── 8. Notification Preferences Table ────────────────────────────────
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .select('id, category_overrides')
      .eq('user_id', user.id)
      .limit(1);

    checks.push({
      id: 'notification-prefs',
      category: 'Schema',
      description: 'notification_preferences table has category_overrides column',
      status: error ? 'fail' : 'pass',
      detail: error ? error.message : 'Table accessible',
    });
  } catch {
    checks.push({
      id: 'notification-prefs',
      category: 'Schema',
      description: 'notification_preferences table has category_overrides column',
      status: 'fail',
      detail: 'Failed to query notification_preferences',
    });
  }

  // ── 9. Org Membership ────────────────────────────────────────────────
  try {
    const { data: members, error } = await supabase
      .from('organization_members')
      .select('id, organization_id, is_owner, status')
      .eq('user_id', user.id)
      .eq('status', 'active');

    checks.push({
      id: 'org-membership',
      category: 'Tenant',
      description: 'Current user has active org membership(s)',
      status: error ? 'fail' : (members && members.length > 0 ? 'pass' : 'warn'),
      detail: error
        ? error.message
        : `${members?.length ?? 0} active membership(s)`,
    });
  } catch {
    checks.push({
      id: 'org-membership',
      category: 'Tenant',
      description: 'Current user has active org membership(s)',
      status: 'fail',
      detail: 'Failed to query organization_members',
    });
  }

  // ── 10. User Sessions Table ──────────────────────────────────────────
  try {
    const { error } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    checks.push({
      id: 'sessions-table',
      category: 'Schema',
      description: 'user_sessions table is accessible',
      status: error ? 'warn' : 'pass',
      detail: error ? `Table may not exist: ${error.message}` : 'Table accessible',
    });
  } catch {
    checks.push({
      id: 'sessions-table',
      category: 'Schema',
      description: 'user_sessions table is accessible',
      status: 'warn',
      detail: 'Failed to query user_sessions',
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'pass').length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const warned = checks.filter((c) => c.status === 'warn').length;

  return apiSuccess({
    summary: {
      total: checks.length,
      passed,
      failed,
      warned,
      score: Math.round((passed / checks.length) * 100),
    },
    checks,
  });
}
