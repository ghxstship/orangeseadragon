// /app/api/currencies/route.ts
// Currencies API — list available currencies

import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET() {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('code, name, symbol, decimal_places, is_default')
      .order('is_default', { ascending: false })
      .order('code', { ascending: true });

    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.currencies.error');
    return serverError('Failed to fetch currencies');
  }
}
