import { NextRequest } from 'next/server';
import { requireOrgMember } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/emergency-alerts
 * 
 * Broadcast an emergency alert to targeted recipients.
 * Supports scoping by project, venue, department, or role.
 * 
 * GET /api/emergency-alerts
 * 
 * List active emergency alerts for the user's organization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organization_id,
      project_id,
      venue_id,
      alert_type,
      severity,
      title,
      message,
      target_scope,
      target_departments,
      target_roles,
      delivery_channels,
    } = body;

    if (!organization_id || !alert_type || !severity || !title || !message) {
      return badRequest('organization_id, alert_type, severity, title, and message are required');
    }

    const auth = await requireOrgMember(organization_id);
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; table exists in migration 00087
    const { data: alert, error: insertError } = await (supabase as any)
      .from('emergency_alerts')
      .insert({
        organization_id,
        project_id: project_id || null,
        venue_id: venue_id || null,
        alert_type,
        severity,
        title,
        message,
        target_scope: target_scope || 'all',
        target_departments: target_departments || [],
        target_roles: target_roles || [],
        delivery_channels: delivery_channels || ['push', 'sms'],
        status: 'sending',
        sent_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    return apiCreated(alert, { message: `Emergency alert "${title}" broadcast initiated` });
  } catch (error) {
    console.error('Error broadcasting emergency alert:', error);
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    const auth = await requireOrgMember(organizationId);
    if (auth.error) return auth.error;
    const { supabase } = auth;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types
    let query = (supabase as any)
      .from('emergency_alerts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    return serverError();
  }
}
