// /app/api/v1/notifications/route.ts
// Public API v1 — notifications endpoint (API parity with internal)

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const notificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  status: z.enum(['read', 'unread']).optional(),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;
  const requestContext = extractRequestContext(request.headers);

  const parsedQuery = notificationsQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    offset: request.nextUrl.searchParams.get('offset') ?? undefined,
    status: request.nextUrl.searchParams.get('status') ?? undefined,
  });

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const limit = parsedQuery.data.limit ?? 50;
  const offset = parsedQuery.data.offset ?? 0;
  const status = parsedQuery.data.status;

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
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.v1.notifications.error', {
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to fetch notifications');
  }
}
