'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/lib/layouts';
import type { WorkspaceLayoutConfig } from '@/lib/layouts/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Package,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface StorageZone {
  id: string;
  name: string;
  type: 'rack' | 'floor' | 'cage' | 'outdoor';
  capacity: number;
  used: number;
  items: { name: string; category: string; status: string }[];
}

const zones: StorageZone[] = [
  { id: 'z1', name: 'Rack A — Audio', type: 'rack', capacity: 50, used: 38, items: [
    { name: 'QSC K12.2 (x8)', category: 'Audio', status: 'available' },
    { name: 'Yamaha TF5', category: 'Audio', status: 'available' },
    { name: 'Shure ULXD4Q (x4)', category: 'Audio', status: 'reserved' },
  ]},
  { id: 'z2', name: 'Rack B — Lighting', type: 'rack', capacity: 60, used: 52, items: [
    { name: 'ETC Source Four (x24)', category: 'Lighting', status: 'available' },
    { name: 'Martin MAC Aura (x12)', category: 'Lighting', status: 'deployed' },
    { name: 'GrandMA3 Compact', category: 'Lighting', status: 'available' },
  ]},
  { id: 'z3', name: 'Floor — Staging', type: 'floor', capacity: 30, used: 18, items: [
    { name: 'StageRight 4x8 Decks (x20)', category: 'Staging', status: 'available' },
    { name: 'Legs 32" (x40)', category: 'Staging', status: 'available' },
    { name: 'Skirting Black (200ft)', category: 'Staging', status: 'available' },
  ]},
  { id: 'z4', name: 'Cage — High Value', type: 'cage', capacity: 20, used: 14, items: [
    { name: 'Panasonic PT-RZ120 (x2)', category: 'Video', status: 'available' },
    { name: 'Barco E2 Switcher', category: 'Video', status: 'deployed' },
    { name: 'Camera Kit (Sony FX6)', category: 'Video', status: 'maintenance' },
  ]},
  { id: 'z5', name: 'Outdoor — Truss & Rigging', type: 'outdoor', capacity: 40, used: 28, items: [
    { name: 'Thomas 12" Box Truss (200ft)', category: 'Rigging', status: 'available' },
    { name: 'CM Lodestar 1T (x8)', category: 'Rigging', status: 'available' },
    { name: 'Spansets & Shackles Kit', category: 'Rigging', status: 'available' },
  ]},
];

const statusColors: Record<string, string> = {
  available: 'bg-emerald-500 dark:bg-emerald-400',
  reserved: 'bg-amber-500 dark:bg-amber-400',
  deployed: 'bg-primary',
  maintenance: 'bg-destructive',
};

export default function WarehouseMapPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('map');
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);

  const filteredZones = zones.filter((z) =>
    !search || z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activeZone = zones.find((z) => z.id === selectedZone);

  const config: WorkspaceLayoutConfig = {
    title: 'Warehouse Map',
    icon: 'Warehouse',
    tabs: [
      { key: 'map', label: 'Map View' },
      { key: 'list', label: 'Zone List' },
    ],
  };

  const sidebarContent = (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {activeZone ? (
        <div>
          <button onClick={() => setSelectedZone(null)} className="text-xs text-primary mb-3 hover:underline">
            ← All Zones
          </button>
          <h3 className="text-sm font-semibold mb-2">{activeZone.name}</h3>
          <div className="text-xs text-muted-foreground mb-3">
            {activeZone.used}/{activeZone.capacity} slots used
          </div>
          <div className="space-y-2">
            {activeZone.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <div className={`h-2 w-2 rounded-full ${statusColors[item.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.category}</p>
                </div>
                <Badge variant="secondary" className="text-[9px]">{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3">Legend</h3>
          <div className="space-y-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-xs capitalize">{status}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3 mt-6">Low Stock Alerts</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs">Gaffer tape — 2 rolls remaining</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
              <span className="text-xs">XLR 50ft — 0 available</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <WorkspaceLayout
      config={config}
      currentTab={activeTab}
      onTabChange={setActiveTab}
      onBack={() => router.push('/assets')}
      sidebarContent={sidebarContent}
    >
      {activeTab === 'map' && (
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone) => {
              const utilization = Math.round((zone.used / zone.capacity) * 100);
              const isHigh = utilization > 85;
              return (
                <Card
                  key={zone.id}
                  className={`cursor-pointer transition-colors hover:border-primary/50 ${selectedZone === zone.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isHigh ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isHigh ? 'text-destructive' : ''}`}>{utilization}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{zone.used}/{zone.capacity} slots</span>
                      <div className="flex gap-1">
                        {zone.items.slice(0, 3).map((item, i) => (
                          <div key={i} className={`h-1.5 w-1.5 rounded-full ${statusColors[item.status]}`} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="p-6">
          <div className="space-y-4">
            {filteredZones.map((zone) => (
              <Card key={zone.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold">{zone.name}</h3>
                      <p className="text-xs text-muted-foreground">{zone.used}/{zone.capacity} slots &middot; {zone.type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {zone.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <div className={`h-2 w-2 rounded-full ${statusColors[item.status]}`} />
                        <span className="text-xs flex-1 truncate">{item.name}</span>
                        <Badge variant="secondary" className="text-[9px]">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
