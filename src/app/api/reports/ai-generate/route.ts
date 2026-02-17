import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError, supabaseError } from '@/lib/api/response';
import { createUntypedClient } from '@/lib/supabase/server';
import { searchReportTemplates } from '@/lib/reports/report-templates';
import { captureError, extractRequestContext } from '@/lib/observability';

type QueryRow = Record<string, unknown>;

const aiGenerateReportSchema = z.object({
  query: z.string().trim().min(1, 'query is required').max(500),
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

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { membership } = auth;
  const orgId = membership.organization_id;
  const supabase = await createUntypedClient();
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = aiGenerateReportSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const query = parsedBody.data.query;

  try {
    const matches = searchReportTemplates(query);
    const bestMatch = matches[0];

    if (!bestMatch) {
      return notFound('Could not find a matching report template for your query. Try being more specific.');
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);

    let dbQuery = supabase
      .from(bestMatch.dataSource)
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (orgId) {
      dbQuery = dbQuery.eq('organization_id', orgId);
    }

    if (bestMatch.filters) {
      for (const filter of bestMatch.filters) {
        switch (filter.operator) {
          case 'eq':
            dbQuery = dbQuery.eq(filter.field, filter.value);
            break;
          case 'neq':
            dbQuery = dbQuery.neq(filter.field, filter.value);
            break;
          case 'in': {
            const inValues = toStringArray(filter.value);
            if (inValues.length > 0) {
              dbQuery = dbQuery.in(filter.field, inValues);
            }
            break;
          }
          case 'gt':
            dbQuery = dbQuery.gt(filter.field, filter.value);
            break;
          case 'gte':
            dbQuery = dbQuery.gte(filter.field, filter.value);
            break;
          case 'lt':
            dbQuery = dbQuery.lt(filter.field, filter.value);
            break;
          case 'lte':
            dbQuery = dbQuery.lte(filter.field, filter.value);
            break;
        }
      }
    }

    const { data: rows, error } = await dbQuery.limit(500);

    if (error) {
      return supabaseError(error);
    }

    const safeRows: QueryRow[] = Array.isArray(rows) ? rows.filter(isQueryRow) : [];
    const dimensionField = bestMatch.dimensions[0]?.field || 'id';
    const groups = new Map<string, QueryRow[]>();

    for (const row of safeRows) {
      const key = String(row[dimensionField] ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    const chartData = Array.from(groups.entries()).map(([groupKey, groupRows]) => {
      const point: QueryRow = { [bestMatch.dimensions[0]?.key || 'name']: groupKey };
      for (const metric of bestMatch.metrics) {
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
          default:
            point[metric.key] = values.reduce((a, b) => a + b, 0);
        }
      }
      return point;
    });

    return apiSuccess({
      title: bestMatch.name,
      description: `AI-generated: ${bestMatch.description}`,
      chartType: bestMatch.chartType,
      metrics: bestMatch.metrics,
      dimensionKey: bestMatch.dimensions[0]?.key || 'name',
      data: chartData,
    });
  } catch (err) {
    if (isSupabaseError(err)) {
      return supabaseError(err);
    }

    captureError(err, 'api.reports.ai-generate.error', {
      organization_id: orgId,
      template_query: query,
      ...requestContext,
    });
    return serverError('Failed to generate report');
  }
}
