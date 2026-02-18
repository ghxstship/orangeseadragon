// /app/api/account/sessions/route.ts
// Get active sessions for the current user

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, device_info, ip_address, is_current, last_active_at, created_at')
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false })
      .limit(20);

    if (error) {
      // Table may not exist yet — return empty gracefully
      return apiSuccess([]);
    }

    return apiSuccess(data ?? []);
  } catch (err) {
    captureError(err, 'api.account.sessions.error');
    return serverError('Failed to fetch sessions');
  }
}
