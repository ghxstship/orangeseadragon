import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const body = await request.json();
    const { surviving_id } = body;

    if (!surviving_id) {
      return badRequest('surviving_id is required');
    }

    const { data: duplicate, error: fetchErr } = await supabase
      .from('contacts')
      .select('id, organization_id')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchErr || !duplicate) return notFound('Duplicate record');

    const { error: deleteErr } = await supabase
      .from('contacts')
      .update({ deleted_at: new Date().toISOString(), merged_into: surviving_id })
      .eq('id', id)
      .eq('organization_id', membership.organization_id);

    if (deleteErr) return supabaseError(deleteErr);

    return apiSuccess({ merged: true, surviving_id, deleted_id: id });
  } catch (err) {
    captureError(err, 'api.duplicates.merge.error');
    return serverError('Failed to merge duplicate');
  }
}
