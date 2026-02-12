'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import {
  Package,
  CheckCircle,
  Truck,
  Wrench,
  BookOpen,
  Boxes,
  MapPin,
  CalendarCheck,
  ChevronRight,
  RefreshCw,
  Activity,
  BarChart3,
} from 'lucide-react';

interface NavCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function NavCard({ href, icon: Icon, title, description }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer hover:bg-accent/50 transition-all border-border h-full">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AssetsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
            <p className="text-muted-foreground">Equipment & logistics management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push('/assets/catalog')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Catalog
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        <StatGrid columns={4}>
          <StatCard title="Total Assets" value="1,247" icon={Package} />
          <StatCard title="Available" value="892" icon={CheckCircle} description="71% utilization" />
          <StatCard title="Deployed" value="355" icon={Truck} />
          <StatCard title="In Maintenance" value="23" icon={Wrench} trend={{ value: 3, isPositive: false }} description="from last week" />
        </StatGrid>

        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Access</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <NavCard href="/assets/catalog" icon={BookOpen} title="Catalog" description="Equipment catalog (Uline-style SSOT)" />
            <NavCard href="/assets/inventory" icon={Boxes} title="Inventory" description="Physical asset instances" />
            <NavCard href="/assets/locations" icon={MapPin} title="Locations" description="Warehouses, bins & staging areas" />
            <NavCard href="/assets/reservations" icon={CalendarCheck} title="Reservations" description="Book and track equipment" />
            <NavCard href="/assets/maintenance" icon={Wrench} title="Maintenance" description="Repairs and scheduled service" />
            <NavCard href="/assets/logistics" icon={Truck} title="Logistics" description="Shipments, vehicles & deployment" />
            <NavCard href="/assets/status" icon={Activity} title="Status" description="Real-time asset tracking" />
            <NavCard href="/assets/deployment" icon={Package} title="Deployment" description="Deploy assets to events" />
            <NavCard href="/assets/advances" icon={BarChart3} title="Reports" description="Asset utilization analytics" />
          </div>
        </div>
      </div>
    </div>
  );
}
