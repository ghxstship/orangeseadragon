// /app/api/activity/route.ts
// Proxy to activity feed — transforms to TabRenderer's ActivityEntry format

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const entityId = request.nextUrl.searchParams.get('entityId');
  if (!entityId) {
    return apiSuccess({ items: [] });
  }

  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('entity_id', entityId)
      .order('activity_at', { ascending: false })
      .limit(50);

    if (error) {
      return supabaseError(error);
    }

    type ActivityRow = {
      id: string;
      activity_type: string;
      actor_name: string | null;
      title: string;
      content: string | null;
      metadata: Record<string, unknown> | null;
      activity_at: string;
    };

    const actionMap: Record<string, string> = {
      status_change: 'status_change',
      comment: 'commented',
      note: 'updated',
      email: 'updated',
      call: 'updated',
      meeting: 'updated',
      task: 'created',
      approval: 'assigned',
    };

    const items = ((data || []) as ActivityRow[]).map((row) => ({
      id: row.id,
      action: actionMap[row.activity_type] || 'updated',
      user: row.actor_name || 'System',
      timestamp: row.activity_at,
      details: row.content || row.title,
      field: (row.metadata as Record<string, unknown> | null)?.field as string | undefined,
      oldValue: (row.metadata as Record<string, unknown> | null)?.old_value as string | undefined,
      newValue: (row.metadata as Record<string, unknown> | null)?.new_value as string | undefined,
    }));

    return apiSuccess({ items });
  } catch (err) {
    console.error('[Activity API] Error:', err);
    return serverError('Failed to fetch activity');
  }
}
