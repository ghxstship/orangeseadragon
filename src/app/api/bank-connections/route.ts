import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false });

    if (error) return supabaseError(error);
    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.bank-connections.get.error');
    return serverError('Failed to fetch bank connections');
  }
}
