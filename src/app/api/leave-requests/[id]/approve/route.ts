import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/leave-requests/[id]/approve
 * Approve a leave request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServiceClient();
  const { id } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*, staff_member:staff_members(*)')
      .eq('id', id)
      .single();

    if (fetchError || !leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Check if already processed
    if (leaveRequest.status !== 'pending') {
      return NextResponse.json({ 
        error: `Leave request is already ${leaveRequest.status}` 
      }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      leave_request: data,
      message: 'Leave request approved'
    });
  } catch (e) {
    console.error('[API] Leave approval error:', e);
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 });
  }
}
