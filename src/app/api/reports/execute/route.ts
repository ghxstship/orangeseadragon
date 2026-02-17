import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError, supabaseError } from '@/lib/api/response';
import { createUntypedClient } from '@/lib/supabase/server';
import { getReportTemplate } from '@/lib/reports/report-templates';
import { captureError, extractRequestContext } from '@/lib/observability';

type QueryRow = Record<string, unknown>;

const executeReportQuerySchema = z.object({
  templateId: z.string().min(1, 'templateId required'),
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function isQueryRow(value: unknown): value is QueryRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { membership } = auth;
  const supabase = await createUntypedClient();
  const requestContext = extractRequestContext(request.headers);

  const parsedQuery = executeReportQuerySchema.safeParse({
    templateId: request.nextUrl.searchParams.get('templateId') ?? '',
    period: request.nextUrl.searchParams.get('period') ?? undefined,
  });

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { templateId, period = 'month' } = parsedQuery.data;

  const template = getReportTemplate(templateId);
  if (!template) {
    return notFound('Template');
  }

  const orgId = membership.organization_id;

  const now = new Date();
  let startDate: Date;
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    let query = supabase
      .from(template.dataSource)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    if (template.filters) {
      for (const filter of template.filters) {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.field, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.field, filter.value);
            break;
          case 'in':
            {
              const inValues = toStringArray(filter.value);
              if (inValues.length > 0) {
                query = query.in(filter.field, inValues);
              }
            }
            break;
          case 'gt':
            query = query.gt(filter.field, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.field, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.field, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.field, filter.value);
            break;
        }
      }
    }

    const { data: rows, error } = await query.limit(1000);

    if (error) {
      return supabaseError(error);
    }

    const safeRows: QueryRow[] = Array.isArray(rows) ? rows.filter(isQueryRow) : [];
    const dimensionField = template.dimensions[0]?.field || 'id';
    const groups = new Map<string, QueryRow[]>();

    for (const row of safeRows) {
      const key = String(row[dimensionField] ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    const chartData = Array.from(groups.entries()).map(([groupKey, groupRows]) => {
      const point: QueryRow = { [template.dimensions[0]?.key || 'name']: groupKey };

      for (const metric of template.metrics) {
        const values = groupRows.map((row) => Number(row[metric.field] ?? 0) || 0);
        switch (metric.aggregation) {
          case 'sum':
            point[metric.key] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            point[metric.key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            point[metric.key] = groupRows.length;
            break;
          case 'min':
            point[metric.key] = Math.min(...values);
            break;
          case 'max':
            point[metric.key] = Math.max(...values);
            break;
          case 'median': {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            point[metric.key] = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            break;
          }
        }
      }

      return point;
    });

    return apiSuccess(chartData, {
      total: chartData.length,
      period: { start: startDate.toISOString(), end: now.toISOString() },
      generatedAt: now.toISOString(),
      dataSource: template.dataSource,
    });
  } catch (err) {
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.reports.execute.error', {
      template_id: templateId,
      organization_id: orgId,
      ...requestContext,
    });
    return serverError('Failed to execute report');
  }
}
