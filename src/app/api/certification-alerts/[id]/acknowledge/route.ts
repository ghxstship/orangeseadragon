import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { data, error } = await supabase
      .from('employee_certifications')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.certification-alerts.acknowledge.error');
    return serverError('Failed to acknowledge certification alert');
  }
}
