// /app/api/onboarding/complete/route.ts
// Mark onboarding as complete for the current user

import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function POST() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    // Update user metadata to mark onboarding complete
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
    });

    if (metaError) {
      return supabaseError({ message: metaError.message, code: metaError.name });
    }

    // Also record in onboarding_progress table if it exists
    await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return apiSuccess({ completed: true });
  } catch (err) {
    console.error('[Onboarding Complete] error:', err);
    return serverError('Failed to complete onboarding');
  }
}
