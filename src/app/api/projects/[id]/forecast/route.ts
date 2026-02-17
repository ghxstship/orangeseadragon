import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * GET /api/projects/:id/forecast
 * 
 * Financial forecast for a project based on historical trends.
 * Returns monthly projections with confidence levels.
 * 
 * POST /api/projects/:id/forecast
 * 
 * Compare budget scenarios (optimistic/baseline/pessimistic).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const months = parseInt(searchParams.get('months') || '3', 10);

    if (!organizationId) {
      return badRequest('organization_id is required');
    }

    const { data, error } = await supabase.rpc('forecast_project_financials', {
      p_project_id: projectId,
      p_organization_id: organizationId,
      p_forecast_months: months,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.projects.id.forecast.error');
    return serverError('Failed to process project forecast');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: projectId } = await params;
    const { organization_id, scenarios } = await request.json();

    if (!organization_id) {
      return badRequest('organization_id is required');
    }

    const { data, error } = await supabase.rpc('compare_budget_scenarios', {
      p_project_id: projectId,
      p_organization_id: organization_id,
      ...(scenarios ? { p_scenarios: JSON.stringify(scenarios) } : {}),
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.projects.id.forecast.error');
    return serverError('Failed to process project forecast');
  }
}
