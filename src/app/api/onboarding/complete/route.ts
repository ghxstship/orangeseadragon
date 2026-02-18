// /app/api/onboarding/complete/route.ts
// Mark onboarding as complete for the current user

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const now = new Date().toISOString();
    const orgId = membership?.organization_id ?? null;

    // Update user metadata to mark onboarding complete
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_completed_at: now,
      },
    });

    if (metaError) {
      return supabaseError({ message: metaError.message, code: metaError.name });
    }

    // Update the users table
    await supabase
      .from('users')
      .update({ onboarding_completed_at: now })
      .eq('id', user.id);

    // Update user_onboarding_state to mark completed
    await supabase
      .from('user_onboarding_state')
      .update({
        is_completed: true,
        completed_at: now,
      })
      .eq('user_id', user.id)
      .eq('organization_id', orgId);

    return apiSuccess({ completed: true });
  } catch (err) {
    captureError(err, 'api.onboarding.complete.error');
    return serverError('Failed to complete onboarding');
  }
}
