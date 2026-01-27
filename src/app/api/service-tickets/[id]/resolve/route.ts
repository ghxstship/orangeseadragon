import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { resolution_notes } = body;

    // Get the service ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('service_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Service ticket not found' }, { status: 404 });
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Ticket is already resolved or closed' },
        { status: 400 }
      );
    }

    // Update ticket status
    const { data, error } = await supabase
      .from('service_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add resolution message if provided
    if (resolution_notes) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      await supabase.from('ticket_messages').insert({
        ticket_id: id,
        sender_type: 'agent',
        sender_id: contact?.id,
        message: `Ticket resolved: ${resolution_notes}`,
        is_internal: false,
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error resolving service ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
