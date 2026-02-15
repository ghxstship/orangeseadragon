import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = await params;

    // Get the email sequence
    const { data: sequence, error: fetchError } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !sequence) {
      return notFound('Email sequence');
    }

    if (sequence.status === 'active') {
      return badRequest('Sequence is already active');
    }

    // Update sequence status
    const { data, error } = await supabase
      .from('email_sequences')
      .update({
        status: 'active',
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
    console.error('Error activating email sequence:', error);
    return serverError();
  }
}
