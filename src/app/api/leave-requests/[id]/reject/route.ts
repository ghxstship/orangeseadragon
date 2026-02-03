import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/leave-requests/[id]/reject
 * Reject a leave request
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

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get the leave request
    const { data: leaveRequest, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
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
        status: 'rejected',
        approver_id: approver?.id || null,
        rejection_reason: reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leave_request: data,
      message: 'Leave request rejected'
    });
  } catch (e) {
    console.error('[API] Leave rejection error:', e);
    return NextResponse.json({ error: 'Rejection failed' }, { status: 500 });
  }
}
