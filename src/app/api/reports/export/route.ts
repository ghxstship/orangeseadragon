import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import { getReportTemplate } from '@/lib/reports/report-templates';

const exportReportSchema = z.object({
  reportId: z.string().uuid('reportId must be a valid UUID'),
  format: z.enum(['pdf', 'csv', 'xlsx']).default('csv'),
  filters: z.record(z.unknown()).optional(),
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
 * POST /api/reports/export
 * Export a report in PDF, CSV, or XLSX format
 */
export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = exportReportSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { reportId, format, filters = {} } = parsedBody.data;

  try {
    const normalizedFilters = isRecord(filters) ? filters : {};

    // Fetch report definition
    const { data: report, error: fetchError } = await supabase
      .from('report_definitions')
      .select('id, name, slug, organization_id, query_config')
      .eq('id', reportId)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (fetchError) {
      return supabaseError(fetchError);
    }

    if (!report) {
      return notFound('Report definition');
    }

    const reportDefinition = report as ReportDefinitionRecord;
    const dataSource = resolveDataSource(reportDefinition);
    if (!dataSource) {
      return badRequest('Unable to resolve report data source from definition query_config or template slug');
    }

    const dateField = resolveDateField(reportDefinition.query_config);

    // Execute the report query to get data
    let reportData: Record<string, unknown>[] = [];

    const orgFilterField =
      dataSource === 'time_entries'
        ? 'org_id'
        : dataSource === 'notifications'
          ? 'user_id'
          : 'organization_id';

    let dataQuery = supabase
      .from(dataSource)
      .select('*')
      .limit(10000)
      .order(dateField, { ascending: false });

    if (orgFilterField === 'user_id') {
      dataQuery = dataQuery.eq('user_id', user.id);
    } else {
      dataQuery = dataQuery.eq(orgFilterField, membership.organization_id);
    }

    const { data, error: queryError } = await dataQuery;

    if (queryError) {
      return supabaseError(queryError);
    }
    reportData = (data || []) as Record<string, unknown>[];

    // Apply filters
    const filteredData = reportData.filter((row) => {
      return Object.entries(normalizedFilters).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        return row[key] === value;
      });
    });

    // Generate export based on format
    let content: string;
    let contentType: string;
    let filename: string;

    const reportName = (reportDefinition.name || 'report').replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv': {
        if (filteredData.length === 0) {
          content = '';
        } else {
          const headers = Object.keys(filteredData[0] ?? {});
          const csvRows = [
            headers.join(','),
            ...filteredData.map(row =>
              headers.map(h => {
                const val = (row as Record<string, unknown>)[h];
                const str = val === null || val === undefined ? '' : String(val);
                return str.includes(',') || str.includes('"') || str.includes('\n')
                  ? `"${str.replace(/"/g, '""')}"`
                  : str;
              }).join(',')
            ),
          ];
          content = csvRows.join('\n');
        }
        contentType = 'text/csv';
        filename = `${reportName}_${timestamp}.csv`;
        break;
      }

      case 'xlsx': {
        // Generate a simple XML-based spreadsheet (Office Open XML compatible)
        const headers = filteredData.length > 0 ? Object.keys(filteredData[0] ?? {}) : [];
        const xmlRows = filteredData.map(row =>
          `<Row>${headers.map(h => {
            const val = (row as Record<string, unknown>)[h];
            const str = val === null || val === undefined ? '' : String(val);
            const isNum = !isNaN(Number(str)) && str !== '';
            return isNum
              ? `<Cell><Data ss:Type="Number">${str}</Data></Cell>`
              : `<Cell><Data ss:Type="String">${str.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`;
          }).join('')}</Row>`
        ).join('\n');

        content = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${reportName}">
    <Table>
      <Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>
      ${xmlRows}
    </Table>
  </Worksheet>
</Workbook>`;
        contentType = 'application/vnd.ms-excel';
        filename = `${reportName}_${timestamp}.xls`;
        break;
      }

      case 'pdf': {
        // Generate a simple HTML-based PDF-ready document
        const headers = filteredData.length > 0 ? Object.keys(filteredData[0] ?? {}) : [];
        const tableRows = filteredData.map(row =>
          `<tr>${headers.map(h => `<td style="border:1px solid #ddd;padding:6px">${(row as Record<string, unknown>)[h] ?? ''}</td>`).join('')}</tr>`
        ).join('\n');

        content = `<!DOCTYPE html>
<html>
<head><title>${reportDefinition.name}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 40px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .meta { color: #666; margin-bottom: 24px; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #f5f5f5; border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
  td { font-size: 11px; }
  .footer { margin-top: 24px; font-size: 10px; color: #999; }
</style>
</head>
<body>
  <h1>${reportDefinition.name}</h1>
  <div class="meta">Generated: ${new Date().toLocaleString()} | Rows: ${filteredData.length}</div>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">ATLVS Report Export — ${timestamp}</div>
</body>
</html>`;
        contentType = 'text/html';
        filename = `${reportName}_${timestamp}.html`;
        break;
      }

      default:
        return badRequest('Unsupported format');
    }

    // Log the export
    await supabase.from('audit_logs').insert({
      organization_id: membership.organization_id,
      user_id: user.id,
      action: 'report_exported',
      entity_type: 'report_definition',
      entity_id: reportId,
      new_values: { format, row_count: filteredData.length, filename },
    });

    return apiSuccess({
      filename,
      content_type: contentType,
      content,
      row_count: filteredData.length,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    if (isSupabaseError(e)) {
      return supabaseError(e);
    }

    captureError(e, 'api.reports.export.error', {
      report_definition_id: reportId,
      organization_id: membership.organization_id,
      ...requestContext,
    });
    return serverError('Failed to export report');
  }
}
