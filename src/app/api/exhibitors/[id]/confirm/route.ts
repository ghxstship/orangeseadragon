import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = params;

    // Get the exhibitor
    const { data: exhibitor, error: fetchError } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !exhibitor) {
      return notFound('Exhibitor');
    }

    if (exhibitor.status !== 'pending') {
      return badRequest('Exhibitor is not pending confirmation');
    }

    // Update exhibitor status
    const { data, error } = await supabase
      .from('exhibitors')
      .update({
        status: 'confirmed',
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
    console.error('Error confirming exhibitor:', error);
    return serverError();
  }
}
