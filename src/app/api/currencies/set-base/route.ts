import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) return badRequest('Missing currency ID');

    // Unset current base currency
    await supabase
      .from('currencies')
      .update({ is_base_currency: false, updated_at: new Date().toISOString() })
      .eq('is_base_currency', true);

    // Set new base currency
    const { data, error } = await supabase
      .from('currencies')
      .update({ is_base_currency: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiSuccess(data);
  } catch (err) {
    captureError(err, 'api.currencies.set-base.error');
    return serverError('Failed to set base currency');
  }
}
