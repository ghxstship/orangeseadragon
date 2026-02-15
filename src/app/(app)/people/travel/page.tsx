'use client';

import { MapView, MapMarker } from '@/components/views/map-view';
import { PageShell } from '@/components/common/page-shell';

// Mock data for Global Mobility
const STAFF_LOCATIONS: MapMarker[] = [
  {
    id: 'm1',
    latitude: 40.7128,
    longitude: -74.0060,
    title: 'New York Office',
    description: 'Headquarters - 45 Active Staff',
    type: 'person',
    color: 'hsl(var(--marker-asset))'
  },
  {
    id: 'm2',
    latitude: 51.5074,
    longitude: -0.1278,
    title: 'London Hub',
    description: 'EMEA Operations - 12 Active Staff',
    type: 'person',
    color: 'hsl(var(--marker-person))'
  },
  {
    id: 'm3',
    latitude: 35.6762,
    longitude: 139.6503,
    title: 'Tokyo Team',
    description: 'APAC Expansion - 8 Active Staff',
    type: 'person',
    color: 'hsl(var(--marker-event))'
  },
  {
    id: 'm4',
    latitude: 34.0522,
    longitude: -118.2437,
    title: 'LA Production Site',
    description: 'On-location filming crew - 28 Staff',
    type: 'event', // Using event type for site
    color: 'hsl(var(--chart-expense))'
  }
];

export default function TravelPage() {
  return (
    <PageShell
      title="Global Mobility"
      description="Real-time staff location and travel tracking"
      contentPadding={false}
    >
      <div className="m-4 h-full overflow-hidden rounded-xl border sm:m-6">
        <MapView
          markers={STAFF_LOCATIONS}
          title="Global Workforce"
          zoom={2}
          center={{ lat: 20, lng: 0 }} // Center on Atlantic to show global view
        />
      </div>
    </PageShell>
  );
}
