import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import { getReportTemplate } from '@/lib/reports/report-templates';

const generateReportSchema = z.object({
  reportDefinitionId: z.string().uuid('reportDefinitionId must be a valid UUID'),
  dateRangeStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'dateRangeStart must be a valid ISO-like date string')
    .optional(),
  dateRangeEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'dateRangeEnd must be a valid ISO-like date string')
    .optional(),
});

type ReportDefinitionRecord = {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  query_config: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

function resolveDataSource(report: ReportDefinitionRecord): string | null {
  const queryConfig = isRecord(report.query_config) ? report.query_config : {};

  const dataSourceCandidate =
    (typeof queryConfig.data_source === 'string' && queryConfig.data_source) ||
    (typeof queryConfig.dataSource === 'string' && queryConfig.dataSource) ||
    (typeof queryConfig.table === 'string' && queryConfig.table) ||
    null;

  if (dataSourceCandidate) return dataSourceCandidate;

  const template = getReportTemplate(report.slug);
  return template?.dataSource || null;
}

function resolveDateField(queryConfig: unknown): string {
  if (!isRecord(queryConfig)) return 'created_at';

  const candidate =
    (typeof queryConfig.date_field === 'string' && queryConfig.date_field) ||
    (typeof queryConfig.dateField === 'string' && queryConfig.dateField) ||
    null;

  return candidate || 'created_at';
}

/**
 * POST /api/reports/generate
 * 
 * Generate a report snapshot from a report definition.
 * Executes the configured data source query and stores the result.
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

  const normalizedBody = isRecord(rawBody)
    ? {
        reportDefinitionId:
          (typeof rawBody.reportDefinitionId === 'string' && rawBody.reportDefinitionId) ||
          (typeof rawBody.report_definition_id === 'string' && rawBody.report_definition_id) ||
          undefined,
        dateRangeStart:
          (typeof rawBody.dateRangeStart === 'string' && rawBody.dateRangeStart) ||
          (typeof rawBody.date_range_start === 'string' && rawBody.date_range_start) ||
          undefined,
        dateRangeEnd:
          (typeof rawBody.dateRangeEnd === 'string' && rawBody.dateRangeEnd) ||
          (typeof rawBody.date_range_end === 'string' && rawBody.date_range_end) ||
          undefined,
      }
    : rawBody;

  const parsedBody = generateReportSchema.safeParse(normalizedBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { reportDefinitionId, dateRangeStart, dateRangeEnd } = parsedBody.data;

  try {
    // Fetch report definition with org scope
    const { data: reportDef, error: fetchError } = await supabase
      .from('report_definitions')
      .select('id, name, slug, organization_id, query_config')
      .eq('id', reportDefinitionId)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (fetchError) {
      return supabaseError(fetchError);
    }

    if (!reportDef) {
      return notFound('Report definition');
    }

    const report = reportDef as ReportDefinitionRecord;
    const dataSource = resolveDataSource(report);
    if (!dataSource) {
      return badRequest('Unable to resolve report data source from definition query_config or template slug');
    }

    const queryConfig = isRecord(report.query_config) ? report.query_config : {};
    const configuredStartDate =
      (typeof queryConfig.default_date_range_start === 'string' && queryConfig.default_date_range_start) ||
      (typeof queryConfig.defaultDateRangeStart === 'string' && queryConfig.defaultDateRangeStart) ||
      null;
    const configuredEndDate =
      (typeof queryConfig.default_date_range_end === 'string' && queryConfig.default_date_range_end) ||
      (typeof queryConfig.defaultDateRangeEnd === 'string' && queryConfig.defaultDateRangeEnd) ||
      null;

    const startDate =
      dateRangeStart ||
      configuredStartDate ||
      new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
    const endDate = dateRangeEnd || configuredEndDate || new Date().toISOString();

    if (startDate > endDate) {
      return badRequest('dateRangeStart must be earlier than or equal to dateRangeEnd');
    }

    const dateField = resolveDateField(report.query_config);

    // Execute the appropriate pre-built function based on category
    let reportData = null;
    let reportError = null;

    const orgId = membership.organization_id;

    switch (dataSource) {
      case 'project_profitability': {
        const { data, error } = await supabase.rpc('report_project_profitability', {
          p_organization_id: orgId,
          p_start_date: startDate,
          p_end_date: endDate,
        });
        reportData = data;
        reportError = error;
        break;
      }
      case 'team_utilization': {
        const { data, error } = await supabase.rpc('report_team_utilization', {
          p_organization_id: orgId,
          p_start_date: startDate,
          p_end_date: endDate,
        });
        reportData = data;
        reportError = error;
        break;
      }
      case 'sales_pipeline': {
        const { data, error } = await supabase.rpc('report_sales_pipeline', {
          p_organization_id: orgId,
        });
        reportData = data;
        reportError = error;
        break;
      }
      case 'invoice_aging': {
        const { data, error } = await supabase.rpc('report_invoice_aging', {
          p_organization_id: orgId,
        });
        reportData = data;
        reportError = error;
        break;
      }
      default: {
        const orgFilterField =
          dataSource === 'time_entries'
            ? 'org_id'
            : dataSource === 'notifications'
              ? 'user_id'
              : 'organization_id';

        let dataQuery = supabase
          .from(dataSource)
          .select('*')
          .limit(1000);

        if (orgFilterField === 'user_id') {
          dataQuery = dataQuery.eq('user_id', user.id);
        } else {
          dataQuery = dataQuery.eq(orgFilterField, orgId);
        }

        if (dateField) {
          dataQuery = dataQuery.gte(dateField, startDate).lte(dateField, endDate);
        }

        const { data, error } = await dataQuery;
        reportData = data;
        reportError = error;
      }
    }

    if (reportError) {
      return supabaseError(reportError);
    }

    // Create snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('report_snapshots')
      .insert({
        report_definition_id: reportDefinitionId,
        generated_by: user.id,
        data: reportData,
        row_count: Array.isArray(reportData) ? reportData.length : 0,
        parameters: {
          date_range_start: startDate,
          date_range_end: endDate,
          data_source: dataSource,
        },
        export_format: 'json',
      })
      .select()
      .single();

    if (snapshotError) {
      return supabaseError(snapshotError);
    }

    return apiSuccess({
      snapshot_id: snapshot.id,
      report_name: report.name,
      row_count: Array.isArray(reportData) ? reportData.length : 0,
      generated_at: snapshot.created_at,
      results: reportData,
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.reports.generate.error', {
      report_definition_id: reportDefinitionId,
      organization_id: membership.organization_id,
      ...requestContext,
    });
    return serverError('Failed to generate report');
  }
}
