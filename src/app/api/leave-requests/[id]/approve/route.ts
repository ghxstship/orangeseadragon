import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/leave-requests/[id]/approve
 * Approve a leave request
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

    // Get the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*, staff_member:staff_members(*)')
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
        status: 'approved',
        approver_id: approver?.id || null,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    // Update leave balance (deduct from available)
    // Calculate days (simplified - should account for half days and weekends)
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    await supabase.rpc('update_leave_balance', {
      p_staff_member_id: leaveRequest.staff_member_id,
      p_leave_type_id: leaveRequest.leave_type_id,
      p_days: days,
      p_action: 'approve'
    });

    return apiSuccess(data, { message: 'Leave request approved' });
  } catch (e) {
    console.error('[API] Leave approval error:', e);
    return serverError('Approval failed');
  }
}
