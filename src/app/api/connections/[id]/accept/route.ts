import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, forbidden, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { data: connection, error: fetchError } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !connection) {
      return notFound('Connection');
    }

    if (connection.requestee_id !== user.id) {
      return forbidden('Not authorized to accept this request');
    }

    if (connection.request_status !== 'pending') {
      return badRequest('Connection request is not pending');
    }

    const { data: updated, error: updateError } = await supabase
      .from('connections')
      .update({
        request_status: 'accepted',
        status: 'active',
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
    console.error('Error accepting connection:', error);
    return serverError();
  }
}
