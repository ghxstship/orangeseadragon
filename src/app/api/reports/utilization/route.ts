import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/utilization
 * 
 * Billable hours utilization report for an organization.
 * Returns per-user breakdown of billable vs non-billable hours,
 * utilization rate, margin, and capacity utilization.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    const { data, error } = await supabase.rpc('report_billable_utilization', {
      p_organization_id: organizationId,
      ...(startDate ? { p_start_date: startDate } : {}),
      ...(endDate ? { p_end_date: endDate } : {}),
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.reports.utilization.error');
    return serverError('Failed to load utilization report');
  }
}
