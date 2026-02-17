// /app/api/onboarding/state/route.ts
// Get current user's onboarding state and progress summary

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, membership } = auth;

  try {
    const orgId = membership.organization_id;
    const summary = await onboardingService.getOnboardingSummary(user.id, orgId);

    if (!summary) {
      return apiSuccess({ initialized: false });
    }

    return apiSuccess({ initialized: true, ...summary });
  } catch (err) {
    captureError(err, 'api.onboarding.state.error');
    return serverError('Failed to fetch onboarding state');
  }
}
