// /app/api/v1/notifications/route.ts
// Public API v1 — notifications endpoint (API parity with internal)

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');
  const status = request.nextUrl.searchParams.get('status');

  try {
    let query = supabase
      .from('inbox_items')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(
      data || [],
      { total: count || 0, limit, offset, hasMore: (count || 0) > offset + limit }
    );
  } catch (err) {
    console.error('[v1 Notifications] GET error:', err);
    return serverError('Failed to fetch notifications');
  }
}
