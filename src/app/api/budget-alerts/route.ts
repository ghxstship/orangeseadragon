import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const createAlertRuleSchema = z.object({
  budgetId: z.string().uuid().optional(),
  thresholdPercent: z.coerce.number().min(1).max(100),
  channel: z.enum(['email', 'slack', 'in-app', 'sms']),
  recipients: z.array(z.string().uuid()).optional(),
  enabled: z.boolean().optional(),
});

/**
 * G8: Budget overrun automated warnings.
 * GET: List alert rules for the org
 * POST: Create/update a budget alert rule
 */
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const { data, error } = await supabase
    .from('budget_alert_rules')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('threshold_percent', { ascending: true });

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess(data || []);
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

  const parsed = createAlertRuleSchema.safeParse(rawBody);
  if (!parsed.success) {
    return badRequest('Validation failed', {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const body = parsed.data;

  try {
    const payload = {
      budget_id: body.budgetId || null,
      organization_id: membership.organization_id,
      threshold_percent: body.thresholdPercent,
      channel: body.channel,
      recipients: JSON.stringify(body.recipients || []),
      enabled: body.enabled ?? true,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('budget_alert_rules')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch (error) {
    captureError(error, 'api.budget_alerts.create.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create budget alert rule');
  }
}
