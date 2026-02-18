import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id } = await params;

    // Get the exhibitor
    const { data: exhibitor, error: fetchError } = await supabase
      .from('exhibitors')
      .select('id, status')
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
    captureError(error, 'api.exhibitors.id.confirm.error');
    return serverError('Failed to confirm exhibitor');
  }
}
