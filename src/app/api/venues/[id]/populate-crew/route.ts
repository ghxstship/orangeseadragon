import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

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
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { id: venueId } = await params;
    const { project_id, organization_id } = await request.json();

    if (!project_id || !organization_id) {
      return badRequest('project_id and organization_id are required');
    }

    const { data, error } = await supabase.rpc('auto_populate_crew_from_venue', {
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
    captureError(error, 'api.venues.id.populate-crew.error');
    return serverError('Failed to populate crew for venue');
  }
}
