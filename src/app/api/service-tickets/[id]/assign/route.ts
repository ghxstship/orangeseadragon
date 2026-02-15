import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = await params;
    const body = await request.json();
    const { assigned_to_id } = body;

    if (!assigned_to_id) {
      return badRequest('assigned_to_id is required');
    }

    // Get the service ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('service_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return notFound('Service ticket');
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
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error assigning service ticket:', error);
    return serverError();
  }
}
