import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, apiPaginated, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import type { Database } from '@/types/database';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const getSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
});

const createSubscriptionSchema = z.object({
  reportId: z.string().uuid('reportId must be a valid UUID'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  channel: z.enum(['email', 'slack', 'in-app']),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must use HH:MM format')
    .optional(),
  webhookUrl: z.string().url('webhookUrl must be a valid URL').optional(),
  enabled: z.boolean().optional(),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership, user } = auth;
  const requestContext = extractRequestContext(_request.headers);

  const parsedQuery = getSubscriptionsQuerySchema.safeParse(
    Object.fromEntries(_request.nextUrl.searchParams.entries())
  );

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const page = parsedQuery.data.page ?? DEFAULT_PAGE;
  const limit = parsedQuery.data.limit ?? DEFAULT_LIMIT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, error, count } = await supabase
      .from('report_subscriptions')
      .select(
        '*, report_schedules!inner(id, report_definition_id, report_definitions!inner(id, organization_id, name, report_type))',
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .eq('report_schedules.report_definitions.organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return supabaseError(error);
    }

    return apiPaginated(data || [], {
      page,
      limit,
      total: count || 0,
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.reports.subscriptions.list.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to list report subscriptions');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase, user, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = createSubscriptionSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const body = parsedBody.data;

  if (body.frequency === 'weekly' && body.dayOfWeek === undefined) {
    return badRequest('dayOfWeek is required when frequency is weekly');
  }

  if (body.frequency === 'monthly' && body.dayOfMonth === undefined) {
    return badRequest('dayOfMonth is required when frequency is monthly');
  }

  if (body.channel === 'slack' && !body.webhookUrl) {
    return badRequest('webhookUrl is required when channel is slack');
  }

  try {
    const { data: schedule, error: scheduleError } = await supabase
      .from('report_schedules')
      .select('id, report_definitions!inner(id, organization_id)')
      .eq('id', body.reportId)
      .eq('report_definitions.organization_id', membership.organization_id)
      .maybeSingle();

    if (scheduleError) {
      return supabaseError(scheduleError);
    }

    if (!schedule) {
      return badRequest('reportId is not accessible in the current organization context');
    }

    const payload: Database['public']['Tables']['report_subscriptions']['Insert'] = {
      report_schedule_id: body.reportId,
      user_id: user.id,
      delivery_method: body.channel,
      delivery_config: {
        frequency: body.frequency,
        day_of_week: body.dayOfWeek,
        day_of_month: body.dayOfMonth,
        delivery_time: body.time,
        webhook_url: body.webhookUrl,
      },
      is_active: body.enabled ?? true,
    };

    const { data, error } = await supabase
      .from('report_subscriptions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data, {
      message: 'Report subscription created',
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.reports.subscriptions.create.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create report subscription');
  }
}
