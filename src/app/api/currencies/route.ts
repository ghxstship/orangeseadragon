// /app/api/currencies/route.ts
// Currencies API — list available currencies

import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET() {
  const auth = await requireAuth();
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
    console.error('[Currencies API] error:', err);
    return serverError('Failed to fetch currencies');
  }
}
