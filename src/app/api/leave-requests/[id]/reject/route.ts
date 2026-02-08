import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/leave-requests/[id]/reject
 * Reject a leave request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return badRequest('Rejection reason is required');
    }

    // Get the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !leaveRequest) {
      return notFound('Leave request');
    }

    // Check if already processed
    if (leaveRequest.status !== 'pending') {
      return badRequest(`Leave request is already ${leaveRequest.status}`);
    }

    // Get approver's staff member record
    const { data: approver } = await supabase
      .from('staff_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Update the leave request
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        approver_id: approver?.id || null,
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Leave request rejected' });
  } catch (e) {
    console.error('[API] Leave rejection error:', e);
    return serverError('Rejection failed');
  }
}
