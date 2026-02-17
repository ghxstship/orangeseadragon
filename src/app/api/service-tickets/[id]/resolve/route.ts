import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { resolution_notes } = body;

    // Get the service ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('service_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return notFound('Service ticket');
    }

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return badRequest('Ticket is already resolved or closed');
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
      return supabaseError(error);
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

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.service-tickets.id.resolve.error');
    return serverError('Failed to resolve service ticket');
  }
}
