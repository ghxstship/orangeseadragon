// /app/api/advancing/approvals/route.ts
// Advancing approvals — list and manage advance approval requests

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('eventId');
  const status = searchParams.get('status') || 'pending';

  try {
    let query = supabase
      .from('production_advances')
      .select(`
        id, title, status, advance_type, priority, estimated_cost, actual_cost,
        event_id, assigned_to, created_at, updated_at,
        event:events(id, name),
        assigned_user:users!production_advances_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .is('deleted_at', null)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);

    // Show approvals assigned to or created by the current user
    query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);

    const { data, error } = await query;
    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.advancing.approvals.error');
    return serverError('Failed to fetch advance approvals');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { advanceId, action, notes } = await request.json();

    if (!advanceId) return badRequest('advanceId is required');
    if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
      return badRequest('action must be one of: approve, reject, request_changes');
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      request_changes: 'changes_requested',
    };

    const { error } = await supabase
      .from('production_advances')
      .update({
        status: statusMap[action],
        approved_by: action === 'approve' ? user.id : null,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        approval_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', advanceId);

    if (error) return supabaseError(error);

    return apiSuccess({ action, advanceId });
  } catch (err) {
    captureError(err, 'api.advancing.approvals.error');
    return serverError('Failed to process approval');
  }
}
