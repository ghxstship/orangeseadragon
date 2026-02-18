import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { latitude, longitude, accuracy, notes, photoUrl, deviceId } = body;

    // Get employee profile for current user
    const { data: employee, error: employeeError } = await supabase
      .from('employee_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (employeeError || !employee) {
      return notFound('Employee profile');
    }

    // Find active time entry
    const { data: entry, error: entryError } = await supabase
      .from('time_entries')
      .select('id, event_id, shift_id, clock_in_time')
      .eq('employee_id', employee.id)
      .is('clock_out_time', null)
      .eq('status', 'active')
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .single();

    if (entryError || !entry) {
      return badRequest('Not clocked in. Please clock in first.');
    }

    // Find nearest geofence if coordinates provided
    let geofenceData = null;
    if (latitude && longitude) {
      const { data: geofence } = await supabase.rpc('get_nearest_geofence', {
        p_tenant_id: employee.tenant_id,
        p_latitude: latitude,
        p_longitude: longitude,
      });
      if (geofence && geofence.length > 0) {
        geofenceData = geofence[0];
      }
    }

    const isWithinGeofence = geofenceData?.is_within ?? null;
    const punchStatus = isWithinGeofence === false ? 'flagged' : 'approved';
    const clockOutTime = new Date();

    // Create clock out punch
    const { data: punch, error: punchError } = await supabase
      .from('time_punches')
      .insert({
        tenant_id: employee.tenant_id,
        employee_id: employee.id,
        event_id: entry.event_id,
        shift_id: entry.shift_id,
        punch_type: 'clock_out',
        punch_time: clockOutTime.toISOString(),
        latitude,
        longitude,
        accuracy_meters: accuracy,
        venue_id: geofenceData?.venue_id || null,
        geofence_id: geofenceData?.geofence_id || null,
        is_within_geofence: isWithinGeofence,
        distance_from_geofence_meters: geofenceData?.distance_meters || null,
        photo_url: photoUrl,
        device_id: deviceId,
        device_type: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'web',
        notes,
        status: punchStatus,
      })
      .select()
      .single();

    if (punchError) {
      captureError(punchError, 'api.time-punches.clock-out.error');
      return serverError('Failed to clock out');
    }

    // Calculate break minutes
    const { data: breaks } = await supabase
      .from('break_records')
      .select('duration_minutes')
      .eq('time_entry_id', entry.id);

    const breakMinutes = breaks?.reduce((sum, b) => sum + (b.duration_minutes || 0), 0) || 0;

    // Calculate total minutes
    const clockInTime = new Date(entry.clock_in_time);
    const totalMinutes = Math.round((clockOutTime.getTime() - clockInTime.getTime()) / 60000) - breakMinutes;

    // Update time entry
    const { error: updateError } = await supabase
      .from('time_entries')
      .update({
        clock_out_punch_id: punch.id,
        clock_out_time: clockOutTime.toISOString(),
        break_minutes: breakMinutes,
        total_minutes: totalMinutes,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);

    if (updateError) {
      captureError(updateError, 'api.time-punches.clock-out.error');
      return serverError('Failed to complete clock out');
    }

    return apiSuccess({
      totalMinutes,
      breakMinutes,
      clockInTime: entry.clock_in_time,
      clockOutTime: clockOutTime.toISOString(),
    });
  } catch (error) {
    captureError(error, 'api.time-punches.clock-out.error');
    return serverError('Failed to clock out');
  }
}
