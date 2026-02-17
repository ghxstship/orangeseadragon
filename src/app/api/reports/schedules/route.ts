import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import {
  apiCreated,
  apiPaginated,
  apiSuccess,
  badRequest,
  notFound,
  serverError,
  supabaseError,
} from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

type Json = Database['public']['Tables']['report_schedules']['Row']['filters'];

const jsonValueSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const reportScheduleFormatSchema = z.enum(['pdf', 'excel', 'csv', 'json', 'html']);

const createReportScheduleSchema = z.object({
  reportDefinitionId: z.string().uuid('reportDefinitionId must be a valid UUID'),
  name: z.string().trim().min(1).max(255).optional(),
  scheduleCron: z.string().trim().min(1).max(255),
  timezone: z.string().trim().min(1).max(100).optional(),
  format: reportScheduleFormatSchema.optional(),
  recipients: z.array(z.string().email('Recipients must be valid emails')).min(1),
  filters: z.record(z.string(), jsonValueSchema).optional(),
  isActive: z.boolean().optional(),
});

const updateReportScheduleSchema = z
  .object({
    scheduleId: z.string().uuid('scheduleId must be a valid UUID'),
    name: z.string().trim().min(1).max(255).optional(),
    scheduleCron: z.string().trim().min(1).max(255).optional(),
    timezone: z.string().trim().min(1).max(100).optional(),
    format: reportScheduleFormatSchema.optional(),
    recipients: z.array(z.string().email('Recipients must be valid emails')).min(1).optional(),
    filters: z.record(z.string(), jsonValueSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.scheduleCron !== undefined ||
      value.timezone !== undefined ||
      value.format !== undefined ||
      value.recipients !== undefined ||
      value.filters !== undefined ||
      value.isActive !== undefined,
    {
      message: 'At least one updatable field must be provided',
      path: ['scheduleId'],
    }
  );

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * POST /api/reports/schedules
 * Create or update an automated report delivery schedule.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = createReportScheduleSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const body = parsedBody.data;

  try {
    const { data: report, error: reportError } = await supabase
      .from('report_definitions')
      .select('id, name, organization_id, default_format')
      .eq('id', body.reportDefinitionId)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (reportError) {
      return supabaseError(reportError);
    }

    if (!report) {
      return notFound('Report definition');
    }

    const scheduleInsert: Database['public']['Tables']['report_schedules']['Insert'] = {
      report_definition_id: body.reportDefinitionId,
      name: body.name || `${report.name} Automated Delivery`,
      schedule_cron: body.scheduleCron,
      timezone: body.timezone || 'UTC',
      format: body.format ?? report.default_format ?? 'pdf',
      recipients: body.recipients,
      filters: body.filters ?? {},
      is_active: body.isActive ?? true,
      created_by: user.id,
    };

    const { data: schedule, error: insertError } = await supabase
      .from('report_schedules')
      .insert(scheduleInsert)
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
      new_values: {
        report_definition_id: body.reportDefinitionId,
        schedule_cron: body.scheduleCron,
        recipients: body.recipients,
      },
    });

    return apiCreated(schedule, { message: 'Report schedule created' });
  } catch (e) {
    if (isSupabaseError(e)) {
      return supabaseError(e);
    }

    captureError(e, 'api.reports.schedules.create.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create report schedule');
  }
}

/**
 * GET /api/reports/schedules
 * List all report delivery schedules for the organization.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const reportDefinitionId = searchParams.get('reportDefinitionId');
    const activeOnly = parseBoolean(searchParams.get('activeOnly'));
    const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);

    if (reportDefinitionId) {
      const parsedId = z.string().uuid().safeParse(reportDefinitionId);
      if (!parsedId.success) {
        return badRequest('reportDefinitionId must be a valid UUID');
      }
    }

    let query = supabase
      .from('report_schedules')
      .select('*, report_definitions!inner(id, name, report_type, organization_id)', {
        count: 'exact',
      })
      .eq('report_definitions.organization_id', membership.organization_id)
      .order('created_at', { ascending: false });

    if (reportDefinitionId) {
      query = query.eq('report_definition_id', reportDefinitionId);
    }
    if (activeOnly !== undefined) {
      query = query.eq('is_active', activeOnly);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiPaginated(data || [], {
      page,
      limit,
      total: count || 0,
    });
  } catch (e) {
    if (isSupabaseError(e)) {
      return supabaseError(e);
    }

    captureError(e, 'api.reports.schedules.list.unhandled_error', {
      organization_id: membership.organization_id,
    });
    return serverError('Failed to list report schedules');
  }
}

/**
 * PATCH /api/reports/schedules
 * Update a report schedule (toggle active, change cron, update recipients).
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = updateReportScheduleSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const body = parsedBody.data;

  try {
    const { data: existingSchedule, error: scheduleReadError } = await supabase
      .from('report_schedules')
      .select('id, report_definition_id, report_definitions!inner(id, organization_id)')
      .eq('id', body.scheduleId)
      .eq('report_definitions.organization_id', membership.organization_id)
      .maybeSingle();

    if (scheduleReadError) {
      return supabaseError(scheduleReadError);
    }

    if (!existingSchedule) {
      return notFound('Report schedule');
    }

    const scheduleUpdate: Database['public']['Tables']['report_schedules']['Update'] = {};
    if (body.name !== undefined) scheduleUpdate.name = body.name;
    if (body.scheduleCron !== undefined) scheduleUpdate.schedule_cron = body.scheduleCron;
    if (body.timezone !== undefined) scheduleUpdate.timezone = body.timezone;
    if (body.format !== undefined) scheduleUpdate.format = body.format;
    if (body.recipients !== undefined) scheduleUpdate.recipients = body.recipients;
    if (body.filters !== undefined) scheduleUpdate.filters = body.filters;
    if (body.isActive !== undefined) scheduleUpdate.is_active = body.isActive;

    const { data: updated, error: updateError } = await supabase
      .from('report_schedules')
      .update(scheduleUpdate)
      .eq('id', body.scheduleId)
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
      entity_id: body.scheduleId,
      new_values: scheduleUpdate,
    });

    return apiSuccess(updated, { message: 'Report schedule updated' });
  } catch (e) {
    if (isSupabaseError(e)) {
      return supabaseError(e);
    }

    captureError(e, 'api.reports.schedules.update.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to update report schedule');
  }
}
