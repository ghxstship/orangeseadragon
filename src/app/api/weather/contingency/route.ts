import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * Weather Contingency Task Branching API
 * Evaluates weather conditions against thresholds and triggers alternate task trees.
 */

interface ContingencyRule {
  id: string;
  condition: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  threshold: number;
  action: 'create_tasks' | 'reassign' | 'notify' | 'pause' | 'cancel';
  task_template_id?: string;
  notify_roles?: string[];
  description: string;
}

interface WeatherSnapshot {
  temperature: number;
  wind_speed: number;
  wind_gust?: number;
  precipitation_probability: number;
  uv_index: number;
  visibility: number;
  humidity: number;
}

function evaluateRule(weather: WeatherSnapshot, rule: ContingencyRule): boolean {
  const conditionMap: Record<string, number> = {
    temperature: weather.temperature,
    wind_speed: weather.wind_speed,
    wind_gust: weather.wind_gust ?? weather.wind_speed,
    precipitation: weather.precipitation_probability,
    uv_index: weather.uv_index,
    visibility: weather.visibility,
    humidity: weather.humidity,
  };

  const value = conditionMap[rule.condition];
  if (value === undefined) return false;

  switch (rule.operator) {
    case 'gt': return value > rule.threshold;
    case 'lt': return value < rule.threshold;
    case 'gte': return value >= rule.threshold;
    case 'lte': return value <= rule.threshold;
    case 'eq': return value === rule.threshold;
    default: return false;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { event_id, weather, rules } = body as {
      event_id: string;
      weather: WeatherSnapshot;
      rules?: ContingencyRule[];
    };

    if (!event_id || !weather) {
      return badRequest('event_id and weather snapshot are required');
    }

    // Use provided rules or load from DB
    let contingencyRules: ContingencyRule[] = rules || [];

    if (!rules || rules.length === 0) {
      const { data: dbRules } = await supabase
        .from('weather_contingency_rules')
        .select('*')
        .eq('event_id', event_id)
        .eq('is_active', true);

      if (dbRules) {
        contingencyRules = dbRules.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          condition: String(r.condition),
          operator: String(r.operator) as ContingencyRule['operator'],
          threshold: Number(r.threshold),
          action: String(r.action) as ContingencyRule['action'],
          task_template_id: r.task_template_id ? String(r.task_template_id) : undefined,
          notify_roles: r.notify_roles as string[] | undefined,
          description: String(r.description || ''),
        }));
      }
    }

    // Default rules if none configured
    if (contingencyRules.length === 0) {
      contingencyRules = [
        { id: 'default-wind', condition: 'wind_speed', operator: 'gte', threshold: 45, action: 'create_tasks', description: 'High wind — secure equipment and structures' },
        { id: 'default-rain', condition: 'precipitation', operator: 'gte', threshold: 80, action: 'create_tasks', description: 'High rain probability — activate rain plan' },
        { id: 'default-heat', condition: 'temperature', operator: 'gte', threshold: 100, action: 'notify', notify_roles: ['production_manager', 'safety_officer'], description: 'Extreme heat — hydration and shade protocols' },
        { id: 'default-visibility', condition: 'visibility', operator: 'lte', threshold: 1, action: 'pause', description: 'Low visibility — pause outdoor rigging' },
      ];
    }

    // Evaluate all rules
    const triggered: { rule: ContingencyRule; actions_taken: string[] }[] = [];

    for (const rule of contingencyRules) {
      if (evaluateRule(weather, rule)) {
        const actionsTaken: string[] = [];

        switch (rule.action) {
          case 'create_tasks': {
            // Create contingency tasks for the event
            const { error: taskError } = await supabase
              .from('tasks')
              .insert({
                title: `[WEATHER] ${rule.description}`,
                description: `Auto-generated contingency task: ${rule.condition} ${rule.operator} ${rule.threshold}. Current value triggered this rule.`,
                status: 'todo',
                priority: 'high',
                project_id: event_id,
                tags: ['weather-contingency', 'auto-generated'],
              });
            if (taskError) {
              captureError(taskError, 'weather.contingency.create_task_failed', { ruleId: rule.id });
            } else {
              actionsTaken.push('task_created');
            }
            break;
          }
          case 'pause': {
            actionsTaken.push('pause_recommended');
            break;
          }
          case 'cancel': {
            actionsTaken.push('cancel_recommended');
            break;
          }
          case 'notify': {
            actionsTaken.push(`notify_roles:${(rule.notify_roles || []).join(',')}`);
            break;
          }
          case 'reassign': {
            actionsTaken.push('reassign_recommended');
            break;
          }
        }

        triggered.push({ rule, actions_taken: actionsTaken });
      }
    }

    // Log the evaluation
    await supabase
      .from('activity_feed')
      .insert({
        entity_type: 'event',
        entity_id: event_id,
        action: 'weather_contingency_evaluated',
        details: {
          weather_snapshot: weather,
          rules_evaluated: contingencyRules.length,
          rules_triggered: triggered.length,
          triggered_rules: triggered.map((t) => t.rule.id),
        },
      })
      .then(() => {});

    return apiSuccess({
      event_id,
      evaluated_at: new Date().toISOString(),
      rules_evaluated: contingencyRules.length,
      triggered: triggered.map((t) => ({
        rule_id: t.rule.id,
        condition: t.rule.condition,
        description: t.rule.description,
        action: t.rule.action,
        actions_taken: t.actions_taken,
      })),
      weather_snapshot: weather,
    });
  } catch (error) {
    captureError(error, 'weather.contingency.evaluation_error');
    return badRequest('Invalid request body');
  }
}
