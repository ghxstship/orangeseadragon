import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/venues/:id/populate-crew
 * 
 * Auto-populate crew resource bookings from venue crew requirement templates.
 * Creates placeholder bookings for each required role/quantity.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: venueId } = await params;
    const { project_id, organization_id } = await request.json();

    if (!project_id || !organization_id) {
      return badRequest('project_id and organization_id are required');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Stale Supabase types; function exists in migration 00087
    const { data, error } = await (supabase as any).rpc('auto_populate_crew_from_venue', {
      p_project_id: project_id,
      p_venue_id: venueId,
      p_organization_id: organization_id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ bookings_created: data }, {
      message: `Created ${data} placeholder booking(s) from venue requirements`,
    });
  } catch (error) {
    console.error('Error populating crew from venue:', error);
    return serverError();
  }
}
