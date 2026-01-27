import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/support-tickets/[id]/assign
 * Assign a support ticket to a user or team
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assigned_to_user_id, assigned_team_id } = body;

    if (!assigned_to_user_id && !assigned_team_id) {
      return NextResponse.json({ 
        error: 'Either assigned_to_user_id or assigned_team_id is required' 
      }, { status: 400 });
    }

    // Get the ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update the ticket
    const updateData: Record<string, unknown> = {};
    if (assigned_to_user_id) updateData.assigned_to_user_id = assigned_to_user_id;
    if (assigned_team_id) updateData.assigned_team_id = assigned_team_id;
    
    // Set status to open if it was new
    if (ticket.status === 'new') {
      updateData.status = 'open';
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Ticket assigned'
    });
  } catch (e) {
    console.error('[API] Ticket assign error:', e);
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}
