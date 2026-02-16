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
    const pageEnd = offset + limit - 1;

    let query = supabase
      .from('notifications')
      .select('id,type,title,message,created_at,is_read,data,entity_type,entity_id', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, pageEnd);

    if (status === 'read') {
      query = query.eq('is_read', true);
    } else if (status === 'unread') {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;
    if (error) {
      if (error.code === '42P01') {
        return apiSuccess([], { total: 0, limit, offset, hasMore: false });
      }
      return supabaseError(error);
    }

    const notifications = (data ?? []).map((item) => {
      const payload = item.data as Record<string, unknown> | null;
      const actionUrl = payload?.actionUrl || payload?.action_url;
      const actionLabel = payload?.actionLabel || payload?.action_label;

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message ?? '',
        timestamp: item.created_at,
        read: item.is_read ?? false,
        action_url: typeof actionUrl === 'string' ? actionUrl : undefined,
        action_label: typeof actionLabel === 'string' ? actionLabel : undefined,
      };
    });

    return apiSuccess(
      notifications,
      { total: count || 0, limit, offset, hasMore: (count || 0) > offset + limit }
    );
  } catch (err) {
    console.error('[v1 Notifications] GET error:', err);
    return serverError('Failed to fetch notifications');
  }
}
