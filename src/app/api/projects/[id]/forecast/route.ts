import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

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
  const auth = await requireAuth();
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00088
    const { data, error } = await (supabase as any).rpc('forecast_project_financials', {
      p_project_id: projectId,
      p_organization_id: organizationId,
      p_forecast_months: months,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return serverError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { id: projectId } = await params;
    const { organization_id, scenarios } = await request.json();

    if (!organization_id) {
      return badRequest('organization_id is required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00088
    const rpcParams: Record<string, unknown> = {
      p_project_id: projectId,
      p_organization_id: organization_id,
    };
    if (scenarios) rpcParams.p_scenarios = JSON.stringify(scenarios);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('compare_budget_scenarios', rpcParams);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error('Error comparing scenarios:', error);
    return serverError();
  }
}
