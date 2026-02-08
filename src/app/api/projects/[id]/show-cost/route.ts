import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * GET /api/projects/:id/show-cost
 * 
 * Real-time show-cost dashboard data for a project.
 * Returns budget overview, labor costs, crew status, expenses,
 * overtime alerts, revenue tracking, and profit calculations.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00088
    const { data, error } = await (supabase as any).rpc('report_show_cost_realtime', {
      p_project_id: projectId,
      p_organization_id: organizationId,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data?.[0] || data);
  } catch (error) {
    console.error('Error fetching show cost data:', error);
    return serverError();
  }
}
