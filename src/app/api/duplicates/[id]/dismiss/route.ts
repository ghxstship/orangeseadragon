import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ duplicate_dismissed: true })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .select('id')
      .single();

    if (error) {
      return error.code === 'PGRST116' ? notFound('Record') : supabaseError(error);
    }

    return apiSuccess({ dismissed: true, id: data.id });
  } catch (err) {
    captureError(err, 'api.duplicates.dismiss.error');
    return serverError('Failed to dismiss duplicate');
  }
}
