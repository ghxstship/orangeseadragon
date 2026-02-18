// /app/api/onboarding/account-types/route.ts
// Get available account types for onboarding selection

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { onboardingService } from '@/lib/services/onboarding.service';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;

  try {
    const accountTypes = await onboardingService.getAccountTypes();
    return apiSuccess(accountTypes);
  } catch (err) {
    captureError(err, 'api.onboarding.accountTypes.error');
    return serverError('Failed to fetch account types');
  }
}
