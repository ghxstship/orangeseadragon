// /app/api/onboarding/step/route.ts
// Complete or skip an onboarding step

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const { stepSlug, action, data } = await request.json();

    if (!stepSlug) return badRequest('stepSlug is required');
    if (!action || !['start', 'complete', 'skip'].includes(action)) {
      return badRequest('action must be one of: start, complete, skip');
    }

    const orgId = user.user_metadata?.organization_id;
    let result;

    switch (action) {
      case 'start':
        result = await onboardingService.startStep(user.id, stepSlug, orgId);
        break;
      case 'complete':
        result = await onboardingService.completeStep(user.id, stepSlug, data, orgId);
        break;
      case 'skip':
        result = await onboardingService.skipStep(user.id, stepSlug, orgId);
        break;
    }

    if (!result?.success) {
      return badRequest(result?.error || 'Step action failed');
    }

    return apiSuccess({ success: true });
  } catch (err) {
    console.error('[Onboarding Step] error:', err);
    return serverError('Failed to update onboarding step');
  }
}
