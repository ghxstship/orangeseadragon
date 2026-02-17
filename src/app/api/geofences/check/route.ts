// /app/api/geofences/check/route.ts
// Check if a location is within any configured geofence

import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, badRequest, serverError } from '@/lib/api/response';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { latitude, longitude } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return badRequest('latitude and longitude are required as numbers');
    }

    const { data: geofences, error } = await supabase
      .from('geofences')
      .select('id, name, latitude, longitude, radius_meters, location_type');

    if (error) return supabaseError(error);

    // Check which geofences contain the point (Haversine distance)
    const matches = (geofences || []).filter((fence) => {
      const R = 6371000; // Earth radius in meters
      const dLat = ((fence.latitude - latitude) * Math.PI) / 180;
      const dLon = ((fence.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((fence.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= (fence.radius_meters || 100);
    });

    return apiSuccess({
      inside: matches.length > 0,
      matches: matches.map((m) => ({ id: m.id, name: m.name, type: m.location_type })),
    });
  } catch (err) {
    captureError(err, 'api.geofences.check.error');
    return serverError('Failed to check geofence');
  }
}
