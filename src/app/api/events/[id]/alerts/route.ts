import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');

    let query = supabase
      .from('emergency_alerts')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50);

    if (error) return supabaseError(error);

    return apiSuccess(data || []);
  } catch (err) {
    captureError(err, 'api.events.alerts.get.error');
    return serverError('Failed to fetch event alerts');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;

  try {
    const body = await request.json();
    const { severity, title, message, channels, broadcastAll } = body;

    if (!severity || !title || !message) {
      return badRequest('severity, title, and message are required');
    }

    const { data, error } = await supabase
      .from('emergency_alerts')
      .insert({
        organization_id: membership.organization_id,
        project_id: id,
        alert_type: 'event',
        severity,
        title,
        message,
        target_scope: broadcastAll ? 'all' : 'project',
        delivery_channels: channels || ['push'],
        status: 'sending',
        sent_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return supabaseError(error);

    return apiCreated(data);
  } catch (err) {
    captureError(err, 'api.events.alerts.post.error');
    return serverError('Failed to create event alert');
  }
}
