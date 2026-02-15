// /app/api/settings/platform/route.ts
// Platform settings API — read and update user/org platform preferences

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return supabaseError(error);

    return apiSuccess(data?.settings || {});
  } catch (err) {
    console.error('[Settings API] GET error:', err);
    return serverError('Failed to fetch settings');
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;

  try {
    const values = await request.json();

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        settings: values,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) return supabaseError(error);

    return apiSuccess({ saved: true });
  } catch (err) {
    console.error('[Settings API] PUT error:', err);
    return serverError('Failed to save settings');
  }
}
