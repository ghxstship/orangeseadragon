// /app/api/billing/subscription/route.ts
// Billing subscription API — get current subscription status

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const orgId = membership.organization_id;
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
    captureError(err, 'api.billing.subscription.error');
    return serverError('Failed to fetch subscription');
  }
}
