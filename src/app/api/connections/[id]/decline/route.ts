import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, forbidden, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { data: connection, error: fetchError } = await supabase
      .from('connections')
      .select('id, requestee_id, request_status')
      .eq('id', id)
      .single();

    if (fetchError || !connection) {
      return notFound('Connection');
    }

    if (connection.requestee_id !== user.id) {
      return forbidden('Not authorized to decline this request');
    }

    if (connection.request_status !== 'pending') {
      return badRequest('Connection request is not pending');
    }

    const { data: updated, error: updateError } = await supabase
      .from('connections')
      .update({
        request_status: 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    return apiSuccess(updated);
  } catch (error) {
    captureError(error, 'api.connections.id.decline.error');
    return serverError('Failed to decline connection');
  }
}
