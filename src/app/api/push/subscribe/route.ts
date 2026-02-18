import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return badRequest('Push subscription endpoint is required');
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: subscription.keys || {},
          user_agent: request.headers.get('user-agent') || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,endpoint' }
      )
      .select('id')
      .single();

    if (error) return supabaseError(error);

    return apiSuccess({ subscribed: true, id: data?.id });
  } catch (err) {
    captureError(err, 'api.push.subscribe.error');
    return serverError('Failed to register push subscription');
  }
}
