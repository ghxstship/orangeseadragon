'use client';

import { MapView, MapMarker } from '@/components/views/map-view';

// Mock data for Global Mobility
const STAFF_LOCATIONS: MapMarker[] = [
  {
    id: 'm1',
    latitude: 40.7128,
    longitude: -74.0060,
    title: 'New York Office',
    description: 'Headquarters - 45 Active Staff',
    type: 'person',
    color: '#10b981'
  },
  {
    id: 'm2',
    latitude: 51.5074,
    longitude: -0.1278,
    title: 'London Hub',
    description: 'EMEA Operations - 12 Active Staff',
    type: 'person',
    color: '#8b5cf6'
  },
  {
    id: 'm3',
    latitude: 35.6762,
    longitude: 139.6503,
    title: 'Tokyo Team',
    description: 'APAC Expansion - 8 Active Staff',
    type: 'person',
    color: '#f59e0b'
  },
  {
    id: 'm4',
    latitude: 34.0522,
    longitude: -118.2437,
    title: 'LA Production Site',
    description: 'On-location filming crew - 28 Staff',
    type: 'event', // Using event type for site
    color: '#ef4444'
  }
];

export default function TravelPage() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Global Mobility</h2>
          <p className="text-muted-foreground">Real-time staff location and travel tracking</p>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
        <MapView
          markers={STAFF_LOCATIONS}
          title="Global Workforce"
          zoom={2}
          center={{ lat: 20, lng: 0 }} // Center on Atlantic to show global view
        />
      </div>
    </div>
  );
}
