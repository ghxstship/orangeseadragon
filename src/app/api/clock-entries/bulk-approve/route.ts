import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest('Missing or empty clock entry IDs array');
    }

    const { data, error } = await supabase
      .from('clock_entries')
      .update({ status: 'approved', approved_by: user.id, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) return supabaseError(error);

    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.clock-entries.bulk-approve.error');
    return serverError('Failed to bulk approve clock entries');
  }
}
