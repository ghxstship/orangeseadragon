import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

const SETTINGS_KEY = 'client_portal';

export async function GET() {
  const auth = await requireRole(['owner', 'admin']);
  if (auth.error) return auth.error;

  const { supabase, membership } = auth;

  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', membership.organization_id)
      .maybeSingle();

    if (error) return supabaseError(error);

    const settings = (data?.settings as Record<string, unknown>) || {};
    return apiSuccess((settings[SETTINGS_KEY] as Record<string, unknown>) || {});
  } catch (err) {
    captureError(err, 'api.settings.client-portal.error');
    return serverError('Failed to fetch client portal settings');
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireRole(['owner', 'admin']);
  if (auth.error) return auth.error;

  const { supabase, membership } = auth;

  try {
    const values = await request.json();

    const { data: existing, error: fetchError } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', membership.organization_id)
      .maybeSingle();

    if (fetchError) return supabaseError(fetchError);

    const current = (existing?.settings as Record<string, unknown>) || {};
    const merged = { ...current, [SETTINGS_KEY]: values };

    const { error } = await supabase
      .from('organizations')
      .update({
        settings: merged,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membership.organization_id);

    if (error) return supabaseError(error);

    return apiSuccess({ saved: true });
  } catch (err) {
    captureError(err, 'api.settings.client-portal.error');
    return serverError('Failed to save client portal settings');
  }
}
