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
      .from('receipt_scans')
      .update({ status: 'processing', error_message: null, retry_count: 1 })
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) return error.code === 'PGRST116' ? notFound('Receipt scan') : supabaseError(error);
    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.receipt-scans.retry.error');
    return serverError('Failed to retry receipt scan');
  }
}
