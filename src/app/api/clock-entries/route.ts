// /app/api/clock-entries/route.ts
// Clock entries API — create and list time clock entries

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

  try {
    const { data, error, count } = await supabase
      .from('clock_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return supabaseError(error);

    return apiSuccess({ items: data || [], total: count || 0 });
  } catch (err) {
    console.error('[Clock Entries API] GET error:', err);
    return serverError('Failed to fetch clock entries');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const body = await request.json();
    const { type, timestamp, latitude, longitude, location_name } = body;

    if (!type || !['clock_in', 'clock_out', 'break_start', 'break_end'].includes(type)) {
      return badRequest('type must be one of: clock_in, clock_out, break_start, break_end');
    }

    const { data, error } = await supabase
      .from('clock_entries')
      .insert({
        user_id: user.id,
        type,
        timestamp: timestamp || new Date().toISOString(),
        latitude,
        longitude,
        location_name,
      })
      .select('id')
      .single();

    if (error) return supabaseError(error);

    return apiSuccess({ id: data.id });
  } catch (err) {
    console.error('[Clock Entries API] POST error:', err);
    return serverError('Failed to create clock entry');
  }
}
