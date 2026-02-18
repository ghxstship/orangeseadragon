import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

/**
 * POST /api/venues/[id]/holds
 * Create a tentative hold on a venue for specific dates.
 * Supports first/second/third hold with expiration.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { hold_type, start_date, end_date, expires_at, notes, event_id } = body;

    if (!hold_type || !['first', 'second', 'third'].includes(hold_type)) {
      return badRequest('hold_type must be one of: first, second, third');
    }
    if (!start_date || !end_date) {
      return badRequest('start_date and end_date are required');
    }

    // Verify venue exists (venues are now locations with location_type='venue')
    const { data: venue, error: venueError } = await supabase
      .from('locations')
      .select('id, name, organization_id')
      .eq('id', id)
      .single();

    if (venueError || !venue) {
      return notFound('Venue');
    }

    // Check for conflicting holds on the same dates
    const { data: conflicts } = await supabase
      .from('venue_holds')
      .select('id, hold_type, status')
      .eq('venue_id', id)
      .eq('status', 'active')
      .lte('start_date', end_date)
      .gte('end_date', start_date)
      .is('deleted_at', null);

    // A first hold blocks second/third; second blocks third
    const holdPriority: Record<string, number> = { first: 1, second: 2, third: 3 };
    const requestedPriority = holdPriority[hold_type];

    const blockingHold = conflicts?.find(
      (c: Record<string, unknown>) => (holdPriority[c.hold_type as string] ?? 0) <= (requestedPriority ?? 0)
    );

    if (blockingHold) {
      return badRequest(`A ${blockingHold.hold_type} hold already exists for these dates`, {
        conflicting_hold_id: blockingHold.id,
      });
    }

    const { data: hold, error: insertError } = await supabase
      .from('venue_holds')
      .insert({
        organization_id: venue.organization_id,
        venue_id: id,
        event_id: event_id || null,
        hold_type,
        start_date,
        end_date,
        expires_at: expires_at || null,
        notes: notes || null,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      return supabaseError(insertError);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: venue.organization_id,
      user_id: user.id,
      action: 'venue_hold_created',
      entity_type: 'venue_hold',
      entity_id: hold.id,
      new_values: { venue_id: id, hold_type, start_date, end_date },
    });

    return apiCreated(hold, { message: `${hold_type} hold placed on ${venue.name}` });
  } catch (e) {
    captureError(e, 'api.venues.id.holds.error');
    return serverError('Failed to create venue hold');
  }
}

/**
 * GET /api/venues/[id]/holds
 * List all holds for a venue, optionally filtered by status or date range.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('venue_holds')
      .select('*')
      .eq('venue_id', id)
      .is('deleted_at', null)
      .order('start_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.gte('end_date', from);
    }
    if (to) {
      query = query.lte('start_date', to);
    }

    const { data, error } = await query;

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    captureError(e, 'api.venues.id.holds.error');
    return serverError('Failed to list venue holds');
  }
}

/**
 * PATCH /api/venues/[id]/holds
 * Convert a hold (e.g., promote first→confirmed, release, or expire).
 * Expects { hold_id, action } in body where action is 'confirm' | 'release' | 'expire'.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { hold_id, action } = body;

    if (!hold_id || !action) {
      return badRequest('hold_id and action are required');
    }

    const validActions = ['confirm', 'release', 'expire'];
    if (!validActions.includes(action)) {
      return badRequest(`action must be one of: ${validActions.join(', ')}`);
    }

    const statusMap: Record<string, string> = {
      confirm: 'converted',
      release: 'released',
      expire: 'expired',
    };

    const { data: hold, error: fetchError } = await supabase
      .from('venue_holds')
      .select('*, location:locations(organization_id)')
      .eq('id', hold_id)
      .eq('venue_id', id)
      .single();

    if (fetchError || !hold) {
      return notFound('Venue hold');
    }

    const { data: updated, error: updateError } = await supabase
      .from('venue_holds')
      .update({
        status: statusMap[action],
        converted_to_booking_at: action === 'confirm' ? new Date().toISOString() : null,
      })
      .eq('id', hold_id)
      .select()
      .single();

    if (updateError) {
      return supabaseError(updateError);
    }

    const orgId = (hold.location as Record<string, unknown>)?.organization_id as string;

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: `venue_hold_${action}ed`,
      entity_type: 'venue_hold',
      entity_id: hold_id,
      previous_values: { status: hold.status },
      new_values: { status: statusMap[action] },
    });

    return apiSuccess(updated, { message: `Hold ${action}ed successfully` });
  } catch (e) {
    captureError(e, 'api.venues.id.holds.error');
    return serverError('Failed to update venue hold');
  }
}
