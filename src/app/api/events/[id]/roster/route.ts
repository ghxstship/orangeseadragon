import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';

/**
 * POST /api/events/[id]/roster
 * Generate a day-of roster from confirmed crew bookings for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { roster_date } = body;

    if (!roster_date) {
      return badRequest('roster_date is required');
    }

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, organization_id')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return notFound('Event');
    }

    // Check for existing roster on this date
    const { data: existing } = await supabase
      .from('day_of_rosters')
      .select('id')
      .eq('event_id', id)
      .eq('roster_date', roster_date)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      return badRequest('A roster already exists for this date. Delete or update the existing one.', {
        existing_roster_id: existing.id,
      });
    }

    // Create the roster
    const { data: roster, error: rosterError } = await supabase
      .from('day_of_rosters')
      .insert({
        organization_id: event.organization_id,
        event_id: id,
        roster_date,
        status: 'draft',
        generated_by: user.id,
      })
      .select()
      .single();

    if (rosterError) {
      return supabaseError(rosterError);
    }

    // Fetch confirmed crew bookings for this event
    const { data: bookings } = await supabase
      .from('resource_bookings')
      .select(`
        id,
        user_id,
        role,
        department,
        start_time,
        end_time,
        notes,
        user:auth_users_view(email)
      `)
      .eq('event_id', id)
      .eq('status', 'confirmed')
      .not('user_id', 'is', null);

    // Create roster entries from bookings
    if (bookings && bookings.length > 0) {
      const entries = bookings.map((booking: Record<string, unknown>) => ({
        roster_id: roster.id,
        user_id: booking.user_id,
        role: booking.role || 'crew',
        department: booking.department || null,
        call_time: booking.start_time || '08:00',
        wrap_time: booking.end_time || null,
        notes: booking.notes || null,
      }));

      await supabase.from('day_of_roster_entries').insert(entries);
    }

    // Fetch the complete roster with entries
    const { data: completeRoster } = await supabase
      .from('day_of_rosters')
      .select(`
        *,
        entries:day_of_roster_entries(*)
      `)
      .eq('id', roster.id)
      .single();

    // Audit log
    await supabase.from('audit_logs').insert({
      organization_id: event.organization_id,
      user_id: user.id,
      action: 'day_of_roster_generated',
      entity_type: 'day_of_roster',
      entity_id: roster.id,
      new_values: {
        event_id: id,
        roster_date,
        entry_count: bookings?.length || 0,
      },
    });

    return apiCreated(completeRoster, {
      entry_count: bookings?.length || 0,
      message: 'Day-of roster generated successfully',
    });
  } catch (e) {
    console.error('[API] Roster generation error:', e);
    return serverError('Failed to generate roster');
  }
}

/**
 * GET /api/events/[id]/roster
 * List rosters for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from('day_of_rosters')
      .select(`
        *,
        entries:day_of_roster_entries(*)
      `)
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('roster_date', { ascending: false });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data || []);
  } catch (e) {
    console.error('[API] Roster list error:', e);
    return serverError('Failed to list rosters');
  }
}
