// /app/api/onboarding/initialize/route.ts
// Initialize onboarding for the current user with a selected account type

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const { accountType } = await request.json();

    if (!accountType || typeof accountType !== 'string') {
      return badRequest('accountType is required');
    }

    const orgId = membership?.organization_id ?? undefined;

    // Update user's account type
    await supabase
      .from('users')
      .update({ account_type: accountType })
      .eq('id', user.id);

    // Also store in auth metadata for middleware access
    await supabase.auth.updateUser({
      data: { account_type: accountType },
    });

    // Initialize the onboarding state machine
    const result = await onboardingService.initializeOnboarding(
      user.id,
      accountType,
      orgId
    );

    if (!result.success) {
      return badRequest(result.error || 'Failed to initialize onboarding');
    }

    return apiSuccess({ initialized: true, accountType });
  } catch (err) {
    captureError(err, 'api.onboarding.initialize.error');
    return serverError('Failed to initialize onboarding');
  }
}
