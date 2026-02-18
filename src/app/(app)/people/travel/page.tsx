'use client';

import { useState, useEffect } from 'react';
import { MapView, MapMarker } from '@/components/views/map-view';
import { PageShell } from '@/components/common/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/auth/use-supabase';
import { createClient } from '@/lib/supabase/client';
import { captureError } from '@/lib/observability';

export default function TravelPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }

    const fetchLocations = async () => {
      try {
        const supabase = createClient();
        const { data: venues } = await supabase
          .from('locations')
          .select('id, name, legacy_city, address:addresses(city, latitude, longitude), legacy_latitude, legacy_longitude')
          .eq('organization_id', orgId)
          .eq('location_type', 'venue')
          .limit(50);

        const mapped: MapMarker[] = (venues ?? [])
          .filter((v) => (v.address?.latitude ?? v.legacy_latitude) != null)
          .map((v) => ({
          id: v.id,
          latitude: Number(v.address?.latitude ?? v.legacy_latitude),
          longitude: Number(v.address?.longitude ?? v.legacy_longitude),
          title: v.name ?? 'Unnamed Venue',
          description: v.address?.city ?? v.legacy_city ?? '',
          type: 'event' as const,
          color: 'hsl(var(--marker-event))',
        }));

        setMarkers(mapped);
      } catch (err) {
        captureError(err, 'travel.fetchLocations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [orgId]);

  return (
    <PageShell
      title="Global Mobility"
      description="Real-time staff location and travel tracking"
      contentPadding={false}
    >
      <div className="m-4 h-full overflow-hidden rounded-xl border sm:m-6">
        {loading ? (
          <Skeleton className="h-[500px] w-full" />
        ) : (
          <MapView
            markers={markers}
            title="Global Workforce"
            zoom={2}
            center={{ lat: 20, lng: 0 }}
          />
        )}
      </div>
    </PageShell>
  );
}
