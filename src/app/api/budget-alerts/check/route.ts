import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError, supabaseError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';
import { createServiceClient } from '@/lib/supabase/server';

function getCronSecret() {
  return process.env.BUDGET_ALERTS_CRON_SECRET ?? process.env.CRON_SECRET ?? null;
}

function hasValidCronSecret(request: NextRequest, secret: string) {
  const headerValue =
    request.headers.get('x-cron-secret') ??
    request.headers.get('x-api-key') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';

  const expected = Buffer.from(secret);
  const provided = Buffer.from(headerValue);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

/**
 * G8: Budget alert check — cron-triggered endpoint that checks all budgets
 * against their alert rules and dispatches notifications.
 */
export async function POST(request: NextRequest) {
  const cronSecret = getCronSecret();
  const isAuthorizedCron = Boolean(cronSecret && hasValidCronSecret(request, cronSecret));
  let userId: string | null = null;
  let organizationId: string | null = null;

  try {
    const supabase = isAuthorizedCron
      ? await createServiceClient()
      : await (async () => {
        const auth = await requirePolicy('entity.write');
        if (auth.error) return auth;
        userId = auth.user.id;
        organizationId = auth.membership.organization_id;
        return auth.supabase;
      })();

    if ('error' in supabase) {
      return supabase.error;
    }

    const { data: rules, error: rulesError } = await supabase
      .from('budget_alert_rules')
      .select('*')
      .eq('enabled', true);

    if (rulesError) {
      return supabaseError(rulesError);
    }
    if (!rules || rules.length === 0) {
      return apiSuccess({ checked: 0, triggered: 0 });
    }

    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('id, total_amount, organization_id, project_id');

    if (budgetError) {
      return supabaseError(budgetError);
    }

    const budgetIds = (budgets || []).map((budget) => budget.id);
    const { data: lineItems, error: lineItemsError } = budgetIds.length > 0
      ? await supabase
        .from('budget_line_items')
        .select('budget_id, actual_amount')
        .in('budget_id', budgetIds)
      : { data: [], error: null };

    if (lineItemsError) {
      return supabaseError(lineItemsError);
    }

    const spentByBudget = new Map<string, number>();
    for (const lineItem of lineItems || []) {
      const spent = Number(lineItem.actual_amount || 0);
      const current = spentByBudget.get(lineItem.budget_id) || 0;
      spentByBudget.set(lineItem.budget_id, current + spent);
    }

    let triggered = 0;

    for (const budget of budgets || []) {
      const totalBudget = budget.total_amount || 0;
      if (totalBudget <= 0) continue;

      const totalSpent = spentByBudget.get(budget.id) || 0;
      const burnPct = (totalSpent / totalBudget) * 100;

      const matchingRules = rules.filter((rule) => {
        if (rule.organization_id && rule.organization_id !== budget.organization_id) return false;
        if (rule.budget_id && rule.budget_id !== budget.id) return false;
        return burnPct >= rule.threshold_percent;
      });

      for (const rule of matchingRules) {
        const lastTriggered = rule.last_triggered_at ? new Date(rule.last_triggered_at) : null;
        const now = new Date();

        if (lastTriggered && now.getTime() - lastTriggered.getTime() < 24 * 60 * 60 * 1000) {
          continue;
        }

        const recipientsRaw = rule.recipients;
        const recipients = typeof recipientsRaw === 'string' ? JSON.parse(recipientsRaw) : recipientsRaw;
        const channel = rule.channel || 'in-app';

        if (channel === 'in-app' && Array.isArray(recipients)) {
          const notifications = recipients.map((recipientId: string) => ({
            user_id: recipientId,
            organization_id: budget.organization_id,
            title: 'Budget Alert',
            message: `Budget for project ${budget.project_id} has reached ${burnPct.toFixed(0)}% (threshold: ${rule.threshold_percent}%)`,
            type: 'budget_alert',
            entity_type: 'budget',
            entity_id: budget.id,
            is_read: false,
          }));
          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        }

        await supabase
          .from('budget_alert_rules')
          .update({ last_triggered_at: now.toISOString() })
          .eq('id', rule.id);

        triggered++;
      }
    }

    return apiSuccess({ checked: budgets?.length || 0, triggered });
  } catch (err) {
    captureError(err, 'api.budget_alerts.check.unhandled_error', {
      organization_id: organizationId,
      user_id: userId,
      is_cron_invocation: isAuthorizedCron,
    });
    return serverError('Failed to check budget alerts');
  }
}
