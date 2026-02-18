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
    const { id } = body;

    if (!id) return badRequest('Missing clock entry ID');

    const { data, error } = await supabase
      .from('clock_entries')
      .update({ status: 'approved', approved_by: user.id, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.clock-entries.approve.error');
    return serverError('Failed to approve clock entry');
  }
}
