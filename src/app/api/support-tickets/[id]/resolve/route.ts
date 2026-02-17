import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/support-tickets/[id]/resolve
 * Resolve a support ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json().catch(() => ({}));
    const { resolution_note } = body;

    // Get the ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return notFound('Ticket');
    }

    // Check if already resolved/closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return badRequest(`Ticket is already ${ticket.status}`);
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
      return supabaseError(error);
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

    return apiSuccess(data, { message: 'Ticket resolved' });
  } catch (e) {
    captureError(e, 'api.support-tickets.id.resolve.error');
    return serverError('Resolution failed');
  }
}
