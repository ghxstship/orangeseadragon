import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { assigned_to_id } = body;

    if (!assigned_to_id) {
      return NextResponse.json({ error: 'assigned_to_id is required' }, { status: 400 });
    }

    // Get the service ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('service_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ error: 'Service ticket not found' }, { status: 404 });
    }

    // Update ticket assignment
    const { data, error } = await supabase
      .from('service_tickets')
      .update({
        assigned_to_id,
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error assigning service ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
