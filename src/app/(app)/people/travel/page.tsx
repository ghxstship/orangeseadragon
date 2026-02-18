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
          .from('venues')
          .select('id, name, city, latitude, longitude')
          .eq('organization_id', orgId)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .limit(50);

        const mapped: MapMarker[] = (venues ?? []).map((v) => ({
          id: v.id,
          latitude: Number(v.latitude),
          longitude: Number(v.longitude),
          title: v.name ?? 'Unnamed Venue',
          description: v.city ?? '',
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
