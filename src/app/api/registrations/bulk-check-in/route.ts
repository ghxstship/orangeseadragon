import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) return badRequest('ids array is required');

    const { data, error } = await supabase
      .from('registrations')
      .update({ checked_in_at: new Date().toISOString() })
      .in('id', ids)
      .eq('organization_id', membership.organization_id)
      .is('checked_in_at', null)
      .select('id');

    if (error) return supabaseError(error);
    return apiSuccess({ checked_in: data?.length || 0 });
  } catch (err) {
    captureError(err, 'api.registrations.bulk-check-in.error');
    return serverError('Failed to bulk check in registrations');
  }
}
