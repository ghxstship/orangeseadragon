import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, badRequest, notFound, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await request.json();
    const { eventId, latitude, longitude, accuracy, notes, photoUrl, deviceId } = body;

    // Get employee profile for current user
    const { data: employee, error: employeeError } = await supabase
      .from('employee_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (employeeError || !employee) {
      return notFound('Employee profile');
    }

    // Check for existing active time entry
    const { data: existingEntry } = await supabase
      .from('time_entries')
      .select('id')
      .eq('employee_id', employee.id)
      .is('clock_out_time', null)
      .eq('status', 'active')
      .single();

    if (existingEntry) {
      return badRequest('Already clocked in. Please clock out first.');
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

    // Determine status based on geofence
    const isWithinGeofence = geofenceData?.is_within ?? null;
    const punchStatus = isWithinGeofence === false ? 'flagged' : 'approved';

    // Create time punch
    const { data: punch, error: punchError } = await supabase
      .from('time_punches')
      .insert({
        tenant_id: employee.tenant_id,
        employee_id: employee.id,
        event_id: eventId || null,
        punch_type: 'clock_in',
        punch_time: new Date().toISOString(),
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
      captureError(punchError, 'api.time-punches.clock-in.error');
      return serverError('Failed to clock in');
    }

    // Create time entry
    const { data: entry, error: entryError } = await supabase
      .from('time_entries')
      .insert({
        tenant_id: employee.tenant_id,
        employee_id: employee.id,
        event_id: eventId || null,
        clock_in_punch_id: punch.id,
        clock_in_time: punch.punch_time,
        status: 'active',
      })
      .select(`
        id,
        clock_in_time,
        event:events(name, venue:locations(name))
      `)
      .single();

    if (entryError) {
      captureError(entryError, 'api.time-punches.clock-in.error');
      return serverError('Failed to create time entry');
    }

    return apiCreated({
      id: entry.id,
      clockInTime: entry.clock_in_time,
      eventName: (entry.event as { name?: string; venue?: { name?: string } })?.name,
      venueName: (entry.event as { name?: string; venue?: { name?: string } })?.venue?.name,
      isWithinGeofence,
      punchId: punch.id,
    });
  } catch (error) {
    captureError(error, 'api.time-punches.clock-in.error');
    return serverError('Failed to clock in');
  }
}
