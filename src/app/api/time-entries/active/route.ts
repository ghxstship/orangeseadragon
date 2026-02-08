import { requireAuth } from '@/lib/api/guard';
import { apiSuccess, serverError } from '@/lib/api/response';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Get employee profile for current user
    const { data: employee } = await supabase
      .from('employee_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!employee) {
      return apiSuccess(null);
    }

    // Find active time entry
    const { data: entry } = await supabase
      .from('time_entries')
      .select(`
        id,
        clock_in_time,
        event_id,
        shift_id,
        status,
        event:events(name, venue:venues(name)),
        clock_in_punch:time_punches!clock_in_punch_id(is_within_geofence)
      `)
      .eq('employee_id', employee.id)
      .is('clock_out_time', null)
      .eq('status', 'active')
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .single();

    if (!entry) {
      return apiSuccess(null);
    }

    // Check if currently on break
    const { data: activeBreak } = await supabase
      .from('break_records')
      .select('id')
      .eq('time_entry_id', entry.id)
      .is('break_end_time', null)
      .single();

    const event = entry.event as { name?: string; venue?: { name?: string } } | null;
    const clockInPunch = entry.clock_in_punch as { is_within_geofence?: boolean } | null;

    return apiSuccess({
      id: entry.id,
      clockInTime: entry.clock_in_time,
      eventId: entry.event_id,
      eventName: event?.name,
      venueName: event?.venue?.name,
      isWithinGeofence: clockInPunch?.is_within_geofence,
      isOnBreak: !!activeBreak,
    });
  } catch (error) {
    console.error('Error fetching active entry:', error);
    return serverError('Failed to fetch active time entry');
  }
}
