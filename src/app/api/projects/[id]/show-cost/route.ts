import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

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
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    const { data, error } = await supabase.rpc('report_show_cost_realtime', {
      p_project_id: projectId,
      p_organization_id: organizationId,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data?.[0] || data);
  } catch (error) {
    captureError(error, 'api.projects.id.show-cost.error');
    return serverError('Failed to load show cost data');
  }
}
