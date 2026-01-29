import { createUntypedClient as createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/support-tickets/[id]/resolve
 * Resolve a support ticket
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

    const body = await request.json().catch(() => ({}));
    const { resolution_note } = body;

    // Get the ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if already resolved/closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return NextResponse.json({ 
        error: `Ticket is already ${ticket.status}` 
      }, { status: 400 });
    }

    // Update the ticket
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add resolution comment if provided
    if (resolution_note) {
      await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: id,
          author_id: user.id,
          content: `**Resolution:** ${resolution_note}`,
          is_internal: false,
        });
    }

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Ticket resolved'
    });
  } catch (e) {
    console.error('[API] Ticket resolve error:', e);
    return NextResponse.json({ error: 'Resolution failed' }, { status: 500 });
  }
}
