// /app/api/onboarding/state/route.ts
// Get current user's onboarding state and progress summary

import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const orgId = user.user_metadata?.organization_id;
    const summary = await onboardingService.getOnboardingSummary(user.id, orgId);

    if (!summary) {
      return apiSuccess({ initialized: false });
    }

    return apiSuccess({ initialized: true, ...summary });
  } catch (err) {
    console.error('[Onboarding State] error:', err);
    return serverError('Failed to fetch onboarding state');
  }
}
