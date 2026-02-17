import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/support-tickets/[id]/assign
 * Assign a support ticket to a user or team
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const body = await request.json();
    const { assigned_to_user_id, assigned_team_id } = body;

    if (!assigned_to_user_id && !assigned_team_id) {
      return badRequest('Either assigned_to_user_id or assigned_team_id is required');
    }

    // Get the ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return notFound('Ticket');
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
      return supabaseError(error);
    }

    return apiSuccess(data, { message: 'Ticket assigned' });
  } catch (e) {
    captureError(e, 'api.support-tickets.id.assign.error');
    return serverError('Assignment failed');
  }
}
