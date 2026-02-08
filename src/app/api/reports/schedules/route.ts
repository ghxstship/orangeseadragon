import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/reports/schedules
 * Create or update an automated report delivery schedule.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const {
      report_definition_id,
      schedule_name,
      cron_expression,
      timezone,
      format,
      recipients,
      filters,
      is_active,
    } = body;

    if (!report_definition_id) {
      return badRequest('report_definition_id is required');
    }
    if (!cron_expression) {
      return badRequest('cron_expression is required (e.g., "0 9 * * 1" for Monday 9am)');
    }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return badRequest('At least one recipient email is required');
    }

    // Verify report definition exists
    const { data: report, error: reportError } = await supabase
      .from('report_definitions')
      .select('id, name')
      .eq('id', report_definition_id)
      .single();

    if (reportError || !report) {
      return notFound('Report definition');
    }

    const { data: schedule, error: insertError } = await supabase
      .from('report_schedules')
      .insert({
        organization_id: membership.organization_id,
        report_definition_id,
        schedule_name: schedule_name || `${report.name} — Automated`,
        cron_expression,
        timezone: timezone || 'America/New_York',
        format: format || 'pdf',
        recipients,
        filters: filters || {},
        is_active: is_active !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'report_schedule_created',
      entity_type: 'report_schedule',
      entity_id: schedule.id,
      new_values: { report_definition_id, cron_expression, recipients },
    });

    return apiCreated(schedule, { message: 'Report schedule created' });
  } catch (e) {
    console.error('[API] Report schedule creation error:', e);
    return serverError('Failed to create report schedule');
  }
}

/**
 * GET /api/reports/schedules
 * List all report delivery schedules for the organization.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager']);
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('report_definition_id');
    const activeOnly = searchParams.get('active_only');

    let query = supabase
      .from('report_schedules')
      .select('*, report_definitions(id, name, report_type)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (reportId) {
      query = query.eq('report_definition_id', reportId);
    }
    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    console.error('[API] Report schedules list error:', e);
    return serverError('Failed to list report schedules');
  }
}

/**
 * PATCH /api/reports/schedules
 * Update a report schedule (toggle active, change cron, update recipients).
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireRole(['owner', 'admin', 'manager']);
    if (auth.error) return auth.error;
    const { user, supabase, membership } = auth;

    const body = await request.json();
    const { schedule_id, ...updates } = body;

    if (!schedule_id) {
      return badRequest('schedule_id is required');
    }

    // Only allow safe fields to be updated
    const allowedFields = [
      'schedule_name', 'cron_expression', 'timezone', 'format',
      'recipients', 'filters', 'is_active',
    ];
    const safeUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return badRequest('No valid fields to update');
    }

    const { data: updated, error: updateError } = await supabase
      .from('report_schedules')
      .update(safeUpdates)
      .eq('id', schedule_id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'report_schedule_updated',
      entity_type: 'report_schedule',
      entity_id: schedule_id,
      new_values: safeUpdates,
    });

    return apiSuccess(updated, { message: 'Report schedule updated' });
  } catch (e) {
    console.error('[API] Report schedule update error:', e);
    return serverError('Failed to update report schedule');
  }
}
