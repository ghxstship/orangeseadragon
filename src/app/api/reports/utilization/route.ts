import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

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
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00088
    const rpcParams: Record<string, unknown> = {
      p_organization_id: organizationId,
    };
    if (startDate) rpcParams.p_start_date = startDate;
    if (endDate) rpcParams.p_end_date = endDate;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('report_billable_utilization', rpcParams);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error fetching utilization report:', error);
    return serverError();
  }
}
