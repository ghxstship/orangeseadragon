import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const body = await request.json().catch(() => ({}));
    const ids = body.ids as string[] | undefined;

    let query = supabase
      .from('subscribers')
      .select('*')
      .eq('organization_id', membership.organization_id);

    if (ids?.length) query = query.in('id', ids);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return supabaseError(error);
    if (!data?.length) return badRequest('No subscribers to export');

    return apiSuccess({ exported: data.length, subscribers: data });
  } catch (err) {
    captureError(err, 'api.subscribers.export.error');
    return serverError('Failed to export subscribers');
  }
}
