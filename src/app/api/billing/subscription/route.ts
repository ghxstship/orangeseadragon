// /app/api/billing/subscription/route.ts
// Billing subscription API — get current subscription status

import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const orgId = user.user_metadata?.organization_id;
    if (!orgId) {
      return apiSuccess({ subscription: null, plan: 'free' });
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, plan, status, current_period_start, current_period_end, cancel_at, stripe_subscription_id')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) return supabaseError(error);

    return apiSuccess({
      subscription: data,
      plan: data?.plan || 'free',
    });
  } catch (err) {
    console.error('[Billing Subscription] error:', err);
    return serverError('Failed to fetch subscription');
  }
}
