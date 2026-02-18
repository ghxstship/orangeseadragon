import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiNoContent, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { error } = await supabase
      .from('bank_connections')
      .update({ status: 'disconnected', disconnected_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', membership.organization_id);

    if (error) return error.code === 'PGRST116' ? notFound('Bank connection') : supabaseError(error);
    return apiNoContent();
  } catch (err) {
    captureError(err, 'api.bank-connections.delete.error');
    return serverError('Failed to disconnect bank connection');
  }
}
