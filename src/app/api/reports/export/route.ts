import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/reports/export
 * Export a report in PDF, CSV, or XLSX format
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { report_id, format = 'csv', filters = {} } = body;

    if (!report_id) {
      return badRequest('report_id is required');
    }

    if (!['pdf', 'csv', 'xlsx'].includes(format)) {
      return badRequest('format must be one of: pdf, csv, xlsx');
    }

    // Fetch report definition
    const { data: report, error: fetchError } = await supabase
      .from('report_definitions')
      .select('*')
      .eq('id', report_id)
      .single();

    if (fetchError || !report) {
      return notFound('Report definition');
    }

    // Execute the report query to get data
    const dataSource = report.data_source as string;
    let reportData: Record<string, unknown>[] = [];

    if (dataSource) {
      const { data, error: queryError } = await supabase
        .from(dataSource)
        .select('*')
        .limit(10000);

      if (queryError) {
        return supabaseError(queryError);
      }
      reportData = (data || []) as Record<string, unknown>[];
    }

    // Apply filters
    const filteredData = reportData.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        return row[key] === value;
      });
    });

    // Generate export based on format
    let content: string;
    let contentType: string;
    let filename: string;

    const reportName = (report.name as string || 'report').replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv': {
        if (filteredData.length === 0) {
          content = '';
        } else {
          const headers = Object.keys(filteredData[0]);
          const csvRows = [
            headers.join(','),
            ...filteredData.map(row =>
              headers.map(h => {
                const val = row[h];
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
        const headers = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];
        const xmlRows = filteredData.map(row =>
          `<Row>${headers.map(h => {
            const val = row[h];
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
        const headers = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];
        const tableRows = filteredData.map(row =>
          `<tr>${headers.map(h => `<td style="border:1px solid #ddd;padding:6px">${row[h] ?? ''}</td>`).join('')}</tr>`
        ).join('\n');

        content = `<!DOCTYPE html>
<html>
<head><title>${report.name}</title>
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
  <h1>${report.name}</h1>
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
      organization_id: report.organization_id,
      user_id: user.id,
      action: 'report_exported',
      entity_type: 'report_definition',
      entity_id: report_id,
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
    console.error('[API] Report export error:', e);
    return serverError('Failed to export report');
  }
}
