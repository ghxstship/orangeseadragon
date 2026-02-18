import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, notFound, supabaseError, serverError } from '@/lib/api/response';
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
    const { data: original, error: fetchErr } = await supabase
      .from('lead_score_rules')
      .select('*')
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (fetchErr) return fetchErr.code === 'PGRST116' ? notFound('Lead score rule') : supabaseError(fetchErr);

    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original;
    const { data, error } = await supabase
      .from('lead_score_rules')
      .insert({ ...rest, name: `${rest.name} (Copy)` })
      .select()
      .single();

    if (error) return supabaseError(error);
    return apiCreated(data);
  } catch (err) {
    captureError(err, 'api.lead-scores.duplicate.error');
    return serverError('Failed to duplicate lead score rule');
  }
}
