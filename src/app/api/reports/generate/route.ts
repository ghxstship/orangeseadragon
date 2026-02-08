import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/reports/generate
 * 
 * Generate a report snapshot from a report definition.
 * Executes the configured data source query and stores the result.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {

    const { report_definition_id, date_range_start, date_range_end } = await request.json();

    if (!report_definition_id) {
      return badRequest('report_definition_id is required');
    }

    // Fetch the report definition
    const { data: reportDef, error: fetchError } = await supabase
      .from('report_definitions')
      .select('*')
      .eq('id', report_definition_id)
      .single();

    if (fetchError || !reportDef) {
      return notFound('Report definition');
    }

    // Execute the appropriate pre-built function based on category
    let reportData = null;
    let reportError = null;

    const orgId = reportDef.organization_id;
    const startDate = date_range_start || reportDef.default_date_range_start;
    const endDate = date_range_end || reportDef.default_date_range_end || new Date().toISOString();

    switch (reportDef.data_source) {
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
        // Generic query against the data_source table
        const { data, error } = await supabase
          .from(reportDef.data_source)
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1000);
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
        report_definition_id,
        generated_by: user.id,
        data: reportData,
        row_count: Array.isArray(reportData) ? reportData.length : 0,
        parameters: {
          date_range_start: startDate,
          date_range_end: endDate,
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
      report_name: reportDef.name,
      row_count: Array.isArray(reportData) ? reportData.length : 0,
      generated_at: snapshot.created_at,
      results: reportData,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return serverError();
  }
}
