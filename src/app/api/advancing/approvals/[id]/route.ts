import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * PATCH /api/advancing/approvals/[id]
 * Approve, reject, or request revision on a specific advance by ID.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  const { id } = await params;

  if (!id) {
    return badRequest('Advance ID is required');
  }

  try {
    const { action, notes } = await request.json();

    if (!action || !['approve', 'reject', 'revision'].includes(action)) {
      return badRequest('action must be one of: approve, reject, revision');
    }

    // Verify the advance exists
    const { data: existing, error: fetchError } = await supabase
      .from('production_advances')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return notFound('Production advance');
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      revision: 'changes_requested',
    };

    const updatePayload: Record<string, unknown> = {
      status: statusMap[action],
      approval_notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updatePayload.approved_by = user.id;
      updatePayload.approved_at = new Date().toISOString();
    } else {
      updatePayload.approved_by = null;
      updatePayload.approved_at = null;
    }

    const { error: updateError } = await supabase
      .from('production_advances')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) return supabaseError(updateError);

    return apiSuccess({ id, action, status: statusMap[action] });
  } catch (err) {
    captureError(err, 'api.advancing.approvals.id.error');
    return serverError('Failed to process approval action');
  }
}

/**
 * GET /api/advancing/approvals/[id]
 * Get a single advance approval by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { id } = await params;

  if (!id) {
    return badRequest('Advance ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('production_advances')
      .select(`
        id, title, status, advance_type, priority, estimated_cost, actual_cost,
        event_id, assigned_to, approved_by, approved_at, approval_notes,
        created_at, updated_at,
        event:events(id, name),
        assigned_user:users!production_advances_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) return supabaseError(error);
    if (!data) return notFound('Production advance');

    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.advancing.approvals.id.error');
    return serverError('Failed to fetch advance approval');
  }
}
